-- Achado durante a auditoria da integração Google Calendar (não relacionado
-- diretamente a ela): a migration 20260905_revoke_anon_truncate.sql revogou
-- TRUNCATE só de anon. O role `authenticated` (qualquer usuário logado, de
-- qualquer tenant) ainda tinha GRANT TRUNCATE em todas as ~75 tabelas do
-- schema public. TRUNCATE não é filtrado por RLS (só SELECT/INSERT/UPDATE/
-- DELETE são) — ou seja, qualquer usuário autenticado de qualquer tenant
-- conseguia apagar uma tabela inteira (todos os tenants) com uma única
-- chamada. PostgREST (usado pelo supabase-js) nunca emite TRUNCATE, então
-- revogar não tem nenhum impacto funcional.

revoke truncate on all tables in schema public from authenticated;
