-- Integração HubSpot: credenciais OAuth por tenant, mapeamento de etapas do
-- funil (Axis) para dealstage (HubSpot), e rastreio de sincronização em leads.
--
-- provider é genérico (varchar) para não travar em "hubspot" no schema, mas
-- esta migration só cria linhas de provider='hubspot' — não é uma abstração
-- multi-CRM, é só para não custar nada a mais depois.
--
-- IMPORTANTE: access_token/refresh_token NUNCA devem ser lidos pelo client
-- (supabase-js no browser). RLS por tenant é aplicada aqui como defesa em
-- profundidade (mesmo padrão de whatsapp_instances.evolution_api_token), mas
-- a app NUNCA deve fazer supabase.from('crm_integrations').select(...) do
-- browser — todo acesso a esta tabela passa pelas rotas de server.ts usando
-- supabaseService. Diferente do whatsapp_instances (token de simulador),
-- aqui o token dá acesso de escrita à conta real de HubSpot do cliente.
create table if not exists public.crm_integrations (
  id uuid not null default extensions.uuid_generate_v4(),
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id) on delete cascade,
  provider varchar(50) not null default 'hubspot',
  status varchar(50) not null default 'disconnected', -- disconnected|connected|error
  access_token text null,
  refresh_token text null,
  token_expires_at timestamptz null,
  hub_id text null,           -- HubSpot portalId, exibição/depuração
  hub_domain text null,       -- HubSpot account domain, exibição
  scopes text null,
  connected_by uuid null references public.users(id) on delete set null,
  last_synced_at timestamptz null,
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_integrations_pkey primary key (id),
  constraint crm_integrations_tenant_provider_key unique (tenant_id, provider)
);

create or replace trigger update_crm_integrations_modtime before update
on public.crm_integrations for each row execute function update_modified_column();

alter table public.crm_integrations enable row level security;
create policy tenant_isolation on public.crm_integrations for all to authenticated
using (tenant_id = public.current_tenant_id() or public.is_super_admin())
with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- Mapeamento de estágio local (funil/etapa do Axis, que são texto livre por
-- tenant — ver ConfigCRMFunis.tsx) → dealstage do HubSpot. Sem segredos aqui,
-- pode ser lida/gravada direto pelo client autenticado.
create table if not exists public.crm_stage_mappings (
  id uuid not null default extensions.uuid_generate_v4(),
  tenant_id uuid not null default public.current_tenant_id() references public.tenants(id) on delete cascade,
  provider varchar(50) not null default 'hubspot',
  pipeline_id text not null,            -- Axis "pipelineId" (ex.: 'comercial', 'sdr')
  stage_id text not null,               -- Axis "stageId" (texto livre por tenant)
  external_pipeline_id text not null,   -- HubSpot pipeline id
  external_stage_id text not null,      -- HubSpot dealstage id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_stage_mappings_pkey primary key (id),
  constraint crm_stage_mappings_unique unique (tenant_id, provider, pipeline_id, stage_id)
);

create or replace trigger update_crm_stage_mappings_modtime before update
on public.crm_stage_mappings for each row execute function update_modified_column();

alter table public.crm_stage_mappings enable row level security;
create policy tenant_isolation on public.crm_stage_mappings for all to authenticated
using (tenant_id = public.current_tenant_id() or public.is_super_admin())
with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- Rastreio de sincronização em leads — mesmo padrão de messages.external_id /
-- idx_messages_external_sync, generalizado com external_source para não
-- hardcodar 'hubspot' na coluna (custa zero a mais).
alter table public.leads add column if not exists external_id varchar(255) null;
alter table public.leads add column if not exists external_source varchar(50) null;
alter table public.leads add column if not exists external_synced_at timestamptz null;

create index if not exists idx_leads_external_sync on public.leads
using btree (tenant_id, external_source, external_id) tablespace pg_default
where (external_id is not null);
