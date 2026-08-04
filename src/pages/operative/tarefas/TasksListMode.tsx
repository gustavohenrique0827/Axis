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
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-left">
         <div className="text-sm text-slate-400">
           Minhas demandas registradas ({filteredTasks.length})
         </div>
         <span className="text-xs text-slate-500">Toque para concluir ou gerenciar</span>
      </div>

      <div className="divide-y divide-white/5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => (
            <div key={t.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              {/* Left Column: Actions indicator & Title */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => toggleTaskStatus(t.id, t.status)}
                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    t.status === 'Concluída'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-500 hover:border-white/40'
                  }`}
                  title={t.status === 'Concluída' ? "Marcar como pendente" : "Marcar como concluída"}
                >
                  {t.status === 'Concluída' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                     <span className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                       {t.type}
                     </span>
                     <span className={`text-xs px-2 py-0.5 rounded-md border ${getPriorityColor(t.priority)}`}>
                       {t.priority}
                     </span>
                     <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        t.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        t.status === 'Atrasado' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                     }`}>
                       {t.status}
                     </span>
                  </div>
                  <h4 className={`text-sm font-medium leading-tight ${t.status === 'Concluída' ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>Relacionado a: <span className="text-slate-300 hover:underline cursor-pointer">{t.related}</span></span>
                    <span className="text-slate-700">&bull;</span>
                    <span className="flex items-center gap-1">
                      <span>Responsável:</span>
                      <select
                        value={t.seller || ""}
                        onChange={(e) => updateTask(t.id, { seller: e.target.value })}
                        className="bg-[var(--color-surface-elevated)] text-xs text-slate-300 focus:outline-none rounded px-1.5 py-0.5 border border-white/10 cursor-pointer hover:bg-white/10"
                      >
                        <option value="" className="text-slate-400">Sem responsável</option>
                        {sellerOptions.map(name => (
                          <option key={name} value={name} className="text-white">{name}</option>
                        ))}
                      </select>
                    </span>

                    {t.relatedProductIds && t.relatedProductIds.length > 0 && (
                        <>
                            <span className="text-slate-700">&bull;</span>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-400 truncate max-w-[150px] sm:max-w-xs">{t.relatedProductIds.join(', ')}</span>
                            </span>
                        </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Date, Change Stage & Actions */}
              <div className="flex flex-wrap items-center gap-3 sm:justify-end shrink-0 pl-8 sm:pl-0">
                <div className={`flex items-center gap-1.5 text-xs ${
                  t.status === 'Concluída' ? 'text-slate-500' :
                  t.date.includes('Ontem') || t.status === 'Atrasado' ? 'text-rose-400' :
                  t.date.includes('Hoje') ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.date}</span>
                </div>

                {/* Change columns quickly on list mode */}
                <div className="flex gap-1 items-center bg-[var(--color-surface)] border border-white/5 rounded-lg p-0.5">
                  {columns.map(col => (
                    <button
                      key={col.id}
                      onClick={() => moveTaskStatus(t.id, col.id)}
                      className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                        t.status === col.id
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {col.nome}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <button
                  onClick={() => openEditTaskModal(t)}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Editar tarefa"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Excluir tarefa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center text-slate-500">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhuma tarefa encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Experimente remover filtros de busca ou criar novas demandas no botão acima.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
