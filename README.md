# TransFluxo

Marketplace logistico que conecta empresas a transportadores verificados para
publicacao de demandas, propostas, acompanhamento de entregas e reputacao.

## Executar localmente

```bash
npm install
npm run build
```

O prototipo principal esta em `index.html`. Os perfis demonstrativos continuam
disponiveis offline, enquanto cadastros reais utilizam Supabase Auth.

## Integracoes

- Supabase Auth e Postgres com RLS.
- Storage privado para documentos cadastrais.
- GitHub Actions para validar o build.
- PWA com funcionamento offline para o modo demonstracao.

Consulte `supabase/README.md` para o escopo da integracao e as proximas fases.
