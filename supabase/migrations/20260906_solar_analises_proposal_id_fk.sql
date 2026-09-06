-- Conecta o funil fotovoltaico ao módulo real de Propostas (mesma tabela
-- pública/compartilhável usada pelo CRM core via /proposta/:token), em vez de
-- o valor da proposta solar ficar isolado só como um número na própria
-- página de Solar.

alter table public.solar_analises
  add column if not exists proposal_id text references public.proposals(id) on delete set null;
