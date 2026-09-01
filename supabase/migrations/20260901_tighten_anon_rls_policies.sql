-- =============================================================
-- AXIS — leads/tasks/lead_commercial_memory/julia_interaction_log
-- tinham policies de RLS concedendo SELECT e/ou UPDATE para a role
-- `anon` (chave pública, sem login), escopadas ao tenant do
-- E-EMPREENDA+ (27ef95ee-84dd-499e-9f25-cd9baecb5fe4). Isso
-- significava que qualquer pessoa na internet, sem autenticação,
-- conseguia ler (e no caso de leads/tasks, também atualizar) todos
-- os leads/tarefas/memória comercial daquele tenant usando a chave
-- anon pública embutida no bundle do E-EMPREENDA+.
--
-- Auditoria confirmou (grep em todo o repo, incluindo E-EMPREENDA+/)
-- que o único uso real de `anon` nessas tabelas é INSERT de leads
-- pelo formulário público de inscrição — nada faz SELECT/UPDATE via
-- anon. As policies de INSERT são mantidas; só removemos o que
-- permitia ler/alterar dados de terceiros sem login.
--
-- julia_round_robin_state tinha uma policy `qual: true` para
-- `role: public` (= autenticado E anon, o mundo inteiro) em todos os
-- comandos, sem tenant_id — lida/escrita livre por qualquer cliente
-- com a chave anon, e sem isolamento entre tenants. Nenhum código do
-- repo referencia essa tabela; a automação n8n "Julia" que a usa
-- roda com service_role (que sempre ignora RLS), então travar aqui
-- segue o mesmo padrão já usado em
-- 20260827_lock_down_tenant_integrations.sql. Adicionamos tenant_id
-- (nullable) para permitir escopar o rodízio por tenant depois, sem
-- quebrar o fluxo atual do n8n.
-- =============================================================

drop policy if exists "public_select_leads_e_empreenda" on public.leads;
drop policy if exists "public_update_leads_e_empreenda" on public.leads;

drop policy if exists "public_select_tasks_e_empreenda" on public.tasks;

drop policy if exists "public_select_lead_commercial_memory_e_empreenda" on public.lead_commercial_memory;
drop policy if exists "public_update_lead_commercial_memory_e_empreenda" on public.lead_commercial_memory;

drop policy if exists "public_select_julia_interaction_log_e_empreenda" on public.julia_interaction_log;

drop policy if exists "service_role_julia_round_robin_state" on public.julia_round_robin_state;

alter table public.julia_round_robin_state
  add column if not exists tenant_id uuid references public.tenants(id);
