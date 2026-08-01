import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hiuyiqoeccuorsbfziee.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pBRtp-IF2-tq7AlytV2dvA_jO9KUdyP";

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function getProfile(userId) {
  const [profileResult, documentsResult, membershipResult] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).single(),
    client.from("registration_documents").select("*").eq("profile_id", userId),
    client.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle(),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (documentsResult.error) throw documentsResult.error;
  if (membershipResult.error) throw membershipResult.error;
  return {
    ...profileResult.data,
    organization_id: membershipResult.data?.organization_id || null,
    documents: Object.fromEntries((documentsResult.data || []).map((document) => [
      document.document_type,
      {
        name: document.original_name,
        type: document.mime_type,
        size: document.file_size,
        storageKey: document.storage_path,
        uploadedAt: document.created_at,
        remote: true,
      },
    ])),
  };
}

async function uploadRegistrationDocument(documentType, file) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Sessao expirada");
  const { data: membership, error: membershipError } = await client
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (membershipError) throw membershipError;

  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${user.id}/${documentType}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await client.storage.from("registration-documents").upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await client.from("registration_documents").insert({
    profile_id: user.id,
    organization_id: membership.organization_id,
    document_type: documentType,
    storage_path: path,
    original_name: file.name,
    mime_type: file.type,
    file_size: file.size,
  }).select().single();
  if (error) {
    await client.storage.from("registration-documents").remove([path]);
    throw error;
  }
  return data;
}

async function signIn(email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { session: data.session, profile: await getProfile(data.user.id) };
}

async function signUp(payload) {
  const { data, error } = await client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        username: payload.username,
        full_name: payload.fullName,
        phone: payload.phone,
        account_type: payload.role,
        company_name: payload.companyName || payload.fullName,
        company_document: payload.companyDocument || "",
        carrier_document: payload.carrierDocument || "",
        vehicle: payload.vehicle || "",
      },
    },
  });
  if (error) throw error;
  const profile = data.session && data.user ? await getProfile(data.user.id) : null;
  return { ...data, profile };
}

async function restoreSession() {
  const { data: { session } } = await client.auth.getSession();
  if (!session) return null;
  return { session, profile: await getProfile(session.user.id) };
}

window.TransFluxoBackend = {
  client,
  enabled: true,
  getProfile,
  restoreSession,
  signIn,
  signUp,
  uploadRegistrationDocument,
  signOut: () => client.auth.signOut(),
};
