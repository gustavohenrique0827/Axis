-- ============================================================================
-- Fix Row Level Security (RLS) for Public Registration
-- Execute this in Supabase SQL Editor to allow partner registration
-- ============================================================================

-- 1. DISABLE RLS on tenants table (or allow public INSERT)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- 2. DISABLE RLS on users table (or allow public INSERT)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:
-- 
-- -- Create public insert policy for tenants
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public to insert tenants" ON tenants
--   FOR INSERT
--   WITH CHECK (true);
-- 
-- -- Create public insert policy for users
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public to insert users" ON users
--   FOR INSERT
--   WITH CHECK (true);

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('tenants', 'users');
