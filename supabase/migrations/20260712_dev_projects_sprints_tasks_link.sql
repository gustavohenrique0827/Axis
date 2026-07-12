-- =============================================================
-- Migration: Vincular Projeto ↔ Sprint (tasks) no módulo Dev
-- Data: 20260712
-- =============================================================

-- Observação:
-- A UI/logic atual cria um Kanban global em dev_sprint_tasks.
-- Com esta migration, passamos a suportar:
-- - dev_sprint_tasks.project_id (obrigatório para cálculo de progresso)
-- - dev_sprint_tasks.sprint_id  (opcional/necessário para múltiplas sprints)
--
-- A criação de Sprint(s) e Cards será feita no front (useDevProjects).

-- Colunas de vínculo
ALTER TABLE dev_sprint_tasks
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES dev_projects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sprint_id uuid;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dev_sprint_tasks_project_id ON dev_sprint_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_dev_sprint_tasks_sprint_id ON dev_sprint_tasks(sprint_id);

-- Valores existentes: manter consistência sem quebrar legado.
-- Não setamos project_id em tasks antigas porque pode não existir um projeto.
-- A aplicação deve filtrar por project_id quando suportado.

