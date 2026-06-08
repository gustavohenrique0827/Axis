-- RLS policies para tenants e users
-- O app usa chave anon para todas as operações (auth customizada via btoa)
-- Usa DROP ... IF EXISTS antes de criar para compatibilidade com qualquer versão do PostgreSQL

-- ============================================================
-- TENANTS
-- ============================================================
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

-- ============================================================
-- USERS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_users"   ON public.users;
DROP POLICY IF EXISTS "anon_insert_users" ON public.users;
DROP POLICY IF EXISTS "anon_update_users" ON public.users;

CREATE POLICY "anon_read_users"
  ON public.users FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_users"
  ON public.users FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_users"
  ON public.users FOR UPDATE TO anon USING (true) WITH CHECK (true);
