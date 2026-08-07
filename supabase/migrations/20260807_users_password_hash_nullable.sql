-- password_hash ficou NOT NULL depois que a fase 0 da migration de auth
-- (20260803_auth_migration_phase0.sql) parou de usá-la — a senha agora vive
-- em auth.users, gerenciada pelo Supabase Auth. Nenhum código da aplicação
-- lê ou grava password_hash desde então, mas a constraint continuava
-- exigindo um valor, então todo INSERT em public.users que não a informava
-- (ex.: cadastro de uma nova empresa parceira) falhava silenciosamente com
-- violação de NOT NULL, deixando a conta em auth.users órfã (sem perfil).
alter table public.users alter column password_hash drop not null;
