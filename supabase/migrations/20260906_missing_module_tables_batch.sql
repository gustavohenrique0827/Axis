-- Preenche as tabelas que faltavam para os módulos que ainda viviam 100% em
-- localStorage (dado fake removido numa limpeza anterior, mas sem
-- persistência real nenhuma): avaliação de seminovos (automotivo), tabela de
-- procedimentos/planos de tratamento/corpo clínico (clínica), homologação/
-- instalação/manutenção/vistoria/projeto (solar) e captação/empreendimento/
-- proprietário/comissão (imobiliário). Todas seguem o mesmo padrão de RLS já
-- usado no restante do schema: tenant_isolation via has_tenant_access(tenant_id).

-- ===================== AUTOMOTIVO =====================

CREATE TABLE automotivo_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  veiculo text not null,
  placa text not null,
  km integer not null default 0,
  fipe numeric not null default 0,
  oferta numeric not null default 0,
  avaliador text,
  cliente text,
  status text not null default 'Em Avaliação' check (status in ('Em Avaliação','Proposta Feita','Aprovado','Recusado')),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
ALTER TABLE automotivo_avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON automotivo_avaliacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- ===================== CLÍNICA =====================

CREATE TABLE clinica_servicos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  nome text not null,
  especialidade text,
  duracao text,
  valor_particular numeric not null default 0,
  convenios text,
  created_at timestamptz not null default now()
);
ALTER TABLE clinica_servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clinica_servicos FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE clinica_planos_tratamento (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  paciente text not null,
  telefone text,
  descricao text not null,
  profissional text,
  valor_total numeric not null default 0,
  sessoes_concluidas integer not null default 0,
  total_sessoes integer not null default 1,
  status text not null default 'Em Elaboração' check (status in ('Em Elaboração','Aprovado pelo Paciente','Em Andamento','Concluído')),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
ALTER TABLE clinica_planos_tratamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clinica_planos_tratamento FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE clinica_profissionais (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  nome text not null,
  crm text not null,
  especialidade text not null,
  telefone text,
  email text,
  atendimentos_mes integer not null default 0,
  status text not null default 'Ativo' check (status in ('Ativo','Férias / Licença','Inativo')),
  created_at timestamptz not null default now()
);
ALTER TABLE clinica_profissionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON clinica_profissionais FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- ===================== SOLAR =====================

CREATE TABLE solar_homologacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  cliente text not null,
  concessionaria text not null default 'CPFL Paulista',
  protocolo text not null,
  etapa text not null default 'Solicitação de Acesso' check (etapa in ('Solicitação de Acesso','Parecer Emitido','Vistoria da Distribuidora','Troca do Medidor','Homologado 100%')),
  prazo_concessionaria text,
  status text not null default 'Em Análise Técnica' check (status in ('Em Análise Técnica','Aprovado / Aguardando Troca de Medidor','Agendado com Concessionária','Concluído')),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
ALTER TABLE solar_homologacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON solar_homologacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE solar_instalacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  cliente text not null,
  equipe text,
  progresso integer not null default 0,
  inicio date,
  previsao_conclusao date,
  modulos_instalados text,
  status text not null default 'Fixação de Estrutura' check (status in ('Fixação de Estrutura','Passagem de Cabos','Instalação Inversor','Em Execução','Comissionamento','Obra Concluída')),
  created_at timestamptz not null default now()
);
ALTER TABLE solar_instalacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON solar_instalacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE solar_manutencoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  usina text not null,
  potencia text,
  servico text not null default 'Limpeza e Lavagem de Módulos',
  data date,
  geracao_atual text default '100% normal',
  status text not null default 'Agendada' check (status in ('Agendada','Em Atendimento','Concluída','Aguardando Peça')),
  created_at timestamptz not null default now()
);
ALTER TABLE solar_manutencoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON solar_manutencoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE solar_vistorias (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  cliente text not null,
  telefone text,
  endereco text not null,
  data_agendada date,
  responsavel text,
  tipo_telhado text default 'Metálico',
  status text not null default 'Agendada' check (status in ('Agendada','Em Andamento','Concluída / Aprovada','Reprovada / Ajuste Necessário')),
  created_at timestamptz not null default now()
);
ALTER TABLE solar_vistorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON solar_vistorias FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- Tabela própria (não reaproveita solar_analises): enum de status e campos
-- (telefone, cidade, geração mensal) não batem com o funil de solar_analises.
CREATE TABLE solar_projetos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  cliente text not null,
  telefone text,
  potencia_kwp numeric not null default 0,
  geracao_mensal_kwh numeric not null default 0,
  valor_contrato numeric not null default 0,
  cidade text,
  concessionaria text not null default 'CPFL Paulista',
  status text not null default 'Dimensionamento' check (status in ('Dimensionamento','Vistoria Concluída','Instalação','Homologação','Conectado à Rede')),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
ALTER TABLE solar_projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON solar_projetos FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- ===================== IMOBILIÁRIO =====================

CREATE TABLE imobiliario_captacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  endereco text not null,
  tipo text not null default 'Apartamento',
  valor_pretendido numeric not null default 0,
  corretor text,
  proprietario text,
  telefone text,
  status text not null default 'Em Avaliação' check (status in ('Em Avaliação','Contrato de Posse','Fotos & Vistoria','Ativo no Catálogo','Recusado')),
  data date not null default current_date,
  created_at timestamptz not null default now()
);
ALTER TABLE imobiliario_captacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON imobiliario_captacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE imobiliario_empreendimentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  nome text not null,
  construtora text,
  cidade text,
  total_unidades integer not null default 0,
  unidades_disponiveis integer not null default 0,
  vgv_total numeric not null default 0,
  status text not null default 'Lançamento' check (status in ('Lançamento','Em Obras','Pronto para Morar','100% Vendido')),
  entrega text,
  created_at timestamptz not null default now()
);
ALTER TABLE imobiliario_empreendimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON imobiliario_empreendimentos FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE imobiliario_proprietarios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  nome text not null,
  telefone text,
  email text,
  imoveis_count integer not null default 1,
  tipo text not null default 'Pessoa Física' check (tipo in ('Pessoa Física','Pessoa Jurídica')),
  status text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  created_at timestamptz not null default now()
);
ALTER TABLE imobiliario_proprietarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON imobiliario_proprietarios FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE imobiliario_comissoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  imovel text not null,
  corretor text,
  valor_venda numeric not null default 0,
  comissao_total numeric not null default 0,
  comissao_corretor numeric not null default 0,
  comissao_imobiliaria numeric not null default 0,
  status text not null default 'A Receber' check (status in ('A Receber','Em Tramitação','Liquidada')),
  previsao text,
  observacoes text,
  created_at timestamptz not null default now()
);
ALTER TABLE imobiliario_comissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON imobiliario_comissoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

-- Trava TRUNCATE de anon/authenticated nas tabelas novas (ver
-- 20260906_revoke_truncate_default_privileges.sql — o DEFAULT PRIVILEGES já
-- deveria cobrir isso automaticamente, mas revogamos explicitamente aqui
-- também por segurança, já que esse mesmo buraco já se repetiu antes).
revoke truncate on
  automotivo_avaliacoes,
  clinica_servicos, clinica_planos_tratamento, clinica_profissionais,
  solar_homologacoes, solar_instalacoes, solar_manutencoes, solar_vistorias, solar_projetos,
  imobiliario_captacoes, imobiliario_empreendimentos, imobiliario_proprietarios, imobiliario_comissoes
from anon;
revoke truncate on
  automotivo_avaliacoes,
  clinica_servicos, clinica_planos_tratamento, clinica_profissionais,
  solar_homologacoes, solar_instalacoes, solar_manutencoes, solar_vistorias, solar_projetos,
  imobiliario_captacoes, imobiliario_empreendimentos, imobiliario_proprietarios, imobiliario_comissoes
from authenticated;
