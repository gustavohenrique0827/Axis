-- ai_usage_log e aurora_audit_log tinham policy "qual: true" pra role public
-- (efetivamente sem isolamento nenhum) + GRANT completo (SELECT/INSERT/UPDATE/DELETE/
-- TRUNCATE) pra "anon" — ou seja, qualquer pessoa na internet, sem login, conseguia
-- ler/escrever/apagar essas duas tabelas inteiras, de todos os tenants.
-- Nenhum código do repo (frontend ou server.ts) referencia essas tabelas — são
-- dead code no schema. Fecha no mesmo padrão usado em todo o resto do banco:
-- RLS por has_tenant_access(tenant_id), sem grant nenhum pra anon.

revoke all on public.ai_usage_log from anon;
revoke all on public.aurora_audit_log from anon;

drop policy if exists "ai_usage_log_open_access" on public.ai_usage_log;
create policy tenant_isolation on public.ai_usage_log
  for all to authenticated
  using (has_tenant_access(tenant_id))
  with check (has_tenant_access(tenant_id));

drop policy if exists "aurora_audit_log_tenant_isolation" on public.aurora_audit_log;
create policy tenant_isolation on public.aurora_audit_log
  for all to authenticated
  using (has_tenant_access(tenant_id))
  with check (has_tenant_access(tenant_id));
