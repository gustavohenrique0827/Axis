-- =============================================================
-- AXIS — nichos como entidade administrável por tenant.
--
-- Antes, "nicho" era só public.tenants.niche (uma string fixa por
-- tenant, usada em DashboardStatsByNiche.tsx pra trocar textos de
-- cards). Não dava pra um tenant ter mais de um nicho, nem existia
-- separação entre nicho GLOBAL (da plataforma) e nicho de TENANT.
--
-- public.nichos introduz esse catálogo: tenant_id NULL = nicho
-- global (visível a todos os tenants autenticados), tenant_id
-- preenchido = nicho específico daquele tenant, seguindo o mesmo
-- padrão de app_settings (has_tenant_access(tenant_id) OR tenant_id
-- IS NULL). tenants.niche NÃO é removido nem migrado para outro
-- lugar — continua orientando o dashboard; nichos é a base para o
-- catálogo administrável (tela de admin fica pra próxima etapa).
-- =============================================================

create table if not exists public.nichos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  nome varchar not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists nichos_tenant_nome_uidx
  on public.nichos (coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(nome));

alter table public.nichos enable row level security;

drop policy if exists nichos_select on public.nichos;
create policy nichos_select on public.nichos for select to authenticated
  using (tenant_id is null or has_tenant_access(tenant_id));

drop policy if exists nichos_write on public.nichos;
create policy nichos_write on public.nichos for all to authenticated
  using (is_super_admin() or (tenant_id is not null and has_tenant_access(tenant_id)))
  with check (is_super_admin() or (tenant_id is not null and has_tenant_access(tenant_id)));

-- Backfill: o nicho atual de cada tenant vira uma linha própria dele.
insert into public.nichos (tenant_id, nome)
select id, niche from public.tenants where niche is not null
on conflict do nothing;
