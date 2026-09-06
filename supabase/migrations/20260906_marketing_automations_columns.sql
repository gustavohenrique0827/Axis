-- A tabela marketing_automations existia só com id/tenant_id/created_at — a
-- página de Automações (src/pages/marketing/MarketingAutomacoes.tsx) nunca
-- conseguia persistir de verdade um fluxo criado ou uma pausa/ativação,
-- apesar do toast dizer "sucesso". Adiciona as colunas reais que a página
-- precisa para funcionar de fato.

alter table public.marketing_automations
  add column if not exists name text not null default 'Nova automação',
  add column if not exists trigger text,
  add column if not exists steps integer not null default 1,
  add column if not exists active_count integer not null default 0,
  add column if not exists conversion_rate numeric not null default 0,
  add column if not exists status text not null default 'Rascunho',
  add column if not exists last_run timestamptz;

alter table public.marketing_automations alter column name drop default;
