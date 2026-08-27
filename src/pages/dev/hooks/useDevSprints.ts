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
  project?: string;
}

const COL_MAP: Record<string, Column> = {
  'Backlog': 'backlog', 'A Fazer': 'todo', 'Em Progresso': 'inprogress',
  'Em Review': 'review', 'Concluído': 'done',
};



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
    project: row.project ?? row.project_id ?? undefined,
  };
}

export function useDevSprints(projectId?: string | null) {
  const [tasks, setTasks] = useState<SprintTask[]>([]);


  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!supabase) return;

    async function load() {
      setLoading(true);
      let query = supabase!.from('dev_sprint_tasks').select('*');
      // Sem projectId: agrega tasks de todos os projetos (uso em dashboards).
      // Com projectId: suporta o schema novo (project_id) e legado (project).
      if (projectId) {
        query = query.or(`project_id.eq.${projectId},project.eq.${projectId}`);
      }
      const { data, error } = await query.order('created_at', { ascending: true });

      if (!error && data !== null) {
        setTasks(data.map(rowToTask));
      }
      setLoading(false);
    }

    load();
  }, [projectId]);


  async function addTask(payload: TarefaSprintPayload) {
    const column = (COL_MAP[payload.column] || 'backlog') as Column;

    if (!projectId) {
      toast.error('Selecione um projeto para adicionar tarefas.');
      return;
    }

    if (!supabase) {
      setTasks(prev => [...prev, { id: Date.now(), title: payload.title, type: payload.type, priority: payload.priority, points: payload.points, assignee: payload.assignee || '?', tags: [], column }]);
      toast.success('Tarefa adicionada!');
      return;
    }

    const { data, error } = await supabase
      .from('dev_sprint_tasks')
      .insert({
        title: payload.title,
        type: payload.type,
        priority: payload.priority,
        points: payload.points,
        assignee: payload.assignee || '',
        tags: [],
        column_id: column,
        project: projectId,
        sprint_id: projectId,
      })
      .select()
      .maybeSingle();

    if (error) { toast.error('Erro ao adicionar tarefa'); return; }
    if (data) {
      setTasks(prev => [...prev, rowToTask(data)]);
      toast.success('Tarefa adicionada!');
    }
  }


  async function moveTask(id: string | number, column: Column) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, column } : t)));
    if (!supabase) return;

    // Atualiza card
    await supabase
      .from('dev_sprint_tasks')
      .update({ column_id: column })
      .eq('id', id);

    // Recalcula progresso do projeto (100% automático)
    // Progresso = cards concluídos / total backlog do projeto
    if (!projectId) return;

    const { data: tasksAfter } = await supabase
      .from('dev_sprint_tasks')
      .select('column_id, points')
      .eq('project', projectId);

    if (!tasksAfter) return;

    const backlogPoints = tasksAfter
      .filter((t: any) => t.column_id === 'backlog')
      .reduce((s: number, t: any) => s + (t.points || 0), 0);

    const donePoints = tasksAfter
      .filter((t: any) => t.column_id === 'done')
      .reduce((s: number, t: any) => s + (t.points || 0), 0);

    const nextProgress = backlogPoints > 0 ? Math.round((donePoints / backlogPoints) * 100) : 0;

    await supabase
      .from('dev_projects')
      .update({ progress: nextProgress })
      .eq('id', projectId);
  }


  async function updateTask(id: string | number, patch: Partial<Pick<SprintTask, 'title' | 'type' | 'priority' | 'points' | 'assignee' | 'tags' | 'column'>>) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));

    if (!supabase) {
      toast.success('Tarefa atualizada!');
      return;
    }

    const dbPatch: Record<string, any> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.priority !== undefined) dbPatch.priority = patch.priority;
    if (patch.points !== undefined) dbPatch.points = patch.points;
    if (patch.assignee !== undefined) dbPatch.assignee = patch.assignee;
    if (patch.tags !== undefined) dbPatch.tags = patch.tags;
    if (patch.column !== undefined) dbPatch.column_id = patch.column;

    const { error } = await supabase.from('dev_sprint_tasks').update(dbPatch).eq('id', id);
    if (error) { toast.error('Erro ao atualizar tarefa'); return; }
    toast.success('Tarefa atualizada!');
  }

  async function deleteTask(id: string | number) {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (!supabase) {
      toast.success('Tarefa removida.');
      return;
    }
    const { error } = await supabase.from('dev_sprint_tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover tarefa'); return; }
    toast.success('Tarefa removida.');
  }

  return { tasks, loading, addTask, moveTask, updateTask, deleteTask };
}
