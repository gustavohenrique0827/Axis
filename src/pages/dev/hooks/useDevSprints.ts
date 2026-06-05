import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { TarefaSprintPayload } from '../modals/NovaTarefaSprintModal';

export type Priority = 'crítica' | 'alta' | 'média' | 'baixa';
export type Column = 'backlog' | 'todo' | 'inprogress' | 'review' | 'done';

export interface SprintTask {
  id: string | number;
  title: string;
  type: 'feature' | 'bug' | 'chore' | 'refactor';
  priority: Priority;
  points: number;
  assignee: string;
  tags: string[];
  column: Column;
}

const COL_MAP: Record<string, Column> = {
  'Backlog': 'backlog', 'A Fazer': 'todo', 'Em Progresso': 'inprogress',
  'Em Review': 'review', 'Concluído': 'done',
};

const MOCK_TASKS: SprintTask[] = [
  { id: 1, title: "Implementar autenticação OAuth2 com Google", type: 'feature', priority: 'alta', points: 8, assignee: "G.H.", tags: ["auth", "backend"], column: 'inprogress' },
  { id: 2, title: "Bug: timeout na requisição de checkout", type: 'bug', priority: 'crítica', points: 5, assignee: "M.L.", tags: ["checkout", "performance"], column: 'todo' },
  { id: 3, title: "Refatorar serviço de notificações push", type: 'refactor', priority: 'média', points: 3, assignee: "A.R.", tags: ["notificações"], column: 'inprogress' },
  { id: 4, title: "Criar endpoint de exportação CSV de leads", type: 'feature', priority: 'média', points: 5, assignee: "P.C.", tags: ["crm", "api"], column: 'review' },
  { id: 5, title: "Atualizar dependências do frontend", type: 'chore', priority: 'baixa', points: 2, assignee: "T.S.", tags: ["deps"], column: 'done' },
  { id: 6, title: "Implementar paginação na listagem de alunos", type: 'feature', priority: 'alta', points: 5, assignee: "G.H.", tags: ["educação", "ui"], column: 'todo' },
  { id: 7, title: "Escrever testes unitários para módulo financeiro", type: 'chore', priority: 'alta', points: 8, assignee: "M.L.", tags: ["testes", "financeiro"], column: 'backlog' },
  { id: 8, title: "Documentar API de integrações externa", type: 'chore', priority: 'média', points: 3, assignee: "A.R.", tags: ["docs", "api"], column: 'backlog' },
  { id: 9, title: "Integrar gateway de pagamento PIX v2", type: 'feature', priority: 'alta', points: 13, assignee: "G.H.", tags: ["pagamento", "pix"], column: 'backlog' },
  { id: 10, title: "Corrigir layout quebrado em mobile no pipeline", type: 'bug', priority: 'alta', points: 3, assignee: "T.S.", tags: ["mobile", "crm"], column: 'review' },
  { id: 11, title: "Implementar dark mode no app mobile", type: 'feature', priority: 'baixa', points: 5, assignee: "L.M.", tags: ["mobile", "ui"], column: 'done' },
];

function rowToTask(row: any): SprintTask {
  return {
    id: row.id,
    title: row.title,
    type: row.type as SprintTask['type'],
    priority: row.priority as Priority,
    points: row.points || 1,
    assignee: row.assignee || '',
    tags: row.tags || [],
    column: row.column_id as Column,
  };
}

export function useDevSprints() {
  const [tasks, setTasks] = useState<SprintTask[]>(MOCK_TASKS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('dev_sprint_tasks')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        setTasks(data.map(rowToTask));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addTask(payload: TarefaSprintPayload) {
    const column = (COL_MAP[payload.column] || 'backlog') as Column;
    if (!supabase) {
      setTasks(prev => [...prev, { id: Date.now(), title: payload.title, type: payload.type, priority: payload.priority, points: payload.points, assignee: payload.assignee || '?', tags: [], column }]);
      toast.success('Tarefa adicionada!');
      return;
    }
    const { data, error } = await supabase
      .from('dev_sprint_tasks')
      .insert({ title: payload.title, type: payload.type, priority: payload.priority, points: payload.points, assignee: payload.assignee || '', column_id: column })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao adicionar tarefa'); return; }
    if (data) {
      setTasks(prev => [...prev, rowToTask(data)]);
      toast.success('Tarefa adicionada!');
    }
  }

  async function moveTask(id: string | number, column: Column) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column } : t));
    if (!supabase) return;
    await supabase.from('dev_sprint_tasks').update({ column_id: column }).eq('id', id);
  }

  return { tasks, loading, addTask, moveTask };
}
