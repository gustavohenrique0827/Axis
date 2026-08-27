-- =============================================================
-- AXIS — tenant_integrations estava com RLS desabilitado e sem
-- nenhuma policy: qualquer requisição anon/authenticated via
-- PostgREST conseguia ler/escrever supabase_url, nome de credencial
-- e workflow_id de TODOS os tenants.
--
-- Essa tabela é um registro interno (usado pela automação n8n/Julia)
-- e não é referenciada em nenhum lugar do frontend/backend do Axis,
-- então habilitar RLS sem criar policies trava o acesso via anon e
-- authenticated e mantém apenas o acesso via service_role (que
-- sempre ignora RLS) — sem quebrar nada em uso hoje.
-- =============================================================

ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
