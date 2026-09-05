-- anon (a chave pública, embutida no bundle do front-end) tinha GRANT TRUNCATE
-- em todas as tabelas do schema public. RLS não se aplica a TRUNCATE (só
-- SELECT/INSERT/UPDATE/DELETE) — então, independente de quão corretas as
-- policies de tenant_isolation/has_tenant_access() fossem, qualquer requisição
-- não autenticada podia apagar uma tabela inteira (todos os tenants) usando
-- só a anon key. PostgREST nunca emite TRUNCATE, então nenhuma funcionalidade
-- do app depende desse grant — revogar é seguro.

revoke truncate on all tables in schema public from anon;
