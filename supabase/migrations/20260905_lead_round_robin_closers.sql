-- Round-robin real de closers no CRM. A config (distributionMode,
-- blockOnMultipleClients, multiClientThreshold) já existia em
-- app_settings.rodizio_global_config e rotation_active/rotation_blocked/
-- rotation_lead_types já existiam em colaboradores (TabClosersCRM.tsx) —
-- mas nenhum código lia isso pra atribuir de fato um closer a um lead novo.
--
-- Implementado como trigger BEFORE INSERT em leads (não como chamada do
-- frontend): roda dentro da MESMA transação do insert (atômico por
-- construção — não existe janela entre "escolher closer" e "criar lead"),
-- e cobre todo caminho de criação de lead (modal do CRM, API pública
-- /api/v1/leads, importação futura) sem precisar lembrar de chamar nada.
-- Só atua quando o lead chega sem "seller" definido — nunca sobrescreve
-- uma atribuição manual.
--
-- Concorrência do ponteiro round-robin: o incremento do índice usa
-- UPDATE ... RETURNING sobre a MESMA linha de app_settings — o lock de
-- linha do Postgres serializa chamadas concorrentes do mesmo tenant (a
-- segunda espera a primeira commitar), então duas inserções simultâneas
-- nunca recebem o mesmo índice.

create or replace function public.assign_lead_round_robin()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_config       jsonb;
  v_mode         text;
  v_block_multi  boolean;
  v_threshold    int;
  v_settings_id  text;
  v_count        int;
  v_new_index    int;
  v_picked_name  text;
begin
  -- Só atua em criação, e só quando não veio vendedor definido manualmente.
  if NEW.seller is not null and btrim(NEW.seller) <> '' then
    return NEW;
  end if;
  if NEW.tenant_id is null then
    return NEW;
  end if;

  select value into v_config
  from public.app_settings
  where tenant_id = NEW.tenant_id and key = 'rodizio_global_config';

  v_mode        := coalesce(v_config->>'distributionMode', 'round-robin');
  v_block_multi := coalesce((v_config->>'blockOnMultipleClients')::boolean, false);
  v_threshold   := coalesce((v_config->>'multiClientThreshold')::int, 2);

  if v_mode = 'manual' then
    return NEW;
  end if;

  -- Elegíveis: colaboradores "Closer" (cargo contém, case-insensitive —
  -- mesmo critério do TabClosersCRM.tsx), status Ativo no RH,
  -- rotation_active=true, rotation_blocked=false, aceitando o tipo do lead
  -- (rotation_lead_types vazio = aceita qualquer tipo, mesma regra da UI),
  -- e — se blockOnMultipleClients — com menos de v_threshold leads ainda
  -- em aberto (exclui status que soem a fechado/perdido/cancelado).
  create temporary table _rr_eligible on commit drop as
  select c.id, c.nome,
         (
           select count(*) from public.leads l
           where l.tenant_id = NEW.tenant_id
             and l.seller = c.nome
             and l.status !~* 'ganho|perdido|cancelad|fechad'
         ) as leads_ativos
  from public.colaboradores c
  where c.tenant_id = NEW.tenant_id
    and c.status = 'Ativo'
    and lower(coalesce(c.cargo,'')) like '%closer%'
    and coalesce(c.rotation_active, true) = true
    and coalesce(c.rotation_blocked, false) = false
    and (
      c.rotation_lead_types is null
      or array_length(c.rotation_lead_types, 1) is null
      or NEW.source is null
      or NEW.source = ''
      or NEW.source = any(c.rotation_lead_types)
    );

  if v_block_multi then
    delete from _rr_eligible where leads_ativos >= v_threshold;
  end if;

  select count(*) into v_count from _rr_eligible;
  if v_count = 0 then
    drop table _rr_eligible;
    return NEW;
  end if;

  if v_mode = 'priority' then
    select nome into v_picked_name
    from _rr_eligible
    order by leads_ativos asc, nome asc
    limit 1;
  else
    -- round-robin: bump atômico do ponteiro (mesma linha = mesmo lock)
    v_settings_id := NEW.tenant_id::text || '_rodizio_global_config';

    insert into public.app_settings (id, tenant_id, key, value, created_at, updated_at)
    values (v_settings_id, NEW.tenant_id, 'rodizio_global_config', coalesce(v_config, '{}'::jsonb) || jsonb_build_object('current_index', 0), now(), now())
    on conflict (id) do nothing;

    update public.app_settings
    set value = jsonb_set(value, '{current_index}', to_jsonb(coalesce((value->>'current_index')::int, 0) + 1)),
        updated_at = now()
    where tenant_id = NEW.tenant_id and key = 'rodizio_global_config'
    returning (value->>'current_index')::int into v_new_index;

    select nome into v_picked_name
    from _rr_eligible
    order by nome asc
    limit 1 offset ((v_new_index - 1) % v_count);
  end if;

  drop table _rr_eligible;

  if v_picked_name is not null then
    NEW.seller := v_picked_name;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_assign_lead_round_robin on public.leads;
create trigger trg_assign_lead_round_robin
  before insert on public.leads
  for each row
  execute function public.assign_lead_round_robin();
