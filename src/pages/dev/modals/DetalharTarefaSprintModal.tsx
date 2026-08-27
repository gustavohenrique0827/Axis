import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import type { Column, SprintTask } from '../hooks/useDevSprints';

const COLUMN_OPTIONS: { id: Column; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A Fazer' },
  { id: 'inprogress', label: 'Em Progresso' },
  { id: 'review', label: 'Em Review' },
  { id: 'done', label: 'Concluído' },
];

const TYPE_ICON: Record<string, string> = {
  feature: '✦',
  bug: '🐛',
  chore: '⚙',
  refactor: '♻',
};

const PRIORITY_BADGE: Record<string, string> = {
  crítica: 'bg-red-500/15 text-red-400 border-red-500/25',
  alta: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  média: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  baixa: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

export function DetalharTarefaSprintModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: SprintTask | null;
  onUpdate?: (id: string | number, patch: Partial<Pick<SprintTask, 'title' | 'column'>>) => void | Promise<void>;
  onDelete?: (id: string | number) => void | Promise<void>;
}) {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedColumn, setEditedColumn] = useState<Column>('backlog');

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedColumn(task.column);
    }
  }, [task]);

  const title = useMemo(() => {
    if (!task) return 'Detalhes da Task';
    return task.title;
  }, [task]);

  const hasChanges = task && (editedTitle.trim() !== task.title || editedColumn !== task.column);

  const handleSave = async () => {
    if (!task || !onUpdate || !hasChanges) return;
    const patch: Partial<Pick<SprintTask, 'title' | 'column'>> = {};
    if (editedTitle.trim() && editedTitle.trim() !== task.title) patch.title = editedTitle.trim();
    if (editedColumn !== task.column) patch.column = editedColumn;
    await onUpdate(task.id, patch);
    onClose();
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    await onDelete(task.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-black text-white truncate">Detalhes da Task</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Sprint / Dev & Tecnologia</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {task && onDelete && (
              <Button type="button" variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
              Fechar
            </Button>
            {task && onUpdate && (
              <Button type="button" onClick={handleSave} disabled={!hasChanges} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40">
                Salvar Alterações
              </Button>
            )}
          </div>
        </div>
      }
    >
      {!task ? (
        <div className="text-slate-400 text-sm">Nenhuma task selecionada.</div>
      ) : (
        <div className="space-y-5">
          {/* Title + meta */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-200 font-bold">Task</div>
                {onUpdate ? (
                  <input
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-blue-500/50"
                  />
                ) : (
                  <div className="text-lg font-black text-white leading-snug mt-1 whitespace-pre-line">{title}</div>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <div
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white/[0.02] text-slate-300 border-white/10`}
                >
                  {TYPE_ICON[task.type] ?? '•'} {task.type}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                  PRIORITY_BADGE[task.priority] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                }`}
              >
                {task.priority}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white/[0.02] text-slate-300 border-white/10">
                {task.points} pts
              </span>
              {onUpdate ? (
                <select
                  value={editedColumn}
                  onChange={e => setEditedColumn(e.target.value as Column)}
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white/[0.02] text-slate-300 border-white/10 focus:outline-none focus:border-blue-500/50"
                >
                  {COLUMN_OPTIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white/[0.02] text-slate-300 border-white/10">
                  {task.column}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tags</div>
            {task.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-slate-500 bg-white/[0.03] px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Sem tags</div>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Responsável</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-black text-white border border-white/10">
                {(task.assignee || '?').split('.')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{task.assignee || '?'}</div>
                <div className="text-xs text-slate-500">Assignee do card (campo assignee)</div>
              </div>
            </div>
          </div>

          {/* Readable hint */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Como ler</div>
            <div className="text-sm text-slate-200 mt-2 leading-relaxed">
              O <span className="text-white font-bold">title</span> já vem da IA como um roteiro: objetivo + entrega + critério de qualidade.
              Use as tags e a prioridade para priorizar o trabalho.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

