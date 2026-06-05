-- =============================================================
-- Migration: Tabelas do módulo Dev & Tecnologia
-- Projeto: xmpkurzczeanlkdxeizd
-- Executar no Supabase SQL Editor: https://supabase.com/dashboard
-- =============================================================

-- Projetos de desenvolvimento
CREATE TABLE IF NOT EXISTS dev_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'Em Planejamento',
  progress integer DEFAULT 0,
  stack text[] DEFAULT '{}',
  team text[] DEFAULT '{}',
  last_commit text DEFAULT '',
  open_issues integer DEFAULT 0,
  sprints integer DEFAULT 0,
  stars integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sequência para número legível de issues
CREATE SEQUENCE IF NOT EXISTS dev_issue_number_seq START WITH 300;

-- Issues e bugs
CREATE TABLE IF NOT EXISTS dev_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number integer DEFAULT nextval('dev_issue_number_seq'),
  title text NOT NULL,
  description text DEFAULT '',
  severity text NOT NULL DEFAULT 'médio',
  status text NOT NULL DEFAULT 'aberto',
  project text DEFAULT '',
  assignee text DEFAULT '-',
  reporter text DEFAULT '',
  labels text[] DEFAULT '{}',
  comments integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tarefas do sprint (Kanban)
CREATE TABLE IF NOT EXISTS dev_sprint_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'feature',
  priority text NOT NULL DEFAULT 'média',
  points integer DEFAULT 1,
  assignee text DEFAULT '',
  tags text[] DEFAULT '{}',
  column_id text NOT NULL DEFAULT 'backlog',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Repositórios de código
CREATE TABLE IF NOT EXISTS dev_repositories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  language text DEFAULT 'TypeScript',
  visibility text DEFAULT 'private',
  status text DEFAULT 'ativo',
  branches integer DEFAULT 1,
  stars integer DEFAULT 0,
  forks integer DEFAULT 0,
  last_commit text DEFAULT '',
  open_prs integer DEFAULT 0,
  contributors text[] DEFAULT '{}',
  size text DEFAULT '0 MB',
  url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membros da equipe geral (página /app/equipe)
CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  email text DEFAULT '',
  deals integer DEFAULT 0,
  revenue text DEFAULT 'R$ 0',
  status text DEFAULT 'Ativo',
  squad text DEFAULT 'Sem squad',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Squads da empresa
CREATE TABLE IF NOT EXISTS squads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  leader text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
