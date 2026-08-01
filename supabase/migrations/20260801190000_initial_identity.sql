create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  full_name text not null,
  phone text,
  role text not null default 'carrier' check (role in ('admin', 'company', 'carrier')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  avatar_url text,
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_unique on public.profiles (lower(email));
create unique index profiles_username_lower_unique on public.profiles (lower(username));

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  organization_type text not null check (organization_type in ('company', 'carrier')),
  legal_name text not null,
  trade_name text,
  tax_id text,
  phone text,
  email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index organizations_tax_id_unique on public.organizations (tax_id) where tax_id is not null and tax_id <> '';
create index organizations_owner_id_idx on public.organizations (owner_id);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner', 'manager', 'operator', 'driver', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.registration_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  document_type text not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text,
  file_size bigint check (file_size is null or file_size > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index profiles_reviewed_by_idx on public.profiles (reviewed_by);
create index organization_members_user_id_idx on public.organization_members (user_id);
create index registration_documents_profile_id_idx on public.registration_documents (profile_id);
create index registration_documents_organization_id_idx on public.registration_documents (organization_id);
create index registration_documents_reviewed_by_idx on public.registration_documents (reviewed_by);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and status = 'approved'
  );
$$;

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.organization_members
    where organization_id = target_organization_id and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_organization_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger organizations_set_updated_at before update on public.organizations
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  generated_username text;
  organization_id uuid;
  organization_name text;
  organization_tax_id text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'account_type' in ('company', 'carrier')
      then new.raw_user_meta_data ->> 'account_type'
    else 'carrier'
  end;
  generated_username := lower(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1))) || '-' || substr(new.id::text, 1, 6);

  insert into public.profiles (id, email, username, full_name, phone, role, status)
  values (
    new.id,
    new.email,
    generated_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    requested_role,
    'pending'
  );

  organization_name := coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1));
  organization_tax_id := nullif(coalesce(new.raw_user_meta_data ->> 'company_document', new.raw_user_meta_data ->> 'carrier_document'), '');

  insert into public.organizations (owner_id, organization_type, legal_name, trade_name, tax_id, phone, email)
  values (new.id, requested_role, organization_name, organization_name, organization_tax_id, nullif(new.raw_user_meta_data ->> 'phone', ''), new.email)
  returning id into organization_id;

  insert into public.organization_members (organization_id, user_id, member_role)
  values (organization_id, new.id, 'owner');
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.registration_documents enable row level security;

create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy organizations_select_members_or_admin on public.organizations for select to authenticated
using ((select private.is_organization_member(id)) or (select private.is_admin()));
create policy organizations_update_owner on public.organizations for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy members_select_organization on public.organization_members for select to authenticated
using ((select private.is_organization_member(organization_id)) or (select private.is_admin()));

create policy documents_select_owner_or_admin on public.registration_documents for select to authenticated
using (profile_id = (select auth.uid()) or (select private.is_admin()));
create policy documents_insert_owner on public.registration_documents for insert to authenticated
with check (profile_id = (select auth.uid()) and (organization_id is null or (select private.is_organization_member(organization_id))));
create policy documents_delete_pending_owner on public.registration_documents for delete to authenticated
using (profile_id = (select auth.uid()) and status = 'pending');

revoke all on public.profiles, public.organizations, public.organization_members, public.registration_documents from anon, authenticated;
grant select on public.profiles, public.organizations, public.organization_members, public.registration_documents to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant update (legal_name, trade_name, tax_id, phone, email) on public.organizations to authenticated;
grant insert, delete on public.registration_documents to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('registration-documents', 'registration-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy storage_documents_insert_owner on storage.objects for insert to authenticated
with check (bucket_id = 'registration-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy storage_documents_select_owner_or_admin on storage.objects for select to authenticated
using (bucket_id = 'registration-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy storage_documents_delete_owner on storage.objects for delete to authenticated
using (bucket_id = 'registration-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
