import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { Task } from "../../../types";
import { TasksKanbanCard } from "./TasksKanbanCard";
import { KanbanColConfig, KANBAN_COR_CLASS, KANBAN_COR_DOT } from "../../../hooks/useKanbanConfig";

interface TasksKanbanModeProps {
  columns: KanbanColConfig[];
  filteredTasks: Task[];
  mobileActiveCol: string;
  setMobileActiveCol: (col: string) => void;
  draggedTaskId: string | null;
  setDraggedTaskId: (id: string | null) => void;
  draggedOverCol: string | null;
  setDraggedOverCol: (col: string | null) => void;
  openNewTaskModal: () => void;
  moveTaskStatus: (id: string, newStatus: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  openEditTaskModal: (task: Task) => void;
  toggleTaskStatus: (id: string, currentStatus: string) => void;
  handleDeleteTask: (id: string) => void;
  setSearchQuery: (q: string) => void;
  getPriorityColor: (p: string) => string;
}

export function TasksKanbanMode({
  columns,
  filteredTasks,
  mobileActiveCol,
  setMobileActiveCol,
  draggedTaskId,
  setDraggedTaskId,
  draggedOverCol,
  setDraggedOverCol,
  openNewTaskModal,
  moveTaskStatus,
  updateTask,
  openEditTaskModal,
  toggleTaskStatus,
  handleDeleteTask,
  setSearchQuery,
  getPriorityColor,
}: TasksKanbanModeProps) {
  return (
    <div className="space-y-4">
      {/* Mobile Segments Header */}
      <div className="flex md:hidden bg-[var(--color-surface)] border border-white/10 rounded-2xl p-1 w-full shrink-0 relative">
        {columns.map(col => {
          const isActive = mobileActiveCol === col.id;
          const count = filteredTasks.filter(t => t.status === col.id).length;
          const dotColor = KANBAN_COR_DOT[col.cor] ?? '#64748b';

          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveCol(col.id)}
              className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all relative flex items-center justify-center gap-2 select-none cursor-pointer border-none bg-transparent"
            >
              {isActive && (
                <motion.div
                  layoutId="activeKanbanTabIndicator"
                  className="absolute inset-0 bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isActive ? '#60a5fa' : dotColor }}
                />
                <span className={isActive ? "text-white font-extrabold" : "text-slate-400 font-medium hover:text-white"}>
                  {col.nome}
                </span>
              </span>
              <span className={`relative z-10 text-[9px] px-1.5 py-0.5 rounded-full font-black transition-colors ${
                isActive ? 'bg-[#2563EB]/20 text-blue-400 border border-[#2563EB]/30' : 'bg-white/5 text-slate-500'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const count = filteredTasks.filter(t => t.status === col.id).length;
          const isVisibleOnMobile = mobileActiveCol === col.id;
          const dotColor = KANBAN_COR_DOT[col.cor] ?? '#64748b';
          const dotClass = KANBAN_COR_CLASS[col.cor] ?? 'bg-slate-500';

          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, x: isVisibleOnMobile ? 12 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col gap-4 min-w-0 ${isVisibleOnMobile ? 'flex' : 'hidden md:flex'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 shrink-0 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dotClass}`} style={{ boxShadow: `0 0 8px ${dotColor}80` }} />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">{col.nome}</h3>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-extrabold">{count}</span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer" onClick={openNewTaskModal}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Contents */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => { e.preventDefault(); setDraggedOverCol(col.id); }}
                onDragLeave={() => { if (draggedOverCol === col.id) setDraggedOverCol(null); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId) moveTaskStatus(taskId, col.id);
                  setDraggedOverCol(null);
                  setDraggedTaskId(null);
                }}
                className={`space-y-4 pr-1 min-h-[350px] rounded-2xl transition-all duration-300 ${
                  draggedOverCol === col.id
                    ? 'bg-[#2563EB]/10 ring-2 ring-[#2563EB]/40 border-2 border-dashed border-[#2563EB]/50 p-2'
                    : 'p-0'
                }`}
              >
                {filteredTasks.filter(t => t.status === col.id).length > 0 ? (
                  filteredTasks.filter(t => t.status === col.id).map(task => (
                    <div key={task.id}>
                      <TasksKanbanCard
                        task={task}
                        draggedTaskId={draggedTaskId}
                        setDraggedTaskId={setDraggedTaskId}
                        setDraggedOverCol={setDraggedOverCol}
                        getPriorityColor={getPriorityColor}
                        updateTask={updateTask}
                        setSearchQuery={setSearchQuery}
                        openEditTaskModal={openEditTaskModal}
                        toggleTaskStatus={toggleTaskStatus}
                        handleDeleteTask={handleDeleteTask}
                        moveTaskStatus={moveTaskStatus}
                        columns={columns.map(c => c.id) as any}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-xl text-center bg-[var(--color-surface-elevated)]/10">
                    <span className="w-8 h-8 text-slate-700 mx-auto mb-2 block">✓</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Coluna Vazia</p>
                    <p className="text-[10px] text-slate-600 px-3 mt-0.5">Sem pendências nesta classificação.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
