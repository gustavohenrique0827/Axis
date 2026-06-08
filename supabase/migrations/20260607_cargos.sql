-- Tabela de cargos cadastrados por tenant
CREATE TABLE IF NOT EXISTS public.cargos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  descricao   TEXT DEFAULT '',
  nivel       TEXT DEFAULT 'Operacional',
  modulos     TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cargos DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.cargos TO anon, authenticated;
