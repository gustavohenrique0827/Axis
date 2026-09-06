-- Painel de Telemedicina tinha um botão "Salvar no Prontuário" que só
-- mostrava um toast de sucesso — a textarea nem era controlada (sem
-- value/onChange), o texto digitado nunca ia a lugar nenhum. Agora persiste
-- de verdade em appointments.notes (aditivo — não afeta os ~outros
-- consumidores de `appointments`, que já leem a linha inteira via
-- select('*') e ignoram colunas que não conhecem).
alter table public.appointments
  add column if not exists notes text;
