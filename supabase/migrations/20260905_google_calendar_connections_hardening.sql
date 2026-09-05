-- google_calendar_connections nunca foi realmente usada pelo app — todo o
-- fluxo de Google Calendar era client-side, direto pro Google, sem backend
-- nem esta tabela (grep confirma zero código referenciando o nome da
-- tabela antes desta migration). Ela está vazia em produção
-- (select count(*) = 0), então dá pra corrigir o modelo sem risco de perda
-- ou migração ambígua de dados — ver regra de nunca escolher tenant/dono
-- arbitrariamente para linhas existentes.
--
-- Problemas encontrados na estrutura existente:
--
-- 1) Já existia uma policy `tenant_isolation`, mas escopada por
--    colaborador_id, resolvido via "colaboradores.user_id = auth.uid()".
--    colaboradores tem só 3 linhas em produção, 2 com user_id preenchido —
--    ou seja, quase nenhum usuário autenticado real tem uma linha
--    correspondente lá. Usar isso como a chave de segurança da conexão
--    Google quebraria a feature pra praticamente todo mundo. Trocado por
--    user_id, referenciando public.users diretamente — toda sessão
--    autenticada garantidamente tem uma linha ali (é a mesma base que
--    current_tenant_id()/is_super_admin() já usam).
--
-- 2) anon e authenticated tinham GRANT completo (SELECT/INSERT/UPDATE/DELETE,
--    e até a migration 20260905_revoke_anon_truncate também TRUNCATE) na
--    tabela — ou seja, mesmo com RLS correta, um authenticated de um tenant
--    conseguia ler as colunas cruas access_token/refresh_token de qualquer
--    linha que a RLS deixasse passar (inclusive a própria, o que já seria
--    errado — token nunca deveria chegar ao browser). A partir de agora,
--    NENHUM grant de coluna sensível existe pra anon/authenticated — só o
--    backend (service_role, que ignora grants e RLS) lê/grava token cru. O
--    frontend só enxerga status via a view google_calendar_connection_status
--    (sem colunas de token).
--
-- 3) Faltavam calendar_id e last_sync_at, necessários pro backend novo.

-- ── 1) Troca a chave de segurança de colaborador_id pra user_id ───────────
drop policy if exists tenant_isolation on public.google_calendar_connections;

alter table public.google_calendar_connections
  add column if not exists user_id uuid references public.users(id) on delete cascade;

-- Tabela vazia — sem backfill necessário. Se algum dia isso rodar com dados
-- existentes, o NOT NULL abaixo falha e aborta a migration ao invés de
-- adivinhar o dono errado.
alter table public.google_calendar_connections
  alter column user_id set not null;

alter table public.google_calendar_connections
  drop column if exists colaborador_id;

alter table public.google_calendar_connections
  add column if not exists calendar_id text not null default 'primary';

alter table public.google_calendar_connections
  add column if not exists last_sync_at timestamptz;

-- Um usuário tem no máximo uma conexão Google por tenant.
alter table public.google_calendar_connections
  drop constraint if exists google_calendar_connections_tenant_user_key;
alter table public.google_calendar_connections
  add constraint google_calendar_connections_tenant_user_key unique (tenant_id, user_id);

alter table public.google_calendar_connections
  drop constraint if exists google_calendar_connections_status_check;
alter table public.google_calendar_connections
  add constraint google_calendar_connections_status_check
  check (status in ('active','disconnected','requires_reauth','error'));

-- ── 2) RLS: só o dono da conexão no seu próprio tenant, ou super admin ─────
-- has_tenant_access() já embute is_super_admin() — o OR explícito aqui é só
-- pra liberar o super admin de também bater o user_id (ele pode enxergar
-- conexões de outros usuários pra fins de suporte, mesmo padrão de
-- users/tenants no resto do schema).
create policy tenant_isolation on public.google_calendar_connections
  for all to authenticated
  using (has_tenant_access(tenant_id) and (user_id = auth.uid() or is_super_admin()))
  with check (has_tenant_access(tenant_id) and (user_id = auth.uid() or is_super_admin()));

-- ── 3) Tokens nunca chegam a anon/authenticated ────────────────────────────
-- Revoga tudo e regrante só as colunas não-sensíveis pra authenticated —
-- access_token/refresh_token/scope continuam sem NENHUM grant pra
-- anon/authenticated, então mesmo um bug de RLS não os expõe: privilégio de
-- coluna é checado antes da RLS pelo Postgres.
revoke all on public.google_calendar_connections from anon;
revoke all on public.google_calendar_connections from authenticated;

grant select (
  id, tenant_id, user_id, google_email, status, calendar_id,
  connected_at, disconnected_at, last_sync_at, last_error, created_at, updated_at
) on public.google_calendar_connections to authenticated;

-- Escritas (connect/disconnect/refresh) só pelo backend via service_role,
-- que ignora grants e RLS — não sobra nenhum INSERT/UPDATE/DELETE grant pra
-- anon/authenticated. Isso força todo o fluxo de OAuth e renovação de token
-- a passar pelo servidor.

-- ── 4) View de status pro frontend, sem nenhuma coluna de token ────────────
drop view if exists public.google_calendar_connection_status;
create view public.google_calendar_connection_status
  with (security_invoker = true) as
  select id, tenant_id, user_id, google_email, status, calendar_id,
         connected_at, disconnected_at, last_sync_at, last_error
  from public.google_calendar_connections;

grant select on public.google_calendar_connection_status to authenticated;
-- Privilégio default do schema (ALTER DEFAULT PRIVILEGES ON TABLES) inclui
-- TRUNCATE em toda relação nova, view inclusa (não executável numa view, mas
-- revogado por consistência com 20260905_revoke_authenticated_truncate.sql).
revoke truncate on public.google_calendar_connection_status from authenticated;

-- ── 5) Idempotência de sincronização: 1 reunião por evento Google por tenant
create unique index if not exists idx_reunioes_tenant_google_event
  on public.reunioes (tenant_id, "googleEventId")
  where "googleEventId" is not null;
