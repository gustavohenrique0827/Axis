-- =============================================================
-- AXIS — Configurações > Empresa > Filiais & Unidades guardava a
-- lista de filiais só no localStorage ("axis_empresa_filiais"), sem
-- nenhuma tabela no banco. Cria a tabela dedicada, seguindo o mesmo
-- padrão de RLS multi-tenant já usado em todo o resto do schema
-- (tenant_id default current_tenant_id() + policy tenant_isolation).
-- =============================================================

create table if not exists public.empresa_filiais (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  nome text not null,
  cnpj text,
  cidade text,
  estado text,
  status text not null default 'Filial',
  created_at timestamptz not null default now()
);

alter table public.empresa_filiais enable row level security;

create policy tenant_isolation on public.empresa_filiais
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists empresa_filiais_tenant_id_idx on public.empresa_filiais (tenant_id);
