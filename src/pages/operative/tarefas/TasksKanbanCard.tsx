import { Card } from "../../../components/ui/card";
import { Edit, CheckCircle2, Trash2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Task } from "../../../types";
import { KanbanColConfig } from "../../../hooks/useKanbanConfig";
import { useData } from "../../../contexts/DataContext";

interface TasksKanbanCardProps {
  task: Task;
  draggedTaskId: string | null;
  setDraggedTaskId: (id: string | null) => void;
  setDraggedOverCol: (col: string | null) => void;
  getPriorityColor: (p: string) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setSearchQuery: (q: string) => void;
  openEditTaskModal: (task: Task) => void;
  toggleTaskStatus: (id: string, currentStatus: string) => void;
  handleDeleteTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: string) => void;
  columns: KanbanColConfig[];
}

export function TasksKanbanCard({
  task,
  draggedTaskId,
  setDraggedTaskId,
  setDraggedOverCol,
  getPriorityColor,
  updateTask,
  setSearchQuery,
  openEditTaskModal,
  toggleTaskStatus,
  handleDeleteTask,
  moveTaskStatus,
  columns,
}: TasksKanbanCardProps) {
  const { colaboradores } = useData();
  const sellerOptions = (colaboradores as any[])
    .filter(c => c.status !== "Desligado" && c.departamento === "Vendas")
    .map(c => c.nome as string)
    .filter(Boolean);

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        setDraggedTaskId(task.id);
      }}
      onDragEnd={() => {
        setDraggedTaskId(null);
        setDraggedOverCol(null);
      }}
      className={`p-4 hover:border-white/20 transition-colors cursor-grab active:cursor-grabbing ${
        draggedTaskId === task.id ? 'opacity-40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
          {task.type}
        </span>
        <div className="flex gap-1.5 items-center">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <h4 className={`text-sm font-medium text-white mb-2 leading-snug break-words ${task.status === 'Concluída' ? 'text-slate-500 line-through' : ''}`}>
        {task.title}
      </h4>

      <div className="mb-2 text-xs text-slate-400 truncate">
        {task.related}
      </div>

      <div className="flex items-center gap-1.5 mb-4 bg-[var(--color-surface)] border border-white/5 px-2 py-1 rounded-lg">
        <span className="text-xs text-slate-500 shrink-0">Responsável:</span>
        <select
          value={task.seller || ""}
          onChange={(e) => updateTask(task.id, { seller: e.target.value })}
          className={`bg-transparent text-xs ${task.seller ? 'text-slate-300' : 'text-rose-400'} focus:outline-none rounded px-1 cursor-pointer w-full`}
        >
          <option value="" className="text-rose-400 bg-[var(--color-surface)]">Nenhum (Atenção!)</option>
          {sellerOptions.map(name => (
            <option key={name} value={name} className="text-white bg-[var(--color-surface)]">{name}</option>
          ))}
        </select>
        {!task.seller && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0"/>}
      </div>

      <div className="flex gap-1 flex-wrap mb-3">
        {(task.tags || []).map((tag, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery(tag);
            }}
            className="text-xs bg-white/5 px-1.5 py-0.5 text-slate-400 rounded-md hover:bg-white/10 hover:text-white border-none cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>

      {task.relatedProductIds && task.relatedProductIds.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.relatedProductIds.map((prod, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              {prod}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-white/5 flex flex-col gap-3 justify-between">
        {/* Date and actions */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-xs ${
            task.status === 'Concluída' ? 'text-slate-500' :
            task.status === 'Atrasado' ? 'text-rose-400' :
            task.date.includes('Hoje') ? 'text-amber-400' : 'text-slate-400'
          }`}>
            <Clock className="w-3 h-3" /> {task.date}
          </div>

          {/* Action Buttons: Status Toggles & Trash */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => openEditTaskModal(task)}
              className="w-6 h-6 rounded-md border border-slate-700 bg-transparent flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              title="Editar tarefa"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTaskStatus(task.id, task.status)}
              className={`w-6 h-6 rounded-md border bg-transparent flex items-center justify-center transition-colors cursor-pointer ${
                task.status === 'Concluída'
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-700 hover:border-emerald-500 text-slate-500 hover:text-white'
              }`}
              title={task.status === 'Concluída' ? "Reabrir tarefa" : "Concluir tarefa"}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDeleteTask(task.id)}
              className="w-6 h-6 rounded-md border border-slate-700 bg-transparent flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/50 transition-colors cursor-pointer"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick move dropdown/selectors to jump between columns in card view */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
          <span className="text-xs text-slate-500">Mudar Etapa</span>
          <div className="flex gap-1">
            {columns.map(col => (
              <button
                key={col.id}
                onClick={() => moveTaskStatus(task.id, col.id)}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors border-none bg-transparent cursor-pointer ${
                  task.status === col.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {col.nome}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
