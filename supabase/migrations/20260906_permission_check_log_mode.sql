-- Fase 3 do plano de permissões: "modo de log" — NUNCA bloqueia nada (o
-- trigger é BEFORE e sempre retorna NEW/OLD sem alterar), só registra o que
-- SERIA bloqueado se a autorização por cargo/módulo fosse aplicada de
-- verdade. Isso existe pra dar dado real antes de qualquer enforcement (que
-- continua desativado — não ative sem aprovação explícita).
--
-- Cobre só uma amostra representativa de tabelas por módulo nesta primeira
-- passada (leads→crm, finance_entries→financeiro, colaboradores→rh) — expandir
-- pra mais tabelas é uma repetição mecânica do mesmo padrão de trigger.
CREATE TABLE permission_check_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  user_role text,
  module_name text not null,
  table_name text not null,
  operation text not null,
  would_have_blocked boolean not null default true,
  created_at timestamptz not null default now()
);

ALTER TABLE permission_check_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON permission_check_log
  FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE OR REPLACE FUNCTION log_module_permission_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_module text := TG_ARGV[0];
  v_tenant_id uuid;
  v_user_id uuid := auth.uid();
  v_role text;
  v_is_master boolean;
  v_modulos text[];
BEGIN
  SELECT tenant_id, role, is_master INTO v_tenant_id, v_role, v_is_master FROM users WHERE id = v_user_id;
  -- Sem usuário resolvido (chamada via service role/job) ou usuário master
  -- (sempre ignora a gate de cargo, igual ao frontend): nada a registrar.
  IF v_tenant_id IS NULL OR v_is_master THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  SELECT modulos INTO v_modulos FROM cargos WHERE nome = v_role AND tenant_id = v_tenant_id;
  -- cargo sem registro ou modulos vazio = sem restrição (mesmo fallback do frontend)
  IF v_modulos IS NOT NULL AND array_length(v_modulos,1) > 0 AND NOT (v_module = ANY(v_modulos)) THEN
    INSERT INTO permission_check_log (tenant_id, user_id, user_role, module_name, table_name, operation, would_have_blocked)
    VALUES (v_tenant_id, v_user_id, v_role, v_module, TG_TABLE_NAME, TG_OP, true);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$fn$;

CREATE TRIGGER trg_permission_log_crm BEFORE INSERT OR UPDATE OR DELETE ON leads
FOR EACH ROW EXECUTE FUNCTION log_module_permission_check('crm');

CREATE TRIGGER trg_permission_log_financeiro BEFORE INSERT OR UPDATE OR DELETE ON finance_entries
FOR EACH ROW EXECUTE FUNCTION log_module_permission_check('financeiro');

CREATE TRIGGER trg_permission_log_rh BEFORE INSERT OR UPDATE OR DELETE ON colaboradores
FOR EACH ROW EXECUTE FUNCTION log_module_permission_check('rh');
