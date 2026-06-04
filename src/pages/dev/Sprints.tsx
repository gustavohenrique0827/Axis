import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { NovaTarefaSprintModal, type TarefaSprintPayload } from "./modals/NovaTarefaSprintModal";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";

type Priority = 'crítica' | 'alta' | 'média' | 'baixa';
type Column = 'backlog' | 'todo' | 'inprogress' | 'review' | 'done';

interface Task {
  id: number;
  title: string;
  type: 'feature' | 'bug' | 'chore' | 'refactor';
  priority: Priority;
  points: number;
  assignee: string;
  tags: string[];
  column: Column;
}

const PRIORITY_STYLE: Record<Priority, string> = {
  crítica: 'bg-red-500/15 text-red-400 border-red-500/25',
  alta: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  média: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  baixa: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

const TYPE_ICON: Record<string, string> = {
  feature: '✦',
  bug: '🐛',
  chore: '⚙',
  refactor: '♻',
};

const TYPE_COLOR: Record<string, string> = {
  feature: 'text-blue-400',
  bug: 'text-red-400',
  chore: 'text-slate-400',
  refactor: 'text-indigo-400',
};

const INITIAL_TASKS: Task[] = [
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

const COLUMNS: { id: Column; label: string; accent: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Backlog', accent: 'border-slate-700', dotColor: 'bg-slate-500' },
  { id: 'todo', label: 'A Fazer', accent: 'border-blue-500/30', dotColor: 'bg-blue-500' },
  { id: 'inprogress', label: 'Em Progresso', accent: 'border-amber-500/30', dotColor: 'bg-amber-500' },
  { id: 'review', label: 'Em Review', accent: 'border-indigo-500/30', dotColor: 'bg-indigo-500' },
  { id: 'done', label: 'Concluído', accent: 'border-emerald-500/30', dotColor: 'bg-emerald-500' },
];

export default function Sprints() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTarefa = (data: TarefaSprintPayload) => {
    const colMap: Record<string, Column> = {
      'Backlog': 'backlog', 'A Fazer': 'todo', 'Em Progresso': 'inprogress',
      'Em Review': 'review', 'Concluído': 'done',
    };
    setTasks(prev => [...prev, {
      id: Date.now(), title: data.title, type: data.type, priority: data.priority,
      points: data.points, assignee: data.assignee || '?', tags: [],
      column: (colMap[data.column] || 'backlog') as Column,
    }]);
  };

  const totalPoints = tasks.filter(t => t.column === 'done').reduce((s, t) => s + t.points, 0);
  const totalSprintPoints = tasks.reduce((s, t) => s + t.points, 0);

  const handleDragStart = (id: number) => setDraggedId(id);

  const handleDrop = (col: Column) => {
    if (draggedId === null) return;
    setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, column: col } : t));
    setDraggedId(null);
    setDragOverCol(null);
  };

  return (
    <PageContainer
      title="Sprint Atual"
      description="Quadro Kanban do sprint em andamento — arraste os cards para mover entre etapas."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Sprints" }]}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {totalPoints}/{totalSprintPoints} pts concluídos
            </span>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Plus className="w-4 h-4" /> Nova Task
          </Button>
        </div>
      }
    >
      <div className="pb-10">
        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.column === col.id);
            const colPoints = colTasks.reduce((s, t) => s + t.points, 0);
            return (
              <div
                key={col.id}
                className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border ${dragOverCol === col.id ? 'border-blue-500/40 bg-blue-600/[0.03]' : 'border-white/5 bg-[#0B1120]/40'} transition-all`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{col.label}</span>
                    <span className="text-[10px] font-black text-slate-500 ml-1">{colTasks.length}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold">{colPoints}pts</span>
                </div>

                {/* Tasks */}
                <div className="flex-1 p-3 space-y-3 min-h-[120px]">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`p-4 bg-[#111827] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:border-white/10 transition-all select-none group ${draggedId === task.id ? 'opacity-40 scale-95' : ''}`}
                    >
                      {/* Type + Priority */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${TYPE_COLOR[task.type]}`}>
                          {TYPE_ICON[task.type]} {task.type}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${PRIORITY_STYLE[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="text-xs font-bold text-white leading-snug mb-3">{task.title}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-black text-white border border-white/10">
                          {task.assignee.split('.')[0]}
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{task.points}pts</span>
                      </div>
                    </div>
                  ))}

                  {/* Add card */}
                  <button className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] rounded-xl transition-all border border-dashed border-white/[0.04] hover:border-white/10">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Adicionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NovaTarefaSprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTarefa}
      />
    </PageContainer>
  );
}
