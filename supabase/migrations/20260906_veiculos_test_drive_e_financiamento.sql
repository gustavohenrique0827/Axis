-- Auditoria do nicho Concessionárias encontrou dois problemas:
--
-- 1) `imobiliario_veiculos.visitas` (mostrado na UI como "X test-drives") é
--    gravado como 0 na criação e nunca mais alterado por nenhum código —
--    mesmo quando o usuário agenda um test-drive de verdade em
--    Visitas.tsx (que já vincula `veiculo_id`). É um contador que sempre
--    mostra 0, desconectado do fluxo real de agendamento. Corrigido com um
--    trigger: toda vez que uma visita é criada com veiculo_id preenchido,
--    o contador do veículo é incrementado atomicamente na mesma transação.
--
-- 2) A landing page promete "acompanhamento das etapas de proposta e
--    aprovação de crédito" e "captação de dados do veículo na troca" pro
--    nicho Concessionárias, mas não existe nenhuma tabela ou tela pra
--    financiamento — cria-se aqui `veiculo_financiamentos`.
--
-- Ambas as tabelas envolvidas (imobiliario_veiculos, imobiliario_visitas)
-- estão vazias em produção — mudança aditiva, sem dado a migrar.

create or replace function public.increment_veiculo_test_drive()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if NEW.veiculo_id is not null then
    update public.imobiliario_veiculos
    set visitas = coalesce(visitas, 0) + 1
    where id = NEW.veiculo_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_increment_veiculo_test_drive on public.imobiliario_visitas;
create trigger trg_increment_veiculo_test_drive
  after insert on public.imobiliario_visitas
  for each row
  execute function public.increment_veiculo_test_drive();

create table if not exists public.veiculo_financiamentos (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  veiculo_id uuid not null references public.imobiliario_veiculos(id) on delete cascade,
  cliente text not null,
  telefone text,
  valor_veiculo numeric not null default 0,
  valor_entrada numeric not null default 0,
  valor_financiado numeric not null default 0,
  parcelas integer not null default 1,
  banco_financeira text,
  status text not null default 'Em Análise'
    check (status in ('Em Análise', 'Aprovado', 'Recusado', 'Documentação Pendente')),
  veiculo_troca_descricao text,
  veiculo_troca_valor numeric,
  responsavel text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.veiculo_financiamentos enable row level security;

create policy tenant_isolation on public.veiculo_financiamentos
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists veiculo_financiamentos_tenant_id_idx on public.veiculo_financiamentos (tenant_id);
create index if not exists veiculo_financiamentos_veiculo_id_idx on public.veiculo_financiamentos (veiculo_id);
