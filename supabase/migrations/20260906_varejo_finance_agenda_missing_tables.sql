-- Preenche as últimas telas que ainda viviam 100% em localStorage: fornecedores
-- e pedidos de balcão do varejo, centros de custo e extrato bancário do
-- financeiro, e operações de caixa do PDV (abertura/sangria/suprimento/
-- fechamento — hoje duplicado e dessincronizado entre Vendas.tsx e
-- PainelVarejo.tsx via duas chaves de localStorage diferentes).
-- Mesmo padrão de RLS do restante do schema: tenant_isolation via has_tenant_access(tenant_id).

CREATE TABLE varejo_fornecedores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  razao_social text not null,
  cnpj text,
  contato text,
  telefone text,
  email text,
  prazo_entrega text default '3 dias úteis',
  categorias text,
  created_at timestamptz not null default now()
);
ALTER TABLE varejo_fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON varejo_fornecedores FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE varejo_pedidos (
  id text primary key,
  tenant_id uuid not null default current_tenant_id(),
  cliente text not null,
  telefone text,
  itens text not null,
  total numeric not null default 0,
  forma_pagto text not null default 'Pix',
  status text not null default 'Pago / Separando' check (status in ('Pago / Separando','Em Trânsito / Entrega','Entregue / Concluído','Cancelado')),
  created_at timestamptz not null default now()
);
ALTER TABLE varejo_pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON varejo_pedidos FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE caixa_operacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  tipo text not null check (tipo in ('abertura','sangria','suprimento','fechamento')),
  valor numeric not null default 0,
  motivo text,
  operador text,
  created_at timestamptz not null default now()
);
ALTER TABLE caixa_operacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON caixa_operacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));
CREATE INDEX idx_caixa_operacoes_tenant_created ON caixa_operacoes(tenant_id, created_at desc);

CREATE TABLE finance_centros_custo (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  nome text not null,
  codigo text,
  orcamento numeric not null default 0,
  gasto numeric not null default 0,
  responsavel text,
  created_at timestamptz not null default now()
);
ALTER TABLE finance_centros_custo ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON finance_centros_custo FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE finance_extratos_importados (
  id text primary key,
  tenant_id uuid not null default current_tenant_id(),
  data text,
  descricao text not null,
  documento text,
  valor numeric not null default 0,
  tipo text not null check (tipo in ('credito','debito')),
  banco text,
  conciliado boolean not null default false,
  match_sugerido text,
  created_at timestamptz not null default now()
);
ALTER TABLE finance_extratos_importados ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON finance_extratos_importados FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- Vendas em espera (hold/suspender no PDV) passam a ser linhas reais de
-- `vendas` com este novo status, em vez de um array solto em localStorage.
ALTER TABLE vendas DROP CONSTRAINT vendas_status_check;
ALTER TABLE vendas ADD CONSTRAINT vendas_status_check CHECK (status in ('aberta','em_espera','paga','cancelada'));

revoke truncate on
  varejo_fornecedores, varejo_pedidos, caixa_operacoes,
  finance_centros_custo, finance_extratos_importados
from anon;
revoke truncate on
  varejo_fornecedores, varejo_pedidos, caixa_operacoes,
  finance_centros_custo, finance_extratos_importados
from authenticated;
