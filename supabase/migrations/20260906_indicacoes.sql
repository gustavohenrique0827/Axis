-- Programa de indicação com comissão: um colaborador (vendedor/closer) ou um
-- cliente já existente indica um novo cliente e, quando a indicação vira
-- negócio fechado, ganha um valor fixo de comissão. Tabela nova e isolada —
-- não reaproveita finance_commission_entries porque aquela tabela é sobre
-- meta/realizado de OTE por período, não sobre um pagamento pontual por
-- indicação.
create table if not exists public.indicacoes (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default current_tenant_id(),
  referrer_type text not null check (referrer_type in ('colaborador', 'cliente')),
  referrer_colaborador_id text references public.colaboradores(id) on delete set null,
  referrer_cliente_id text references public.clientes(id) on delete set null,
  referrer_name text not null,
  referred_name text not null,
  referred_contact text,
  commission_value numeric not null default 0,
  status text not null default 'Pendente' check (status in ('Pendente', 'Aprovada', 'Paga', 'Cancelada')),
  date_indicated date not null default current_date,
  date_paid date,
  notes text,
  created_at timestamptz not null default now(),
  constraint indicacoes_referrer_matches_type check (
    (referrer_type = 'colaborador' and referrer_colaborador_id is not null and referrer_cliente_id is null)
    or
    (referrer_type = 'cliente' and referrer_cliente_id is not null and referrer_colaborador_id is null)
  )
);

alter table public.indicacoes enable row level security;

create policy tenant_isolation on public.indicacoes
  for all
  using (has_tenant_access(tenant_id))
  with check (has_tenant_access(tenant_id));
