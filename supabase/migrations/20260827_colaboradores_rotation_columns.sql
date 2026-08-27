-- =============================================================
-- AXIS — o toggle de disponibilidade de closers (Configurações >
-- Rodízio de Leads > Closers) e o status Ativo/Inativo do colaborador
-- viviam desconectados: a UI gravava active/blocked/leadTypes só no
-- localStorage do navegador ("axis_rotation_config"), enquanto a
-- automação n8n "Julia" decide o próximo vendedor lendo direto do
-- Supabase (ver tabela julia_round_robin_state). Resultado: marcar
-- alguém como Inativo em RH nunca refletia na distribuição real de
-- leads, porque nada disso chegava ao banco.
--
-- Estas colunas passam a ser a fonte de verdade da disponibilidade de
-- um colaborador no rodízio, substituindo o "axis_rotation_config"
-- local. tenant_id/RLS já existem na tabela colaboradores (policy
-- tenant_isolation), então não é preciso nada além das colunas.
-- =============================================================

alter table public.colaboradores
  add column if not exists rotation_active boolean not null default true,
  add column if not exists rotation_blocked boolean not null default false,
  add column if not exists rotation_lead_types text[] not null default '{}';
