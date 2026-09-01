-- Unifica o módulo Imobiliário com Concessionárias:
-- 1) nova tabela imobiliario_veiculos (mesmo padrão de imobiliario_imoveis)
-- 2) FKs opcionais imovel_id/veiculo_id em leads e visitas, pra ligar cada
--    lead/visita a um dos dois tipos de ativo sem duplicar as telas
-- 3) corrige a RLS "aberta" (USING (true)) das 4 tabelas antigas + a nova,
--    trocando pelo padrão tenant_isolation já usado em
--    20260803_rls_tenant_isolation_phase1.sql

-- ─── VEÍCULOS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.imobiliario_veiculos (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.current_tenant_id(),
  marca           TEXT        NOT NULL,
  modelo          TEXT        NOT NULL,
  ano_fabricacao  INT,
  ano_modelo      INT,
  km              NUMERIC     NOT NULL DEFAULT 0,
  placa           TEXT,
  cor             TEXT,
  combustivel     TEXT        NOT NULL DEFAULT 'Flex',
  cambio          TEXT        NOT NULL DEFAULT 'Manual' CHECK (cambio IN ('Manual','Automático','CVT')),
  valor           NUMERIC     NOT NULL DEFAULT 0,
  status          TEXT        NOT NULL DEFAULT 'Disponível' CHECK (status IN ('Disponível','Vendido','Reservado','Em Preparação')),
  vendedor        TEXT,
  visitas         INT         NOT NULL DEFAULT 0,
  descricao       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imobiliario_veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON public.imobiliario_veiculos
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE INDEX IF NOT EXISTS idx_imob_veiculos_tenant ON public.imobiliario_veiculos (tenant_id);
CREATE INDEX IF NOT EXISTS idx_imob_veiculos_status ON public.imobiliario_veiculos (status);

DROP TRIGGER IF EXISTS trg_imobiliario_veiculos_updated_at ON public.imobiliario_veiculos;
CREATE TRIGGER trg_imobiliario_veiculos_updated_at
  BEFORE UPDATE ON public.imobiliario_veiculos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── LEADS / VISITAS: link opcional a imóvel OU veículo ──────────────────────
ALTER TABLE public.imobiliario_leads
  ADD COLUMN IF NOT EXISTS imovel_id  UUID REFERENCES public.imobiliario_imoveis(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS veiculo_id UUID REFERENCES public.imobiliario_veiculos(id) ON DELETE SET NULL;

ALTER TABLE public.imobiliario_leads
  DROP CONSTRAINT IF EXISTS imobiliario_leads_um_ativo_apenas;
ALTER TABLE public.imobiliario_leads
  ADD CONSTRAINT imobiliario_leads_um_ativo_apenas
  CHECK (imovel_id IS NULL OR veiculo_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_imob_leads_imovel_id  ON public.imobiliario_leads (imovel_id);
CREATE INDEX IF NOT EXISTS idx_imob_leads_veiculo_id ON public.imobiliario_leads (veiculo_id);

ALTER TABLE public.imobiliario_visitas
  ADD COLUMN IF NOT EXISTS imovel_id  UUID REFERENCES public.imobiliario_imoveis(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS veiculo_id UUID REFERENCES public.imobiliario_veiculos(id) ON DELETE SET NULL;

ALTER TABLE public.imobiliario_visitas
  DROP CONSTRAINT IF EXISTS imobiliario_visitas_um_ativo_apenas;
ALTER TABLE public.imobiliario_visitas
  ADD CONSTRAINT imobiliario_visitas_um_ativo_apenas
  CHECK (imovel_id IS NULL OR veiculo_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_imob_visitas_imovel_id  ON public.imobiliario_visitas (imovel_id);
CREATE INDEX IF NOT EXISTS idx_imob_visitas_veiculo_id ON public.imobiliario_visitas (veiculo_id);

-- ─── Corrige RLS "aberta" nas 4 tabelas originais ────────────────────────────
-- Estavam FOR ALL TO anon, authenticated USING (true) — sem isolamento real
-- por tenant no banco. Troca pelo padrão tenant_isolation já em uso no resto
-- do app (20260803_rls_tenant_isolation_phase1.sql).
DO $$
DECLARE
  tbl TEXT;
  pol RECORD;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'imobiliario_imoveis', 'imobiliario_corretores',
    'imobiliario_leads', 'imobiliario_visitas'
  ]
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;

    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id()',
      tbl
    );

    EXECUTE format(
      'CREATE POLICY tenant_isolation ON public.%I FOR ALL TO authenticated ' ||
      'USING (tenant_id = public.current_tenant_id() OR public.is_super_admin()) ' ||
      'WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_super_admin())',
      tbl
    );
  END LOOP;
END $$;
