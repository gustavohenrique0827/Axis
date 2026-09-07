import { Card } from "../../../components/ui/card";
import { Link } from "react-router-dom";
import { Edit, CheckCircle2, Trash2, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Task } from "../../../types";
import { KanbanColConfig } from "../../../hooks/useKanbanConfig";
import { useData } from "../../../contexts/DataContext";

/** Formata `due_date` (ISO) pro estilo "Hoje, 09:00" / "Amanhã" / "12 mar". */
function formatDueDate(iso?: string | null): string {
  if (!iso) return "Sem prazo";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Sem prazo";
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Amanhã, ${time}`;
  if (diffDays === -1) return `Ontem, ${time}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${time}`;
}

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
  const { colaboradores, leads } = useData();
  // `assigned_to` FK pra `users.id`, não `colaboradores.id` — usa `user_id`.
  const sellerOptions = (colaboradores as any[])
    .filter(c => c.status !== "Desligado" && c.departamento === "Vendas")
    .map(c => ({ id: c.user_id as string, nome: c.nome as string }))
    .filter(c => c.id && c.nome);

  const leadLabel = (() => {
    if (!task.lead_id) return "Interno";
    const lead = (leads as any[]).find(l => l.id === task.lead_id);
    return lead ? (lead.company || lead.name) : "Interno";
  })();

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
      className={`p-4 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all hover:scale-105 duration-200 group shadow-lg relative cursor-grab active:cursor-grabbing ${
        draggedTaskId === task.id ? 'opacity-40 scale-95 border-blue-500/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <h4 className={`text-sm font-black text-white italic tracking-tighter uppercase mb-2 leading-snug break-words ${task.status === 'Concluída' ? 'text-slate-500 line-through' : ''}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-2 bg-white/[0.01] border border-white/[0.03] p-1.5 rounded-lg">
        <div className="w-5 h-5 rounded-md bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[9px] font-black text-[#2563EB]">GT</div>
        {task.lead_id ? (
          <Link
            to={`/app/crm/pipeline?leadId=${task.lead_id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-bold truncate flex items-center gap-1 cursor-pointer"
            title="Abrir lead no pipeline"
          >
            <span>{leadLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </Link>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium truncate">{leadLabel}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-4 bg-[var(--color-surface)] border border-white/5 px-2 py-1 rounded-lg">
        <span className="text-[8px] font-black text-slate-500 uppercase shrink-0">Responsável:</span>
        <select
          value={task.assigned_to || ""}
          onChange={(e) => updateTask(task.id, { assigned_to: e.target.value || null })}
          className={`bg-transparent text-[10px] ${task.assigned_to ? 'text-slate-300' : 'text-rose-400 font-black'} font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB] rounded px-1 cursor-pointer w-full`}
        >
          <option value="" className="text-rose-400 font-bold bg-[var(--color-surface)]">Nenhum (Atenção!)</option>
          {sellerOptions.map(c => (
            <option key={c.id} value={c.id} className="text-white bg-[var(--color-surface)]">{c.nome}</option>
          ))}
        </select>
        {!task.assigned_to && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0"/>}
      </div>

      <div className="pt-3 border-t border-white/5 flex flex-col gap-3 justify-between">
        {/* Date and actions */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
            task.status === 'Concluída' ? 'text-slate-500' :
            task.status === 'Atrasado' ? 'text-rose-400' :
            formatDueDate(task.due_date).startsWith('Hoje') ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            <Clock className="w-3 h-3" /> {formatDueDate(task.due_date)}
          </div>

          {/* Action Buttons: Status Toggles & Trash */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => openEditTaskModal(task)}
              className="w-6 h-6 rounded-md border border-slate-700 bg-transparent flex items-center justify-center text-slate-500 hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-all cursor-pointer"
              title="Editar tarefa"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTaskStatus(task.id, task.status)}
              className={`w-6 h-6 rounded-md border bg-transparent flex items-center justify-center transition-all cursor-pointer ${
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
              className="w-6 h-6 rounded-md border border-slate-700 bg-transparent flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/50 transition-all cursor-pointer"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick move dropdown/selectors to jump between columns in card view */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
          <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider">Mudar Etapa</span>
          <div className="flex gap-1">
            {columns.map(col => (
              <button
                key={col.id}
                onClick={() => moveTaskStatus(task.id, col.id)}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all border-none bg-transparent cursor-pointer ${
                  task.status === col.id
                    ? 'bg-white/10 text-white font-extrabold border border-white/10'
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
