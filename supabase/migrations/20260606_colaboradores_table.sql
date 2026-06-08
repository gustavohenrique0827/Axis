-- =============================================================
-- AXIS — Cria tabela colaboradores (módulo RH)
-- Execute no Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS public.colaboradores (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome          TEXT NOT NULL,
  email         TEXT,
  cargo         TEXT,
  departamento  TEXT,
  status        TEXT DEFAULT 'Ativo',
  "dataAdmissao" TEXT,
  desempenho    INTEGER DEFAULT 0,
  avatar        TEXT,
  tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- App usa chave anon para tudo — desabilita RLS
ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;
