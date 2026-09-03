-- claim_next_form_sdr(p_tenant_id) é SECURITY DEFINER, chamada sem login pelo
-- formulário público do E-EMPREENDA+ (supabase.rpc, role anon) — mas aceitava
-- QUALQUER p_tenant_id, sem checar se o chamador tinha relação com aquele
-- tenant. Isso deixava qualquer pessoa na internet: (1) ler nome/telefone/
-- user_id do SDR "da vez" de qualquer tenant do sistema (PII, não só do
-- E-EMPREENDA+), e (2) avançar/corromper o contador de rodízio (app_settings)
-- de qualquer tenant, sem limite de chamadas.
-- Fecha no mesmo padrão já usado pelas policies de INSERT anon em leads/tasks/
-- etc: só aceita o tenant fixo do formulário público do E-EMPREENDA+.

create or replace function public.claim_next_form_sdr(p_tenant_id uuid)
returns table(sdr_id text, nome character varying, phone text, user_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $function$
DECLARE
  v_config   jsonb;
  v_index    int;
  v_count    int;
  v_ids      text[];
BEGIN
  IF p_tenant_id <> '27ef95ee-84dd-499e-9f25-cd9baecb5fe4'::uuid THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  -- Read or create config row
  SELECT value INTO v_config
  FROM app_settings
  WHERE tenant_id = p_tenant_id AND key = 'form_rodizio_empreenda';

  IF v_config IS NULL THEN
    v_config := '{"current_index": 0}'::jsonb;
    INSERT INTO app_settings (id, tenant_id, key, value, created_at, updated_at)
    VALUES (
      p_tenant_id::text || '_form_rodizio',
      p_tenant_id,
      'form_rodizio_empreenda',
      v_config,
      now(), now()
    )
    ON CONFLICT DO NOTHING;
  END IF;

  v_index := COALESCE((v_config->>'current_index')::int, 0);

  -- Optional explicit list of active SDR IDs
  IF (v_config ? 'active_sdr_ids') AND jsonb_array_length(v_config->'active_sdr_ids') > 0 THEN
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_config->'active_sdr_ids'))
    INTO v_ids;
  END IF;

  -- Count eligible SDRs
  IF v_ids IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count
    FROM colaboradores
    WHERE tenant_id = p_tenant_id AND cargo = 'SDR' AND status = 'Ativo'
      AND id = ANY(v_ids);
  ELSE
    SELECT COUNT(*) INTO v_count
    FROM colaboradores
    WHERE tenant_id = p_tenant_id AND cargo = 'SDR' AND status = 'Ativo';
  END IF;

  IF v_count = 0 THEN RETURN; END IF;

  -- Return SDR at current_index % count
  IF v_ids IS NOT NULL THEN
    RETURN QUERY
    SELECT c.id, c.nome, c.phone, c.user_id
    FROM colaboradores c
    WHERE c.tenant_id = p_tenant_id AND c.cargo = 'SDR' AND c.status = 'Ativo'
      AND c.id = ANY(v_ids)
    ORDER BY c.nome
    LIMIT 1 OFFSET (v_index % v_count);
  ELSE
    RETURN QUERY
    SELECT c.id, c.nome, c.phone, c.user_id
    FROM colaboradores c
    WHERE c.tenant_id = p_tenant_id AND c.cargo = 'SDR' AND c.status = 'Ativo'
    ORDER BY c.nome
    LIMIT 1 OFFSET (v_index % v_count);
  END IF;

  -- Atomically increment counter
  UPDATE app_settings
  SET value     = jsonb_set(value, '{current_index}', to_jsonb(v_index + 1)),
      updated_at = now()
  WHERE tenant_id = p_tenant_id AND key = 'form_rodizio_empreenda';
END;
$function$;
