-- ================================================================
-- AXIS — Schema completo com todos os relacionamentos
-- Execute TUDO no Supabase SQL Editor
-- Seguro de rodar múltiplas vezes (IF NOT EXISTS em tudo)
-- ================================================================

-- Função utilitária para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- ================================================================
-- COLABORADORES
-- Ligada a: tenants (tenant_id) e users (user_id)
-- Relação: 1 colaborador = 1 usuário de login
-- ================================================================
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome           TEXT NOT NULL,
  email          TEXT,
  cargo          TEXT,
  departamento   TEXT,
  status         TEXT DEFAULT 'Ativo',
  "dataAdmissao" TEXT,
  desempenho     INTEGER DEFAULT 0,
  avatar         TEXT,
  tenant_id      UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando em tabelas criadas por migrations antigas
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS "dataAdmissao" TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS desempenho     INTEGER DEFAULT 0;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS avatar         TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS tenant_id      UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
-- Colunas extras para uso do módulo Operacional (Equipe)
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS phone          TEXT    DEFAULT '';
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS deals          INTEGER DEFAULT 0;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS revenue        TEXT    DEFAULT 'R$ 0';
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS squad          TEXT    DEFAULT 'Sem squad';

ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- SQUADS
-- A migration do módulo dev criou squads com schema mínimo.
-- Adicionamos as colunas que o app realmente usa.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.squads (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome                  TEXT NOT NULL DEFAULT '',
  meta                  NUMERIC DEFAULT 0,
  orcamento_mensal      NUMERIC DEFAULT 0,
  faturamento_alcancado NUMERIC DEFAULT 0,
  sdr_count             INTEGER DEFAULT 1,
  closers_count         INTEGER DEFAULT 1,
  foco_comercial        TEXT DEFAULT '',
  membros               JSONB DEFAULT '[]'::jsonb,
  tenant_id             UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Para quem já tem a tabela squads da migration antiga (com schema diferente), adiciona colunas faltando
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS meta NUMERIC DEFAULT 0;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS orcamento_mensal NUMERIC DEFAULT 0;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS faturamento_alcancado NUMERIC DEFAULT 0;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS sdr_count INTEGER DEFAULT 1;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS closers_count INTEGER DEFAULT 1;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS foco_comercial TEXT DEFAULT '';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS membros JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.squads DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- SQUAD_METAS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.squad_metas (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  squad_id  TEXT REFERENCES public.squads(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.squad_metas DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- TASKS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title               TEXT NOT NULL DEFAULT '',
  related             TEXT DEFAULT '',
  type                TEXT DEFAULT 'Ligação',
  date                TEXT DEFAULT '',
  description         TEXT DEFAULT '',
  status              TEXT DEFAULT 'Pendente',
  priority            TEXT DEFAULT 'Média',
  seller              TEXT DEFAULT '',
  tags                TEXT[] DEFAULT '{}',
  "relatedProductIds" TEXT[] DEFAULT '{}',
  responsible         TEXT DEFAULT '',
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- LEADS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name                     TEXT NOT NULL DEFAULT '',
  company                  TEXT DEFAULT '',
  cnpj                     TEXT DEFAULT '',
  email                    TEXT DEFAULT '',
  phone                    TEXT DEFAULT '',
  status                   TEXT DEFAULT 'Novo',
  value                    NUMERIC DEFAULT 0,
  date                     TEXT DEFAULT '',
  seller                   TEXT DEFAULT '',
  source                   TEXT DEFAULT '',
  title                    TEXT DEFAULT '',
  priority                 TEXT DEFAULT 'Médio',
  "stageId"                TEXT DEFAULT '',
  "pipelineId"             TEXT DEFAULT 'comercial',
  "scoreIA"                INTEGER DEFAULT 50,
  temperature              TEXT DEFAULT 'Morno',
  "iaSummary"              TEXT DEFAULT '',
  "lead_interesse_cliente" TEXT DEFAULT '',
  "timeIdle"               INTEGER DEFAULT 0,
  "customFields"           JSONB DEFAULT '{}'::jsonb,
  "tenantName"             TEXT DEFAULT '',
  tenant_id                UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona colunas faltando em leads existente
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "iaSummary" TEXT DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "lead_interesse_cliente" TEXT DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "timeIdle" INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "customFields" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "tenantName" TEXT DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "pipelineId" TEXT DEFAULT 'comercial';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "stageId" TEXT DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS "scoreIA" INTEGER DEFAULT 50;

ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- LEAD_ACTIVITIES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "leadId"    TEXT,
  type        TEXT DEFAULT 'Outro',
  title       TEXT DEFAULT '',
  description TEXT DEFAULT '',
  seller      TEXT DEFAULT '',
  date        TEXT DEFAULT '',
  files       JSONB DEFAULT '[]'::jsonb,
  tenant_id   UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_activities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.lead_activities DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- CONTRACTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client    TEXT NOT NULL DEFAULT '',
  plan      TEXT DEFAULT '',
  mrr       NUMERIC DEFAULT 0,
  status    TEXT DEFAULT 'Ativo',
  date      TEXT DEFAULT '',
  progress  INTEGER DEFAULT 0,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- FINANCE_ENTRIES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.finance_entries (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT DEFAULT '',
  status      TEXT DEFAULT 'Pendente',
  value       NUMERIC DEFAULT 0,
  type        TEXT DEFAULT 'Pagar',
  date        TEXT DEFAULT '',
  tenant_id   UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finance_entries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.finance_entries DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- APPOINTMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  time      TEXT DEFAULT '',
  patient   TEXT DEFAULT '',
  "drId"    TEXT DEFAULT '',
  "drName"  TEXT DEFAULT '',
  status    TEXT DEFAULT 'Aguardando',
  type      TEXT DEFAULT 'Consulta',
  room      TEXT DEFAULT '',
  specialty TEXT DEFAULT '',
  phone     TEXT DEFAULT '',
  date      TEXT DEFAULT '',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title     TEXT NOT NULL DEFAULT '',
  "desc"    TEXT DEFAULT '',
  time      TEXT DEFAULT '',
  date      TEXT DEFAULT '',
  type      TEXT DEFAULT 'info',
  category  TEXT DEFAULT '',
  read      BOOLEAN DEFAULT FALSE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- PRODUCTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sku             TEXT DEFAULT '',
  name            TEXT NOT NULL DEFAULT '',
  category        TEXT DEFAULT '',
  type            TEXT DEFAULT 'Produto',
  price           NUMERIC DEFAULT 0,
  cost            NUMERIC DEFAULT 0,
  margin          NUMERIC DEFAULT 0,
  commission      NUMERIC DEFAULT 0,
  active          BOOLEAN DEFAULT TRUE,
  "stockMin"      INTEGER DEFAULT 0,
  "stockMax"      INTEGER DEFAULT 0,
  "currentStock"  INTEGER DEFAULT 0,
  dimensions      TEXT DEFAULT '',
  weight          NUMERIC DEFAULT 0,
  material        TEXT DEFAULT '',
  description     TEXT DEFAULT '',
  provider        TEXT DEFAULT '',
  "isBestSeller"  BOOLEAN DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  tenant_id       UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- PROPOSALS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.proposals DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- MARKETING
-- ================================================================
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.marketing_campaigns DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.marketing_content (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_content ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.marketing_content DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.marketing_landing_pages (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_landing_pages ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.marketing_landing_pages DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.marketing_automations (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.marketing_automations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.marketing_automations DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- EDUCAÇÃO
-- ================================================================
CREATE TABLE IF NOT EXISTS public.turmas (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.turmas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.turmas DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.students (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.certificates (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- APP_SETTINGS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- CLIENTES (usado por crm/Clientes.tsx)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name      TEXT NOT NULL DEFAULT '',
  industry  TEXT DEFAULT 'Tecnologia',
  city      TEXT DEFAULT '',
  state     TEXT DEFAULT '',
  phone     TEXT DEFAULT '',
  email     TEXT DEFAULT '',
  status    TEXT DEFAULT 'Ativo',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- TENANTS e USERS — garantir sem RLS (app usa chave anon)
-- ================================================================
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users   DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- GRANTS — garante que role anon pode ler/escrever em tudo
-- (necessário para tabelas criadas fora do setup padrão do Supabase)
-- ================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON public.colaboradores         TO anon, authenticated;
GRANT ALL ON public.squads                TO anon, authenticated;
GRANT ALL ON public.squad_metas           TO anon, authenticated;
GRANT ALL ON public.tasks                 TO anon, authenticated;
GRANT ALL ON public.leads                 TO anon, authenticated;
GRANT ALL ON public.lead_activities       TO anon, authenticated;
GRANT ALL ON public.contracts             TO anon, authenticated;
GRANT ALL ON public.finance_entries       TO anon, authenticated;
GRANT ALL ON public.appointments          TO anon, authenticated;
GRANT ALL ON public.notifications         TO anon, authenticated;
GRANT ALL ON public.products              TO anon, authenticated;
GRANT ALL ON public.proposals             TO anon, authenticated;
GRANT ALL ON public.marketing_campaigns   TO anon, authenticated;
GRANT ALL ON public.marketing_content     TO anon, authenticated;
GRANT ALL ON public.marketing_landing_pages TO anon, authenticated;
GRANT ALL ON public.marketing_automations TO anon, authenticated;
GRANT ALL ON public.turmas                TO anon, authenticated;
GRANT ALL ON public.students              TO anon, authenticated;
GRANT ALL ON public.certificates          TO anon, authenticated;
GRANT ALL ON public.app_settings          TO anon, authenticated;
GRANT ALL ON public.tenants               TO anon, authenticated;
GRANT ALL ON public.users                 TO anon, authenticated;
GRANT ALL ON public.clientes              TO anon, authenticated;
