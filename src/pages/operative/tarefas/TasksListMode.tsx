import { Card } from "../../../components/ui/card";
import {
  CheckCircle2, Calendar, Edit, Trash2, CheckSquare, Sparkles
} from "lucide-react";
import { Task } from "../../../types";
import { KanbanColConfig } from "../../../hooks/useKanbanConfig";
import { useData } from "../../../contexts/DataContext";

interface TasksListModeProps {
  filteredTasks: Task[];
  toggleTaskStatus: (id: string, status: string) => void;
  moveTaskStatus: (id: string, newStatus: string) => void;
  openEditTaskModal: (task: Task) => void;
  handleDeleteTask: (id: string) => void;
  updateTask: any;
  getPriorityColor: (p: string) => string;
  columns: KanbanColConfig[];
}

export function TasksListMode({
  filteredTasks,
  toggleTaskStatus,
  moveTaskStatus,
  openEditTaskModal,
  handleDeleteTask,
  updateTask,
  getPriorityColor,
  columns
}: TasksListModeProps) {
  const { colaboradores } = useData();
  const sellerOptions = (colaboradores as any[])
    .filter(c => c.status !== "Desligado" && c.departamento === "Vendas")
    .map(c => c.nome as string)
    .filter(Boolean);

  return (
    <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm rounded-2xl">
      <div className="px-5 py-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] flex flex-wrap items-center justify-between gap-3 text-left">
         <div className="text-xs font-bold text-[var(--color-text-primary)]">
           Minhas demandas registradas ({filteredTasks.length})
         </div>
         <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Toque no checkbox para concluir ou gerenciar</span>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => (
            <div key={t.id} className="p-4 hover:bg-[var(--color-surface-sunken)]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              {/* Left Column: Actions indicator & Title */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button 
                  type="button"
                  onClick={() => toggleTaskStatus(t.id, t.status)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    t.status === 'Concluída' 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : 'border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] bg-[var(--color-surface)]'
                  }`}
                  title={t.status === 'Concluída' ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {t.status === 'Concluída' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                     <span className="text-[10px] font-bold uppercase bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-md">
                       {t.type}
                     </span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(t.priority)}`}>
                       {t.priority}
                     </span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                        t.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        t.status === 'Atrasado' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                     }`}>
                       {t.status}
                     </span>
                  </div>
                  <h4 className={`text-xs font-bold leading-snug ${t.status === 'Concluída' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1 font-medium flex flex-wrap items-center gap-2">
                    <span>Relacionado a: <strong className="text-[var(--color-primary-blue)]">{t.related}</strong></span>
                    <span className="text-[var(--color-border-default)]">&bull;</span>
                    <span className="flex items-center gap-1">
                      <span>Responsável:</span>
                      <select
                        value={t.seller || ""}
                        onChange={(e) => updateTask(t.id, { seller: e.target.value })}
                        className="bg-[var(--color-surface-sunken)] text-xs text-[var(--color-text-primary)] font-bold focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-blue)] rounded px-2 py-0.5 border border-[var(--color-border-default)] cursor-pointer"
                      >
                        <option value="" className="text-[var(--color-text-muted)]">Sem responsável</option>
                        {sellerOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </span>
                    
                    {t.relatedProductIds && t.relatedProductIds.length > 0 && (
                        <>
                            <span className="text-[var(--color-border-default)]">&bull;</span>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[var(--color-primary-blue)]" />
                                <span className="text-[var(--color-primary-blue)] font-bold truncate max-w-[150px] sm:max-w-xs">{t.relatedProductIds.join(', ')}</span>
                            </span>
                        </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Date, Change Stage & Actions */}
              <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0 pl-8 sm:pl-0">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                  t.status === 'Concluída' ? 'text-[var(--color-text-muted)]' :
                  t.date.includes('Ontem') || t.status === 'Atrasado' ? 'text-rose-500 font-bold' : 
                  t.date.includes('Hoje') ? 'text-amber-500 font-bold' : 'text-[var(--color-text-muted)]'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.date}</span>
                </div>

                {/* Change columns quickly on list mode */}
                <div className="flex gap-1 items-center bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] p-0.5">
                  {columns.map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => moveTaskStatus(t.id, col.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                        t.status === col.id
                        ? 'bg-[var(--color-primary-blue)] !text-white shadow-xs'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      {col.nome}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <button 
                  type="button"
                  onClick={() => openEditTaskModal(t)}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] rounded-lg transition-colors cursor-pointer"
                  title="Editar tarefa"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Excluir tarefa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center text-[var(--color-text-muted)]">
            <CheckSquare className="w-10 h-10 opacity-30 mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--color-text-primary)]">Nenhuma tarefa encontrada</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Experimente remover filtros de busca ou criar novas demandas no botão acima.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
