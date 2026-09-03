-- =============================================================
-- AXIS — a policy anon_read_active_tenants (FOR SELECT TO anon USING
-- (status='Active')) não restringia colunas: qualquer visitante sem
-- login conseguia ler TODAS as colunas de public.tenants, incluindo
-- webhook_url e evolution_api_url (URLs internas de integração).
-- Hoje esses campos estão vazios nos tenants ativos, mas a policy não
-- impedia que ficassem expostos assim que alguém os preenchesse.
--
-- RLS controla LINHAS; GRANT controla COLUNAS — os dois se combinam.
-- Aqui restringimos por coluna: anon só enxerga o que o seletor de
-- empresa (tela de login, fetchTenants()/fetchTenantIdMap() em
-- src/lib/supabase.ts) realmente usa.
-- =============================================================

revoke select on public.tenants from anon;
grant select (id, name, niche, status, modules, plan, timezone, primary_color,
  module_crm, module_sdr_ia, module_adv_dashboard, module_education,
  module_finance, module_tasks, module_marketing, created_at, updated_at)
  on public.tenants to anon;
