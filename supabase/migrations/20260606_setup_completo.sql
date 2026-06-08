-- =============================================================
-- AXIS — Setup completo: tabelas + RLS
-- Execute no Supabase SQL Editor (Run)
-- =============================================================

-- -------------------------------------------------------------
-- 1. TABELA app_settings (cria se não existir)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "auth_all_app_settings"  ON public.app_settings;

CREATE POLICY "anon_read_app_settings"
  ON public.app_settings FOR SELECT TO anon USING (true);

CREATE POLICY "auth_all_app_settings"
  ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS app_settings_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- 2. RLS — TENANTS
-- -------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_tenants"   ON public.tenants;
DROP POLICY IF EXISTS "anon_insert_tenants" ON public.tenants;
DROP POLICY IF EXISTS "anon_update_tenants" ON public.tenants;
DROP POLICY IF EXISTS "anon_delete_tenants" ON public.tenants;

CREATE POLICY "anon_read_tenants"
  ON public.tenants FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_tenants"
  ON public.tenants FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_tenants"
  ON public.tenants FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_tenants"
  ON public.tenants FOR DELETE TO anon USING (true);

-- -------------------------------------------------------------
-- 3. RLS — USERS
-- -------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_users"   ON public.users;
DROP POLICY IF EXISTS "anon_insert_users" ON public.users;
DROP POLICY IF EXISTS "anon_update_users" ON public.users;
DROP POLICY IF EXISTS "anon_delete_users" ON public.users;

CREATE POLICY "anon_read_users"
  ON public.users FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_users"
  ON public.users FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_users"
  ON public.users FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_users"
  ON public.users FOR DELETE TO anon USING (true);
