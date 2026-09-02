import { useState } from "react";
import { ListTodo, Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { Button } from "../button";
import { Card } from "../card";
import { Badge } from "../badge";
import { Input } from "../input";
import { FormField } from "../form-field";
import { confirmDialog } from "../confirm-dialog";

interface TarefasSectionProps {
  lead: any;
  leadName: string;
  seller: string;
}

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
    if (!newTitle.trim()) { toast.error("Título da tarefa é obrigatório."); return; }
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
    toast.success("Tarefa vinculada ao lead com sucesso!");
  };

  const toggleDone = (task: any) => {
    const isDone = task.status === "Concluída";
    updateTask(task.id, { status: isDone ? "A Fazer" : "Concluída" });
  };

  const pending = leadTasks.filter((t) => t.status !== "Concluída" && t.status !== "Cancelado");
  const done = leadTasks.filter((t) => t.status === "Concluída" || t.status === "Cancelado");

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-blue)]/10 border border-[var(--color-primary-blue)]/20 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-[var(--color-primary-blue)]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">Tarefas & Compromissos</p>
            <p className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider">
              {pending.length} pendente{pending.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          size="sm"
          className="text-xs font-bold gap-1.5 h-8"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Tarefa
        </Button>
      </div>

      {/* Formulário nova tarefa */}
      {showForm && (
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] space-y-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-blue)]">
            Cadastrar Nova Tarefa
          </p>

          <FormField label="Título da Tarefa" required>
            <Input
              type="text"
              placeholder="Ex: Ligar para confirmar envio da proposta..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </FormField>

          <FormField label="Descrição (Opcional)">
            <textarea
              placeholder="Detalhes adicionais sobre o compromisso..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] p-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all resize-none"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data Limite">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </FormField>

            <FormField label="Prioridade">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] h-9"
              >
                <option value="Alta">Alta Prioridade</option>
                <option value="Média">Média Prioridade</option>
                <option value="Baixa">Baixa Prioridade</option>
              </select>
            </FormField>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              className="text-xs font-bold"
            >
              Criar Tarefa
            </Button>
          </div>
        </Card>
      )}

      {/* Lista pendentes */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-faint)]">
            Pendentes ({pending.length})
          </p>
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleDone} onDelete={deleteTask} />
          ))}
        </div>
      )}

      {/* Lista concluídas */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-faint)] mt-3">
            Concluídas ({done.length})
          </p>
          {done.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleDone} onDelete={deleteTask} dimmed />
          ))}
        </div>
      )}

      {/* Vazio */}
      {leadTasks.length === 0 && !showForm && (
        <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed border-[var(--color-border-default)] rounded-[var(--radius-panel)]">
          <ListTodo className="w-6 h-6 text-[var(--color-text-faint)]" />
          <p className="text-xs text-[var(--color-text-muted)] font-bold">Nenhuma tarefa associada.</p>
          <p className="text-[11px] text-[var(--color-text-faint)]">Clique no botão acima para agendar uma atividade.</p>
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
    <Card className={cn(
      "flex items-start gap-3 p-3 transition-all",
      dimmed
        ? "bg-[var(--color-surface-sunken)] opacity-60"
        : "bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-default)]"
    )}>
      <button onClick={() => onToggle(task)} className="mt-0.5 shrink-0 cursor-pointer">
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-[var(--color-text-faint)] hover:text-[var(--color-primary-blue)] transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-xs font-bold leading-snug", isDone ? "line-through text-[var(--color-text-faint)]" : "text-[var(--color-text-primary)]")}>
          {task.title}
        </p>
        {(task.description || task.desc) && (
          <p className="text-[11px] text-[var(--color-text-muted)] leading-snug line-clamp-2">{task.description || task.desc}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {task.date && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-faint)] font-medium">
              <Clock className="w-3 h-3" /> {task.date}
            </span>
          )}
          {task.priority && (
            <Badge
              variant={task.priority === "Alta" ? "destructive" : task.priority === "Média" ? "warning" : "secondary"}
              className="text-[9px] py-0 px-1.5"
            >
              {task.priority}
            </Badge>
          )}
          <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
            {task.status}
          </span>
        </div>
      </div>

      <button
        onClick={async () => {
          if (!(await confirmDialog({
            title: "Excluir tarefa",
            description: `Excluir a tarefa "${task.title}"? Essa ação não pode ser desfeita.`,
          }))) return;
          onDelete(task.id);
          toast.info("Tarefa removida.");
        }}
        className="shrink-0 p-1 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] hover:bg-rose-500/10 rounded text-[var(--color-text-faint)] hover:text-rose-500 transition-all cursor-pointer"
        title="Remover Tarefa"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
}
