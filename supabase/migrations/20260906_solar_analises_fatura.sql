-- Nicho Energia Solar não tinha NENHUMA funcionalidade própria — a landing
-- page promete "cálculo automático da média de consumo e economia
-- estimada" a partir da foto da fatura, mas não existia rota, tabela ou
-- tela nenhuma pra isso. Backend em server.ts (POST /api/ai/solar-analyze-fatura)
-- faz o OCR via Gemini (chave só no servidor); esta tabela guarda o
-- resultado da análise + acompanhamento das etapas do funil fotovoltaico
-- (visita técnica, proposta, homologação, instalação) por lead/cliente.

create table if not exists public.solar_analises (
  id text primary key default (gen_random_uuid())::text,
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id),
  lead_id uuid references public.leads(id) on delete set null,
  cliente text not null,
  distribuidora text,
  consumo_medio_kwh numeric,
  valor_fatura numeric,
  mes_referencia text,
  potencia_estimada_kwp numeric,
  economia_mensal_estimada numeric,
  economia_anual_estimada numeric,
  status text not null default 'Análise Concluída'
    check (status in ('Análise Concluída', 'Visita Técnica', 'Proposta Enviada', 'Homologação', 'Instalação', 'Concluído')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solar_analises enable row level security;

create policy tenant_isolation on public.solar_analises
  for all to authenticated
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

create index if not exists solar_analises_tenant_id_idx on public.solar_analises (tenant_id);
create index if not exists solar_analises_lead_id_idx on public.solar_analises (lead_id);
