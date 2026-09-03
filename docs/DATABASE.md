# Banco de dados

Supabase/Postgres, projeto `snwkzvgompfgqoqbpihe`. Schema `public`, ~73 tabelas. Migrações versionadas em [`supabase/migrations/`](../supabase/migrations/).

## Convenção de multi-tenant

Toda tabela de dado operacional tem uma coluna `tenant_id uuid references public.tenants(id)`. As únicas exceções são:
- `tenants` — é o próprio tenant, não pertence a um.
- `partners` / `tenant_partners` — pertencem a um parceiro (`partner_id`), que por sua vez enxerga vários tenants (ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md#partners-e-tenant_partners)).
- `user_settings` — pertence a um usuário (`user_id`), não a um tenant diretamente (o usuário já carrega seu próprio `tenant_id`).

Toda tabela nova **deve** seguir esse padrão: `tenant_id` + policy `tenant_isolation` usando `has_tenant_access(tenant_id)` (ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md)). Isso é checado por `mcp__Supabase__get_advisors` (security) depois de qualquer migração — uma tabela nova sem RLS ou sem `tenant_id` aparece lá.

## Nichos

`nichos` (`tenant_id` nullable) substitui o antigo enum fixo de "segmento de negócio". `tenant_id IS NULL` = nicho global, disponível pra qualquer tenant escolher (seed em `20260901_nichos_globais_seed.sql`); `tenant_id` preenchido = nicho customizado só daquele tenant. `tenants.niche` continua existindo (referenciado por `DashboardStatsByNiche.tsx` e outras telas) — `nichos` é o catálogo administrável, não substitui a coluna.

## Fallbacks em memória (sem tabela própria)

Algumas "entidades" de configuração não têm tabela dedicada — vivem em memória no processo do `server.ts`, isoladas por tenant via `tenantBucket()`/`current_tenant_id()`: `sources`, `custom-fields` (settings genéricos, distinto de `custom_fields` que é tabela real), `task-categories`, `templates`, e o simulador de WhatsApp (`instancesByTenant`/`contactsByTenant`/`messagesByTenant`). Isso significa que esse estado **não sobrevive a um redeploy/cold-start** da função serverless — é aceitável para dados de configuração de baixo risco, mas não deve crescer para guardar nada que precise persistir de verdade. Ver [API.md](API.md#settings-genéricos-fallback-em-memória).

`whatsapp_instances` é a exceção parcial: tem tabela real com RLS própria, e o backend tenta ler dela primeiro antes de cair no fallback em memória.

## Tabelas referenciadas no código mas ausentes do schema

`chat_messages` e `chat_contacts` são usadas por rotas do simulador de WhatsApp (`server.ts`) mas **não existem** no banco hoje — os `insert`/`select` contra elas são efetivamente no-ops (o fallback em memória é o que realmente funciona). Antes de criar essas tabelas: adicionar `tenant_id` + policy `tenant_isolation` seguindo o padrão de toda tabela nova. Ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md#tabelas-referenciadas-no-código-mas-ausentes-do-schema).

## Storage

Dois buckets, ambos `public: true` (leitura pública por URL, escrita restrita por policy):

| Bucket | Limite de tamanho | Tipos permitidos |
|---|---|---|
| `avatars` | 5 MB | png, jpeg, webp, gif |
| `proposals` | 20 MB | pdf, png, jpeg |

Escrita restrita por pasta = `tenant_id` do usuário (ver policies de storage em [DATABASE_SECURITY.md](DATABASE_SECURITY.md#storage)).

## Funções auxiliares

Ver definições completas e o que cada uma resolve em [DATABASE_SECURITY.md](DATABASE_SECURITY.md#funções-de-isolamento). Resumo: `current_tenant_id()`, `current_partner_id()`, `is_super_admin()` leem `public.users` pelo `auth.uid()` da sessão; `has_tenant_access(tenant_id)` combina as três pra decidir se o usuário logado pode ver aquele tenant (dono direto, super admin/master, ou parceiro mapeado via `tenant_partners`).

## Tipos gerados

Não há um arquivo de tipos TypeScript gerado automaticamente do schema versionado no repo hoje — os tipos usados em `src/` são escritos à mão (`src/types.ts` e afins). Gerar com `mcp__Supabase__generate_typescript_types` é seguro a qualquer momento pra conferir drift, mas isso não está automatizado em CI.
