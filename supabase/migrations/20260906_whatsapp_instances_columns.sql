-- whatsapp_instances já existia (com RLS/tenant_isolation corretos) mas só tinha
-- id/tenant_id/name/updated_at — nenhuma rota de /api/whatsapp/instances jamais
-- gravava nela, então toda "instância WhatsApp" vivia só em memória do processo
-- Node (instancesByTenant em server.ts) e sumia a cada deploy/restart. Isso é
-- parte do trabalho da Fase 13 (abstração Simulador vs. Evolution API real):
-- agora instâncias passam a ser persistidas de verdade, com um campo `provider`
-- pra deixar explícito se aquela instância é simulada ou uma conexão real.
alter table public.whatsapp_instances
  add column if not exists phone text,
  add column if not exists status text not null default 'DISCONNECTED' check (status in ('CONNECTED', 'DISCONNECTED', 'CONNECTING')),
  add column if not exists api_key text,
  add column if not exists webhook_url text,
  add column if not exists qrcode text,
  add column if not exists provider text not null default 'simulator' check (provider in ('simulator', 'evolution')),
  add column if not exists created_at timestamptz not null default now();
