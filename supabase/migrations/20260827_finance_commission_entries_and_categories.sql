-- =============================================================
-- AXIS — Financeiro > Comissões & OTE guardava os lançamentos de
-- meta/realizado por colaborador/período só no localStorage
-- ("ote_period_entries_v2"), e Produtividade > Categorias
-- Financeiras guardava o plano de contas em "axis_finance_categories".
-- Ambos passam a ter tabela própria, seguindo o padrão de RLS
-- multi-tenant já usado no resto do schema.
-- =============================================================

create table if not exists public.finance_commission_entries (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  period text not null,
  nome text not null,
  cargo text not null,
  nivel text not null,
  squad text,
  meta numeric not null default 0,
  realizado numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.finance_commission_entries enable row level security;

create policy tenant_isolation on public.finance_commission_entries
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists finance_commission_entries_tenant_id_idx on public.finance_commission_entries (tenant_id);
create index if not exists finance_commission_entries_period_idx on public.finance_commission_entries (tenant_id, period);

create table if not exists public.finance_categories (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  nome text not null,
  tipo text not null,
  created_at timestamptz not null default now()
);

alter table public.finance_categories enable row level security;

create policy tenant_isolation on public.finance_categories
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists finance_categories_tenant_id_idx on public.finance_categories (tenant_id);
