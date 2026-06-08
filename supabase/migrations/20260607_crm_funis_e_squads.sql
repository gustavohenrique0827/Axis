-- ============================================================
-- Squads: colunas extras
-- ============================================================
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'Geral';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS leader      TEXT DEFAULT '';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS cor         TEXT DEFAULT '#6366f1';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS logo        TEXT DEFAULT '';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS membros_funcoes JSONB DEFAULT '{}';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS clientes    TEXT[] DEFAULT '{}';
ALTER TABLE public.squads DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.squads TO anon, authenticated;

-- ============================================================
-- Funis CRM
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_funis (
  id                        TEXT PRIMARY KEY,
  nome                      TEXT NOT NULL,
  tipo                      TEXT NOT NULL DEFAULT 'comercial',
  etapas                    TEXT[] DEFAULT '{}',
  etapas_config             JSONB DEFAULT '[]',
  ativo                     BOOLEAN DEFAULT true,
  sdr_etapa_entrada         TEXT DEFAULT '',
  sdr_etapa_handoff         TEXT DEFAULT '',
  sdr_score_minimo          INTEGER DEFAULT 65,
  sdr_delay_resposta        INTEGER DEFAULT 2,
  sdr_msg_boas_vindas       TEXT DEFAULT '',
  sdr_criterio_desqualificacao TEXT DEFAULT 'sem_interesse',
  tenant_id                 TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.crm_funis DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.crm_funis TO anon, authenticated;

-- ============================================================
-- Etapas do pipeline (stages)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id                  TEXT PRIMARY KEY,
  funil_id            TEXT REFERENCES public.crm_funis(id) ON DELETE CASCADE,
  nome                TEXT NOT NULL,
  cor                 TEXT DEFAULT '#3b82f6',
  ordem               INTEGER DEFAULT 0,
  iniciar_minimizado  BOOLEAN DEFAULT false,
  tipo                TEXT DEFAULT 'comercial',
  tenant_id           TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.crm_pipeline_stages DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.crm_pipeline_stages TO anon, authenticated;
