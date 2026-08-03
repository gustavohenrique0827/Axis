-- Fase 5 (auditoria final) do plano multi-tenant: o advisor de performance do
-- Supabase apontou 34 tabelas com FK de tenant_id sem índice — agora que toda
-- policy de RLS filtra por tenant_id (Fase 1), essas consultas fariam sequential
-- scan sem isso. Migration puramente aditiva (só cria índices), sem risco.

create index if not exists idx_ai_knowledge_base_tenant_id on public.ai_knowledge_base(tenant_id);
create index if not exists idx_cargos_tenant_id on public.cargos(tenant_id);
create index if not exists idx_certificates_tenant_id on public.certificates(tenant_id);
create index if not exists idx_clientes_tenant_id on public.clientes(tenant_id);
create index if not exists idx_colaboradores_tenant_id on public.colaboradores(tenant_id);
create index if not exists idx_crm_funis_tenant_id on public.crm_funis(tenant_id);
create index if not exists idx_crm_pipeline_stages_tenant_id on public.crm_pipeline_stages(tenant_id);
create index if not exists idx_custom_fields_tenant_id on public.custom_fields(tenant_id);
create index if not exists idx_dev_environments_tenant_id on public.dev_environments(tenant_id);
create index if not exists idx_dev_issues_tenant_id on public.dev_issues(tenant_id);
create index if not exists idx_dev_projects_tenant_id on public.dev_projects(tenant_id);
create index if not exists idx_dev_repositories_tenant_id on public.dev_repositories(tenant_id);
create index if not exists idx_dev_sprint_tasks_tenant_id on public.dev_sprint_tasks(tenant_id);
create index if not exists idx_estoque_items_tenant_id on public.estoque_items(tenant_id);
create index if not exists idx_exames_pedidos_tenant_id on public.exames_pedidos(tenant_id);
create index if not exists idx_interactions_tenant_id on public.interactions(tenant_id);
create index if not exists idx_internal_channels_tenant_id on public.internal_channels(tenant_id);
create index if not exists idx_internal_messages_tenant_id on public.internal_messages(tenant_id);
create index if not exists idx_lead_activities_tenant_id on public.lead_activities(tenant_id);
create index if not exists idx_lead_custom_values_tenant_id on public.lead_custom_values(tenant_id);
create index if not exists idx_lead_tags_tenant_id on public.lead_tags(tenant_id);
create index if not exists idx_marketing_automations_tenant_id on public.marketing_automations(tenant_id);
create index if not exists idx_notifications_tenant_id on public.notifications(tenant_id);
create index if not exists idx_pipelines_tenant_id on public.pipelines(tenant_id);
create index if not exists idx_products_tenant_id on public.products(tenant_id);
create index if not exists idx_proposals_tenant_id on public.proposals(tenant_id);
create index if not exists idx_reunioes_tenant_id on public.reunioes(tenant_id);
create index if not exists idx_squad_metas_tenant_id on public.squad_metas(tenant_id);
create index if not exists idx_stages_tenant_id on public.stages(tenant_id);
create index if not exists idx_students_tenant_id on public.students(tenant_id);
create index if not exists idx_tasks_tenant_id on public.tasks(tenant_id);
create index if not exists idx_turmas_tenant_id on public.turmas(tenant_id);
create index if not exists idx_user_settings_tenant_id on public.user_settings(tenant_id);
create index if not exists idx_whatsapp_instances_tenant_id on public.whatsapp_instances(tenant_id);
