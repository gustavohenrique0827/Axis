-- Suporte a KPIs reais no Painel de Energia Solar: valor da proposta (para
-- calcular ticket médio, valor de pipeline e receita) e data de conclusão
-- (para calcular ciclo médio de vendas), sem depender de dados fictícios.

alter table public.solar_analises
  add column if not exists valor_proposta numeric,
  add column if not exists data_conclusao timestamptz;
