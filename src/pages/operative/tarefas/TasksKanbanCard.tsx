import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Edit, CheckCircle2, Trash2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Task } from "../../../types";

interface TasksKanbanCardProps {
  task: Task;
  draggedTaskId: string | null;
  setDraggedTaskId: (id: string | null) => void;
  setDraggedOverCol: (col: 'Atrasado' | 'Em Aberto' | 'Concluída' | null) => void;
  getPriorityColor: (p: string) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setSearchQuery: (q: string) => void;
  openEditTaskModal: (task: Task) => void;
  toggleTaskStatus: (id: string, currentStatus: string) => void;
  handleDeleteTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: 'Atrasado' | 'Em Aberto' | 'Concluída') => void;
  columns: ('Atrasado' | 'Em Aberto' | 'Concluída')[];
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
      className={`p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all hover:scale-105 duration-200 group shadow-lg relative cursor-grab active:cursor-grabbing ${
        draggedTaskId === task.id ? 'opacity-40 scale-95 border-blue-500/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <span className="text-[9px] font-black text-[#06B6D4] uppercase tracking-widest bg-[#06B6D4]/10 px-2 py-0.5 rounded-md border border-[#06B6D4]/5">
          {task.type}
        </span>
        <div className="flex gap-1.5 items-center">
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <h4 className={`text-sm font-black text-white italic tracking-tighter uppercase mb-2 leading-snug break-words ${task.status === 'Concluída' ? 'text-slate-500 line-through' : ''}`}>
        {task.title}
      </h4>

      <div className="flex items-center gap-2 mb-2 bg-white/[0.01] border border-white/[0.03] p-1.5 rounded-lg">
        <div className="w-5 h-5 rounded-md bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[9px] font-black text-[#2563EB]">GT</div>
        <span className="text-[10px] text-slate-400 font-medium truncate">{task.related}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-4 bg-[#0B1120] border border-white/5 px-2 py-1 rounded-lg">
        <span className="text-[8px] font-black text-slate-500 uppercase shrink-0">Responsável:</span>
        <select
          value={task.seller || ""}
          onChange={(e) => updateTask(task.id, { seller: e.target.value })}
          className={`bg-transparent text-[10px] ${task.seller ? 'text-slate-300' : 'text-rose-400 font-black'} font-bold focus:outline-none focus:ring-1 focus:ring-[#2563EB] rounded px-1 cursor-pointer w-full`}
        >
          <option value="" className="text-rose-400 font-bold bg-[#0B1120]">Nenhum (Atenção!)</option>
          <option value="Carlos Eduardo Mendes" className="text-white bg-[#0B1120]">Carlos Eduardo Mendes</option>
          <option value="Ana Silva" className="text-white bg-[#0B1120]">Ana Silva</option>
          <option value="Roberto Ramos" className="text-white bg-[#0B1120]">Roberto Ramos</option>
          <option value="Juliana Costa" className="text-white bg-[#0B1120]">Juliana Costa</option>
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
            className="text-[9px] bg-white/5 px-1.5 py-0.5 text-slate-400 rounded-md hover:bg-[#2563EB]/20 hover:text-white border-none cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>

      {task.relatedProductIds && task.relatedProductIds.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.relatedProductIds.map((prod, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20 flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              {prod}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-white/5 flex flex-col gap-3 justify-between">
        {/* Date and actions */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
            task.status === 'Concluída' ? 'text-slate-500' :
            task.status === 'Atrasado' ? 'text-rose-400' :
            task.date.includes('Hoje') ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            <Clock className="w-3 h-3" /> {task.date}
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
            {columns.map(statusOption => (
              <button
                key={statusOption}
                onClick={() => moveTaskStatus(task.id, statusOption)}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all border-none bg-transparent cursor-pointer ${
                  task.status === statusOption
                    ? 'bg-white/10 text-white font-extrabold border border-white/10'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {statusOption === "Em Aberto" ? "Aberto" : statusOption === "Concluída" ? "Concluir" : "Atrasar"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
