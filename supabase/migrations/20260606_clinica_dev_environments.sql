-- =============================================================
-- Migration: Tabelas Clínica (estoque, exames) + Dev Ambientes
-- Projeto: xmpkurzczeanlkdxeizd
-- =============================================================

-- Itens de estoque clínico
CREATE TABLE IF NOT EXISTS estoque_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Geral',
  qty integer NOT NULL DEFAULT 0,
  min_qty integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Normal',
  price text DEFAULT 'R$ 0,00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pedidos de exames laboratoriais
CREATE TABLE IF NOT EXISTS exames_pedidos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient text NOT NULL,
  exam text NOT NULL,
  date text NOT NULL,
  lab text DEFAULT '',
  status text NOT NULL DEFAULT 'Aguardando Coleta',
  result text DEFAULT '-',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ambientes de infraestrutura (dev, staging, prod, qa)
CREATE TABLE IF NOT EXISTS dev_environments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  env_id text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Development',
  status text NOT NULL DEFAULT 'operacional',
  url text DEFAULT '',
  version text DEFAULT 'v1.0.0',
  last_deploy text DEFAULT '',
  uptime text DEFAULT '-',
  region text DEFAULT 'sa-east-1 (São Paulo)',
  metrics jsonb DEFAULT '{"cpu":0,"memory":0,"requests":"0/min","latency":"0ms"}',
  services jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
