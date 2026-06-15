import { useState } from "react";
import { ListTodo, Plus, CheckCircle2, Circle, Clock, AlertTriangle, Trash2, Tag } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

interface TarefasSectionProps {
  lead: any;
  leadName: string;
  seller: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta:  "bg-rose-500/10 border-rose-500/20 text-rose-400",
  Média: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  Baixa: "bg-slate-700/40 border-white/10 text-slate-400",
};

const STATUS_COLORS: Record<string, string> = {
  "A Fazer":    "text-blue-400",
  "Em Aberto":  "text-slate-400",
  "Concluída":  "text-emerald-400",
  "Aguardando": "text-amber-400",
  "Atrasado":   "text-rose-400",
  "Cancelado":  "text-slate-600",
};

export function TarefasSection({ lead, leadName, seller }: TarefasSectionProps) {
  const { tasks, addTask, updateTask, deleteTask } = useData();

  const leadTasks = (tasks as any[]).filter(
    (t) => t.related === lead.id || t.related === leadName || t.related === lead.company
  );

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newPriority, setNewPriority] = useState<"Alta" | "Média" | "Baixa">("Média");

  const handleAdd = () => {
    if (!newTitle.trim()) { toast.error("Título obrigatório."); return; }
    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      related: lead.id,
      type: "CRM",
      date: newDate,
      status: "A Fazer",
      priority: newPriority,
      seller: seller || "Sistema",
    });
    setNewTitle("");
    setNewDesc("");
    setNewPriority("Média");
    setShowForm(false);
    toast.success("Tarefa criada!");
  };

  const toggleDone = (task: any) => {
    const isDone = task.status === "Concluída";
    updateTask(task.id, { status: isDone ? "A Fazer" : "Concluída" });
  };

  const pending = leadTasks.filter((t) => t.status !== "Concluída" && t.status !== "Cancelado");
  const done    = leadTasks.filter((t) => t.status === "Concluída" || t.status === "Cancelado");

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <ListTodo className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Tarefas do Lead</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">
              {pending.length} pendente{pending.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-blue-500/20"
        >
          <Plus className="w-3 h-3" /> Nova Tarefa
        </button>
      </div>

      {/* Formulário nova tarefa */}
      {showForm && (
        <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Nova Tarefa</p>

          <input
            type="text"
            placeholder="Título da tarefa..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full bg-[#070E1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all"
          />

          <textarea
            placeholder="Descrição (opcional)..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="w-full bg-[#070E1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all resize-none"
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Criar Tarefa
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista pendentes */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Pendentes ({pending.length})</p>
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleDone} onDelete={deleteTask} />
          ))}
        </div>
      )}

      {/* Lista concluídas */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-3">Concluídas ({done.length})</p>
          {done.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleDone} onDelete={deleteTask} dimmed />
          ))}
        </div>
      )}

      {/* Vazio */}
      {leadTasks.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-2 py-10 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <ListTodo className="w-8 h-8 text-slate-700" />
          <p className="text-[10px] text-slate-600 font-bold">Nenhuma tarefa para este lead.</p>
          <p className="text-[9px] text-slate-700">Clique em "Nova Tarefa" para criar uma.</p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, dimmed }: {
  task: any;
  onToggle: (t: any) => void;
  onDelete: (id: string) => void;
  dimmed?: boolean;
}) {
  const isDone = task.status === "Concluída" || task.status === "Cancelado";

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl border transition-all",
      dimmed
        ? "bg-white/[0.01] border-white/[0.04] opacity-50"
        : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.10]"
    )}>
      <button onClick={() => onToggle(task)} className="mt-0.5 shrink-0">
        {isDone
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          : <Circle className="w-4 h-4 text-slate-600 hover:text-blue-400 transition-colors" />
        }
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-xs font-bold leading-snug", isDone ? "line-through text-slate-600" : "text-white")}>
          {task.title}
        </p>
        {(task.description || task.desc) && (
          <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">{task.description || task.desc}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {task.date && (
            <span className="flex items-center gap-1 text-[9px] text-slate-600 font-bold">
              <Clock className="w-2.5 h-2.5" /> {task.date}
            </span>
          )}
          {task.priority && (
            <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider", PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.Média)}>
              {task.priority}
            </span>
          )}
          <span className={cn("text-[8px] font-black uppercase tracking-wider", STATUS_COLORS[task.status] ?? "text-slate-500")}>
            {task.status}
          </span>
        </div>
      </div>

      <button
        onClick={() => { onDelete(task.id); toast.info("Tarefa removida."); }}
        className="shrink-0 p-1 hover:bg-rose-500/10 rounded-lg text-slate-700 hover:text-rose-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
