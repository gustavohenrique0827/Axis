-- Fase 1 do plano multi-tenant: substitui as policies de RLS "USING (true)"
-- (abertas para qualquer cliente com a chave anon) por policies reais,
-- baseadas em public.current_tenant_id()/public.is_super_admin() (Fase 0).
--
-- Levantamento feito antes desta migration (pg_policies + information_schema):
-- - Toda tabela de negócio tinha policies "anon_*" com qual/with_check = true.
-- - user_settings já tinha uma policy correta (auth.uid() = user_id) — não é
--   tocada aqui, pois já é mais restrita que a policy genérica por tenant.
-- - crm_funis/crm_pipeline_stages tinham tenant_id como TEXT (não UUID) e
--   estavam vazias em produção — convertidas com segurança.
-- - dev_environments, estoque_items, exames_pedidos, interactions,
--   lead_custom_values, lead_tags, reunioes, stages não tinham tenant_id;
--   backfill feito via a relação existente onde havia dado (stages→pipelines,
--   user_settings→users) — as demais estavam vazias em produção.

-- 1) Corrige o tipo de tenant_id em crm_funis/crm_pipeline_stages.
alter table public.crm_funis alter column tenant_id type uuid using tenant_id::uuid;
alter table public.crm_funis add constraint crm_funis_tenant_id_fkey foreign key (tenant_id) references public.tenants(id);

alter table public.crm_pipeline_stages alter column tenant_id type uuid using tenant_id::uuid;
alter table public.crm_pipeline_stages add constraint crm_pipeline_stages_tenant_id_fkey foreign key (tenant_id) references public.tenants(id);

-- 2) Adiciona tenant_id nas tabelas que não tinham, com backfill via FK
--    existente onde há dado, e vazio (sem dado a perder) nas demais.
alter table public.stages add column if not exists tenant_id uuid references public.tenants(id);
update public.stages s set tenant_id = p.tenant_id from public.pipelines p where p.id = s.pipeline_id and s.tenant_id is null;

alter table public.user_settings add column if not exists tenant_id uuid references public.tenants(id);
update public.user_settings us set tenant_id = u.tenant_id from public.users u where u.id = us.user_id and us.tenant_id is null;

alter table public.interactions add column if not exists tenant_id uuid references public.tenants(id);
update public.interactions i set tenant_id = l.tenant_id from public.leads l where l.id = i.lead_id and i.tenant_id is null;

alter table public.lead_custom_values add column if not exists tenant_id uuid references public.tenants(id);
update public.lead_custom_values lcv set tenant_id = l.tenant_id from public.leads l where l.id = lcv.lead_id and lcv.tenant_id is null;

alter table public.lead_tags add column if not exists tenant_id uuid references public.tenants(id);
update public.lead_tags lt set tenant_id = l.tenant_id from public.leads l where l.id = lt.lead_id and lt.tenant_id is null;

alter table public.dev_environments add column if not exists tenant_id uuid references public.tenants(id);
alter table public.estoque_items add column if not exists tenant_id uuid references public.tenants(id);
alter table public.exames_pedidos add column if not exists tenant_id uuid references public.tenants(id);
alter table public.reunioes add column if not exists tenant_id uuid references public.tenants(id);

-- 3) Default automático de tenant_id = current_tenant_id() em todo INSERT que
--    não informe a coluna explicitamente. Necessário porque o código atual do
--    front-end (fora da tabela leads) não define tenant_id ao inserir — sem
--    esse default, travar a RLS quebraria a criação de registros em quase todo
--    o app até a Fase 3 (filtros/writes explícitos no front-end) estar pronta.
do $$
declare
  t text;
  tables text[] := array[
    'ai_knowledge_base','app_settings','appointments','cargos','certificates','clientes',
    'colaboradores','contracts','crm_funis','crm_pipeline_stages','custom_fields',
    'dev_environments','dev_issues','dev_projects','dev_repositories','dev_sprint_tasks',
    'estoque_items','exames_pedidos','finance_entries','financial_goals','interactions',
    'internal_channels','internal_messages','landing_configs','lead_activities',
    'lead_custom_values','lead_tags','leads','marketing_automations','marketing_campaigns',
    'marketing_content','marketing_landing_pages','messages','notifications','pipelines',
    'products','proposals','reunioes','squad_metas','squads','stages','students','tags',
    'tasks','turmas','user_settings','users','webhook_logs','webhooks','whatsapp_instances'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I alter column tenant_id set default public.current_tenant_id()', t);
  end loop;
end $$;

-- 4) Remove todas as policies existentes (todas efetivamente abertas) das
--    tabelas de negócio com tenant_id, e cria uma única policy tenant-aware
--    por tabela. users recebe uma condição extra: nenhum usuário comum pode
--    setar is_master=true em si mesmo (só super admin).
do $$
declare
  pol record;
  t text;
  tables text[] := array[
    'ai_knowledge_base','appointments','cargos','certificates','clientes',
    'colaboradores','contracts','crm_funis','crm_pipeline_stages','custom_fields',
    'dev_environments','dev_issues','dev_projects','dev_repositories','dev_sprint_tasks',
    'estoque_items','exames_pedidos','finance_entries','financial_goals','interactions',
    'internal_channels','internal_messages','landing_configs','lead_activities',
    'lead_custom_values','lead_tags','leads','marketing_automations','marketing_campaigns',
    'marketing_content','marketing_landing_pages','messages','notifications','pipelines',
    'products','proposals','reunioes','squad_metas','squads','stages','students','tags',
    'tasks','turmas','users','webhook_logs','webhooks','whatsapp_instances'
  ];
begin
  foreach t in array tables loop
    for pol in select policyname from pg_policies where schemaname='public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;

    if t = 'users' then
      execute
        'create policy tenant_isolation on public.users for all to authenticated ' ||
        'using (tenant_id = public.current_tenant_id() or public.is_super_admin()) ' ||
        'with check ((tenant_id = public.current_tenant_id() and coalesce(is_master, false) = false) or public.is_super_admin())';
    else
      execute format(
        'create policy tenant_isolation on public.%I for all to authenticated using (tenant_id = public.current_tenant_id() or public.is_super_admin()) with check (tenant_id = public.current_tenant_id() or public.is_super_admin())',
        t
      );
    end if;
  end loop;
end $$;

-- 5) app_settings: linhas com tenant_id NULL são configuração global,
--    visíveis para todos os tenants autenticados, mas só graváveis por quem
--    já é dono delas (ou super admin) — ninguém cria uma linha global sem ser
--    super admin.
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='app_settings' loop
    execute format('drop policy if exists %I on public.app_settings', pol.policyname);
  end loop;
end $$;

create policy tenant_isolation on public.app_settings for all to authenticated
using (tenant_id = public.current_tenant_id() or tenant_id is null or public.is_super_admin())
with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- 6) tenants: cada tenant só enxerga a si mesmo (e pode atualizar seus
--    próprios dados, ex.: módulos habilitados); criar/apagar um tenant novo
--    fica restrito a super admin — o auto-cadastro público (/register) foi
--    desativado no front-end.
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='tenants' loop
    execute format('drop policy if exists %I on public.tenants', pol.policyname);
  end loop;
end $$;

create policy tenant_select on public.tenants for select to authenticated
using (id = public.current_tenant_id() or public.is_super_admin());

create policy tenant_insert on public.tenants for insert to authenticated
with check (public.is_super_admin());

create policy tenant_update on public.tenants for update to authenticated
using (id = public.current_tenant_id() or public.is_super_admin())
with check (id = public.current_tenant_id() or public.is_super_admin());

create policy tenant_delete on public.tenants for delete to authenticated
using (public.is_super_admin());
