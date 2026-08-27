-- =============================================================
-- AXIS — Indicadores (exportações agendadas), Educação > Conteúdo e
-- Educação > Certificados guardavam tudo só no localStorage
-- ("axis_scheduled_exports", "axis_edu_content", "axis_edu_certs").
-- scheduled_exports e education_content são tabelas novas;
-- certificates já existe mas era um stub (só id/tenant_id/created_at)
-- — ganha as colunas reais que o tipo Certificate do frontend usa.
-- =============================================================

create table if not exists public.scheduled_exports (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  email text not null,
  weekday text not null,
  time text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.scheduled_exports enable row level security;

create policy tenant_isolation on public.scheduled_exports
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists scheduled_exports_tenant_id_idx on public.scheduled_exports (tenant_id);

create table if not exists public.education_content (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  title text not null,
  type text not null,
  module text,
  course text,
  duration text,
  last_update text,
  access_count integer not null default 0,
  status text not null default 'Rascunho',
  created_at timestamptz not null default now()
);

alter table public.education_content enable row level security;

create policy tenant_isolation on public.education_content
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists education_content_tenant_id_idx on public.education_content (tenant_id);

alter table public.certificates
  add column if not exists student text,
  add column if not exists course text,
  add column if not exists issue_date text,
  add column if not exists code text,
  add column if not exists status text not null default 'Emitido',
  add column if not exists grade text;
