-- =============================================================
-- AXIS — Configurações > Meu Perfil guardava telefone, bio e o
-- toggle de 2FA só no localStorage ("axis_user_profile"), sem
-- nenhuma coluna correspondente em public.users. A troca de senha
-- também era falsa (só gravava um timestamp local) — o app já usa
-- Supabase Auth de verdade (supabase.auth.signInWithPassword /
-- updateUser, ver src/lib/supabase.ts), então a troca de senha real
-- passa a usar supabase.auth.updateUser() no lugar de mexer na coluna
-- legada users.password_hash (não usada há a migração para Auth real).
-- =============================================================

alter table public.users
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists two_factor_enabled boolean not null default false;
