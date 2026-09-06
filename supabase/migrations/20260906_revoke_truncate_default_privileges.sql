-- As migrations 20260905_revoke_anon_truncate.sql e
-- 20260905_revoke_authenticated_truncate.sql revogaram TRUNCATE de anon e
-- authenticated, mas só nas tabelas que existiam naquele momento — nenhuma
-- delas mexeu no DEFAULT PRIVILEGES do role `postgres` (o role usado por
-- apply_migration para criar tabelas). Resultado: toda tabela criada por
-- CREATE TABLE desde 2026-09-05 voltou a nascer com GRANT TRUNCATE para
-- anon/authenticated automaticamente — reabrindo o mesmo buraco a cada
-- migration nova. Confirmado ao vivo: `permission_check_log`,
-- `estoque_movimentacoes`, `vendas`, `venda_items`, `pacientes`,
-- `prontuarios` e `mensalidades` (todas criadas em 2026-09-06) já tinham
-- TRUNCATE de volta para anon e authenticated antes desta migration.
--
-- Corrige dos dois lados: revoga TRUNCATE de todas as tabelas atuais (fecha
-- o buraco já existente) e ajusta o DEFAULT PRIVILEGES para que nenhuma
-- tabela futura volte a nascer com esse grant.

revoke truncate on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;

alter default privileges for role postgres in schema public
  revoke truncate on tables from anon;
alter default privileges for role postgres in schema public
  revoke truncate on tables from authenticated;
