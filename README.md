# Axis

CRM/ERP multi-tenant (React + Vite no frontend, Express no backend, Supabase/Postgres como banco). Um único deploy atende vários tenants (empresas) isolados por Row Level Security.

Documentação completa em [`docs/`](docs/):

- [Arquitetura](docs/ARCHITECTURE.md) — como as peças se encaixam, fluxo de dados, multi-tenancy
- [Autenticação](docs/AUTHENTICATION.md) — login, sessão, recuperação de senha
- [Autorização](docs/AUTHORIZATION.md) — papéis, RBAC, o que é validado onde
- [API](docs/API.md) — inventário de todas as rotas de `server.ts`/`api/`
- [Banco de dados](docs/DATABASE.md) — schema, convenções de tenant_id
- [Segurança do banco](docs/DATABASE_SECURITY.md) — matriz de RLS/policies
- [Webhooks](docs/WEBHOOKS.md)
- [Variáveis de ambiente](docs/ENVIRONMENT.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Segurança](docs/SECURITY.md) — práticas do projeto, ver também [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) e [`SECURITY_CHECKLIST.md`](SECURITY_CHECKLIST.md)
- [Desenvolvimento](docs/DEVELOPMENT.md) — rodar localmente, estrutura de pastas
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Começando

**Pré-requisitos:** Node.js 20+, um projeto Supabase.

```bash
npm install
cp .env.example .env   # preencha com suas credenciais reais — nunca commite o .env
npm run dev
```

Veja [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) para o que cada variável faz e [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) para a estrutura do projeto.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o frontend (Vite) + backend (`server.ts` via `tsx`) em modo desenvolvimento |
| `npm run build` | Build de produção do frontend (`dist/`) + bundle do backend (`dist/server.cjs`) |
| `npm start` | Roda o backend já buildado (`dist/server.cjs`) |
| `npm run lint` | Type-check (`tsc --noEmit`) |
