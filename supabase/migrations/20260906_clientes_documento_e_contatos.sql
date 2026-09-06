-- Auditoria encontrou dois problemas em `clientes`:
--
-- 1) O modal de cadastro (NovoClienteModal.tsx) já coleta CPF/CNPJ e chega a
--    validar em tempo real contra a Receita Federal (BrasilAPI), mostrando
--    "CNPJ Ativo e Validado" — mas a tabela `clientes` nunca teve coluna pra
--    isso, então o valor era descartado no submit sem aviso nenhum ao
--    usuário. Promessa visual sem persistência real.
--
-- 2) A landing page (Segmentacao.tsx, nicho "Venda Consultiva") promete
--    "Múltiplos contatos e decisores vinculados ao mesmo CNPJ", mas não
--    existe nenhuma tabela pra guardar mais de um contato por cliente —
--    `clientes` só tem um email/telefone únicos.
--
-- Ambos corrigidos de forma aditiva: nenhuma coluna/tabela existente é
-- alterada ou removida, e `clientes` está vazia em produção (0 linhas),
-- então não há dado a migrar/perder.

alter table public.clientes
  add column if not exists documento text;

create table if not exists public.cliente_contatos (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  cliente_id text not null references public.clientes(id) on delete cascade,
  nome text not null,
  cargo text,
  email text,
  telefone text,
  principal boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.cliente_contatos enable row level security;

create policy tenant_isolation on public.cliente_contatos
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists cliente_contatos_tenant_id_idx on public.cliente_contatos (tenant_id);
create index if not exists cliente_contatos_cliente_id_idx on public.cliente_contatos (cliente_id);
