-- Fase 4 do plano multi-tenant: modelo de parceiros (Plataforma).
--
-- G-Tech (dona do Axis) é parceira da Holding Pluppex; existem outras
-- parceiras (ex.: Nicolas Rocha). Cada parceiro tem acesso operacional
-- completo aos tenants (clientes) explicitamente atribuídos a ele —
-- um tenant pode ser atribuído a mais de um parceiro — e uma visão
-- apenas agregada/somada (nunca linha-a-linha) dos demais tenants da
-- plataforma, via platform_metrics_overview().
--
-- Reaproveita o padrão de RLS da Fase 1 (policy "tenant_isolation" em
-- 47 tabelas): a condição current_tenant_id() OR is_super_admin() vira
-- has_tenant_access(tenant_id), que adiciona OR EXISTS (tenant_partners).

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  name varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_partners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, partner_id)
);

alter table public.users add column if not exists partner_id uuid references public.partners(id);

create index if not exists idx_tenant_partners_tenant_id on public.tenant_partners(tenant_id);
create index if not exists idx_tenant_partners_partner_id on public.tenant_partners(partner_id);
create index if not exists idx_users_partner_id on public.users(partner_id);

create or replace function public.current_partner_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select partner_id from public.users where id = auth.uid();
$$;

create or replace function public.has_tenant_access(target_tenant_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select
    target_tenant_id = public.current_tenant_id()
    or public.is_super_admin()
    or exists (
      select 1 from public.tenant_partners tp
      where tp.tenant_id = target_tenant_id
        and tp.partner_id = public.current_partner_id()
    );
$$;

-- RLS das próprias tabelas de parceiros: um usuário só vê o parceiro a que
-- pertence; atribuir/desatribuir tenants a parceiros fica restrito ao
-- super admin (evita que um parceiro se auto-atribua o cliente de outro).
alter table public.partners enable row level security;
alter table public.tenant_partners enable row level security;

drop policy if exists partners_select on public.partners;
create policy partners_select on public.partners
  for select using (id = public.current_partner_id() or public.is_super_admin());

drop policy if exists partners_insert on public.partners;
create policy partners_insert on public.partners
  for insert with check (public.is_super_admin());

drop policy if exists partners_update on public.partners;
create policy partners_update on public.partners
  for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists partners_delete on public.partners;
create policy partners_delete on public.partners
  for delete using (public.is_super_admin());

drop policy if exists tenant_partners_select on public.tenant_partners;
create policy tenant_partners_select on public.tenant_partners
  for select using (partner_id = public.current_partner_id() or public.is_super_admin());

drop policy if exists tenant_partners_insert on public.tenant_partners;
create policy tenant_partners_insert on public.tenant_partners
  for insert with check (public.is_super_admin());

drop policy if exists tenant_partners_update on public.tenant_partners;
create policy tenant_partners_update on public.tenant_partners
  for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists tenant_partners_delete on public.tenant_partners;
create policy tenant_partners_delete on public.tenant_partners
  for delete using (public.is_super_admin());

-- Reescreve a policy "tenant_isolation" das 45 tabelas padrão (mesmo texto
-- em todas, confirmado via pg_policies) para trocar a checagem direta de
-- tenant por has_tenant_access(tenant_id).
do $$
declare
  t text;
  tables text[] := array[
    'ai_knowledge_base','appointments','cargos','certificates','clientes','colaboradores',
    'contracts','crm_funis','crm_pipeline_stages','custom_fields','dev_environments','dev_issues',
    'dev_projects','dev_repositories','dev_sprint_tasks','estoque_items','exames_pedidos',
    'finance_entries','financial_goals','interactions','internal_channels','internal_messages',
    'landing_configs','lead_activities','lead_custom_values','lead_tags','leads',
    'marketing_automations','marketing_campaigns','marketing_content','marketing_landing_pages',
    'messages','notifications','pipelines','products','proposals','reunioes','squad_metas',
    'squads','stages','students','tags','tasks','turmas','webhook_logs','webhooks','whatsapp_instances'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists tenant_isolation on public.%I', t);
    execute format(
      'create policy tenant_isolation on public.%I for all using (public.has_tenant_access(tenant_id)) with check (public.has_tenant_access(tenant_id))',
      t
    );
  end loop;
end $$;

-- app_settings: mantém a leitura de configs globais (tenant_id null)
drop policy if exists tenant_isolation on public.app_settings;
create policy tenant_isolation on public.app_settings
  for all
  using (public.has_tenant_access(tenant_id) or tenant_id is null)
  with check (public.has_tenant_access(tenant_id));

-- users: parceiro enxerga colaboradores do tenant atribuído; a escalada
-- para is_master continua bloqueada para todo mundo que não seja o super
-- admin real (checagem de WITH CHECK inalterada da Fase 1).
drop policy if exists tenant_isolation on public.users;
create policy tenant_isolation on public.users
  for all
  using (public.has_tenant_access(tenant_id))
  with check (
    (tenant_id = public.current_tenant_id() and coalesce(is_master, false) = false)
    or public.is_super_admin()
  );

-- Visão agregada para parceiros: só números somados de TODOS os tenants da
-- plataforma (nunca linha a linha, nunca nome de cliente) — para tenants não
-- atribuídos ao parceiro que está consultando, que via has_tenant_access()
-- não teria nenhum acesso às tabelas operacionais.
create or replace function public.platform_metrics_overview()
returns table (
  total_tenants bigint,
  total_leads bigint,
  total_clientes bigint,
  total_propostas bigint,
  total_receita numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_partner_id() is null and not public.is_super_admin() then
    raise exception 'access denied: partner or super admin required';
  end if;

  return query
  select
    (select count(*) from public.tenants where deleted_at is null),
    (select count(*) from public.leads),
    (select count(*) from public.clientes),
    (select count(*) from public.proposals),
    (select coalesce(sum(value), 0) from public.finance_entries where type = 'Receber');
end;
$$;

revoke all on function public.platform_metrics_overview() from public;
grant execute on function public.platform_metrics_overview() to authenticated;

-- Popula os parceiros a partir dos tenants que hoje já representam
-- organizações parceiras (niche = 'Master'/'Parceira'), e atribui a cada
-- parceiro o próprio tenant como "cliente" atribuído (visão completa de si
-- mesmo) e marca os usuários desses tenants como usuários do parceiro.
insert into public.partners (tenant_id, name)
select id, name from public.tenants where niche in ('Master', 'Parceira')
on conflict do nothing;

insert into public.tenant_partners (tenant_id, partner_id)
select p.tenant_id, p.id from public.partners p
where p.tenant_id is not null
on conflict (tenant_id, partner_id) do nothing;

update public.users u
set partner_id = p.id
from public.partners p
where p.tenant_id = u.tenant_id
  and u.partner_id is null;
