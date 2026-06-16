-- Módulo Imobiliário: tabelas, RLS e índices
-- Corretores, Imóveis, Leads e Visitas

-- ─── CORRETORES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imobiliario_corretores (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID        REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome          TEXT        NOT NULL,
  creci         TEXT,
  telefone      TEXT,
  email         TEXT,
  especialidade TEXT        NOT NULL DEFAULT 'Residencial',
  bio           TEXT,
  slug          TEXT        UNIQUE,
  status        TEXT        NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Inativo')),
  imoveis_ativos INT        NOT NULL DEFAULT 0,
  vendas_mes    INT         NOT NULL DEFAULT 0,
  total_vendas  INT         NOT NULL DEFAULT 0,
  vgv_mes       NUMERIC     NOT NULL DEFAULT 0,
  meta          INT         NOT NULL DEFAULT 5,
  avaliacao     NUMERIC     NOT NULL DEFAULT 5.0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imobiliario_corretores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imobiliario_corretores_all" ON public.imobiliario_corretores
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_imob_corretores_tenant ON public.imobiliario_corretores (tenant_id);

-- ─── IMÓVEIS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imobiliario_imoveis (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.tenants(id) ON DELETE CASCADE,
  titulo      TEXT        NOT NULL,
  tipo        TEXT        NOT NULL DEFAULT 'Apartamento',
  operacao    TEXT        NOT NULL DEFAULT 'Venda' CHECK (operacao IN ('Venda','Locação')),
  status      TEXT        NOT NULL DEFAULT 'Disponível' CHECK (status IN ('Disponível','Vendido','Locado','Reservado')),
  valor       NUMERIC     NOT NULL DEFAULT 0,
  bairro      TEXT,
  cidade      TEXT        NOT NULL DEFAULT 'São Paulo',
  area        NUMERIC     NOT NULL DEFAULT 0,
  quartos     INT         NOT NULL DEFAULT 0,
  banheiros   INT         NOT NULL DEFAULT 0,
  vagas       INT         NOT NULL DEFAULT 0,
  corretor    TEXT,
  visitas     INT         NOT NULL DEFAULT 0,
  descricao   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imobiliario_imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imobiliario_imoveis_all" ON public.imobiliario_imoveis
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_imob_imoveis_tenant  ON public.imobiliario_imoveis (tenant_id);
CREATE INDEX IF NOT EXISTS idx_imob_imoveis_status  ON public.imobiliario_imoveis (status);
CREATE INDEX IF NOT EXISTS idx_imob_imoveis_operacao ON public.imobiliario_imoveis (operacao);

-- ─── LEADS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imobiliario_leads (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL,
  telefone    TEXT,
  email       TEXT,
  interesse   TEXT        NOT NULL DEFAULT 'Compra' CHECK (interesse IN ('Compra','Locação','Investimento')),
  tipo        TEXT        NOT NULL DEFAULT 'Apartamento',
  bairro      TEXT,
  orcamento   NUMERIC     NOT NULL DEFAULT 0,
  etapa       TEXT        NOT NULL DEFAULT 'Novo',
  corretor    TEXT,
  origem      TEXT        NOT NULL DEFAULT 'Site',
  prioridade  TEXT        NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Alta','Média','Baixa')),
  obs         TEXT,
  dias_etapa  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imobiliario_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imobiliario_leads_all" ON public.imobiliario_leads
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_imob_leads_tenant ON public.imobiliario_leads (tenant_id);
CREATE INDEX IF NOT EXISTS idx_imob_leads_etapa  ON public.imobiliario_leads (etapa);

-- ─── VISITAS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imobiliario_visitas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        REFERENCES public.tenants(id) ON DELETE CASCADE,
  imovel      TEXT        NOT NULL,
  bairro      TEXT,
  cliente     TEXT        NOT NULL,
  telefone    TEXT,
  corretor    TEXT,
  data        DATE        NOT NULL,
  hora        TEXT        NOT NULL DEFAULT '10:00',
  status      TEXT        NOT NULL DEFAULT 'Agendada' CHECK (status IN ('Agendada','Confirmada','Realizada','Cancelada')),
  obs         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imobiliario_visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imobiliario_visitas_all" ON public.imobiliario_visitas
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_imob_visitas_tenant ON public.imobiliario_visitas (tenant_id);
CREATE INDEX IF NOT EXISTS idx_imob_visitas_data   ON public.imobiliario_visitas (data);
CREATE INDEX IF NOT EXISTS idx_imob_visitas_status ON public.imobiliario_visitas (status);

-- ─── TRIGGER updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'imobiliario_corretores','imobiliario_imoveis',
    'imobiliario_leads','imobiliario_visitas'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON public.%s
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;
