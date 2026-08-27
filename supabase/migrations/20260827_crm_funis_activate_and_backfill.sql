-- =============================================================
-- AXIS — a tela de Funis & Etapas (Configurações > CRM > Funis) e o
-- Pipeline liam/gravavam a config de funis em localStorage
-- ("axis_funis_config") + um único registro global de app_settings
-- (tenant_id NULL, sem filtro de tenant) — ou seja, todos os tenants
-- liam e podiam sobrescrever a mesma configuração uns dos outros.
--
-- A tabela public.crm_funis já existe com as colunas certas para o
-- modelo do frontend (Funil), só não estava sendo usada (0 linhas).
-- Esta migration:
--   1) adiciona a coluna client_ids que faltava (equivalente ao
--      campo `clientIds` do tipo Funil, usado para restringir um
--      funil a clientes específicos);
--   2) migra os dados reais que hoje vivem no app_settings global
--      para o tenant que de fato os usa (Pluppex — 27ef95ee...,
--      37 leads ativos no pipeline), preservando os MESMOS ids de
--      funil ("funil-sdr-ia-default", "3x7skf56bjq"), porque
--      leads.stageId é derivado desses ids (getStageId() em
--      usePipeline.ts) — trocar o id quebraria o board pra quem já
--      tem leads nessas etapas.
--
-- Nota: crm_funis.id é PRIMARY KEY global (não composto com
-- tenant_id), então não dá pra replicar os mesmos ids literais pra
-- outros tenants sem colidir. O único outro tenant com lead ativo
-- (dc97bab8..., 1 lead de teste) fica sem backfill — a tela volta a
-- mostrar os funis padrão (FUNIS_DEFAULT) até alguém salvar de
-- verdade, igual ao comportamento de "sem config salva" de hoje.
-- =============================================================

alter table public.crm_funis
  add column if not exists client_ids text[] not null default '{}';

insert into public.crm_funis
  (id, tenant_id, nome, tipo, etapas, etapas_config, ativo, client_ids,
   sdr_etapa_entrada, sdr_etapa_handoff, sdr_score_minimo, sdr_delay_resposta,
   sdr_msg_boas_vindas, sdr_criterio_desqualificacao)
values
  (
    'funil-sdr-ia-default', '27ef95ee-84dd-499e-9f25-cd9baecb5fe4',
    'Funil SDR IA — MIA-6', 'sdr_ia',
    array['Triagem SDR','Contato Efetuado','Qualificação SDR','Reunião Agendada','Promovido Closer'],
    '[]'::jsonb, true, '{}',
    'Triagem SDR', 'Promovido Closer', 65, 2,
    'Olá! Sou a MIA, assistente comercial da Axis. Poderia me contar um pouco sobre o seu desafio atual?',
    'sem_interesse'
  ),
  (
    '3x7skf56bjq', '27ef95ee-84dd-499e-9f25-cd9baecb5fe4',
    'FUNIL COMERCIAL', 'comercial',
    array['Prospecção','Qualificação','Apresentação','Negociação','Fechamento'],
    '[{"cor":"blue","nome":"Prospecção","iniciarMinimizado":false},{"cor":"orange","nome":"Qualificação","iniciarMinimizado":false},{"cor":"cyan","nome":"Apresentação","iniciarMinimizado":false},{"cor":"emerald","nome":"Negociação","iniciarMinimizado":false},{"cor":"purple","nome":"Fechamento","iniciarMinimizado":false}]'::jsonb,
    true, '{}',
    '', '', 65, 2,
    'Olá! Sou a MIA, assistente comercial da Axis. Poderia me contar um pouco sobre o seu desafio atual?',
    'sem_interesse'
  )
on conflict (id) do nothing;
