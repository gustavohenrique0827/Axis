import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { LayoutGrid, List as ListIcon, RefreshCw, Plus } from "lucide-react";
import { NovaTarefaModal } from "../../components/ui/modals/productivity/NovaTarefaModal";
import { ConfirmModal } from "../../components/ui/modals/shared/ConfirmModal";
import { NovaPautaModal } from "../../components/ui/modals/productivity/NovaPautaModal";

import { useTarefas } from "./tarefas/useTarefas";
import { PerformanceMetrics } from "./tarefas/PerformanceMetrics";
import { WorkloadBento } from "./tarefas/WorkloadBento";
import { TasksFilter } from "./tarefas/TasksFilter";
import { TasksListMode } from "./tarefas/TasksListMode";
import { TasksKanbanMode } from "./tarefas/TasksKanbanMode";

export default function Tarefas() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    taskToDelete,
    setTaskToDelete,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedPriorities,
    setSelectedPriorities,
    selectedTypes,
    setSelectedTypes,
    deadlineFilter,
    setDeadlineFilter,
    needsAuth,
    isSyncing,
    handleSyncGoogleTasks,
    mobileActiveCol,
    setMobileActiveCol,
    draggedTaskId,
    setDraggedTaskId,
    draggedOverCol,
    setDraggedOverCol,
    columns,
    getPriorityColor,
    filteredTasks,
    totalCount,
    completedCount,
    openCount,
    overdueCount,
    highPriorityCount,
    completionRate,
    convertReadableDateToDatetimeLocal,
    handleSaveTask,
    openNewTaskModal,
    openEditTaskModal,
    toggleTaskStatus,
    moveTaskStatus,
    handleDeleteTask,
  } = useTarefas();

  const [isPautaModalOpen, setIsPautaModalOpen] = useState(false);

  return (
    <PageContainer
      title="Tarefas Axis"
      description="Organize suas demandas comerciais, reuniões de diagnóstico e follow-ups de vendas."
      actions={
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 border-none cursor-pointer ${viewMode === 'kanban' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white bg-transparent'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Quadro
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 border-none cursor-pointer ${viewMode === 'list' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white bg-transparent'}`}
            >
              <ListIcon className="w-3.5 h-3.5" /> Lista
            </button>
          </div>
          <Button onClick={handleSyncGoogleTasks} disabled={isSyncing} className="gap-2 bg-white flex items-center justify-center text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 transition-all font-black uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : (needsAuth ? 'Conectar Google Tasks' : 'Sincronizar Google Tasks')}
          </Button>
          <Button onClick={() => setIsPautaModalOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700 h-11 px-6 rounded-xl text-[10px] uppercase font-black shadow-xl shadow-purple-600/20">
            <Plus className="w-4 h-4" /> Nova Pauta
          </Button>
          <Button onClick={openNewTaskModal} className="gap-2 bg-[#2563EB] hover:bg-blue-600 h-11 px-6 rounded-xl text-[10px] uppercase font-black shadow-xl shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Cadastrar Tarefa
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Workload Section */}
        <WorkloadBento
          tasks={tasks}
          highPriorityCount={highPriorityCount}
        />

        {/* Statistics Widgets */}
        <PerformanceMetrics
          completionRate={completionRate}
          completedCount={completedCount}
          totalCount={totalCount}
          overdueCount={overdueCount}
          openCount={openCount}
          highPriorityCount={highPriorityCount}
        />

        {/* Filters */}
        <TasksFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          deadlineFilter={deadlineFilter}
          setDeadlineFilter={setDeadlineFilter}
          selectedPriorities={selectedPriorities}
          setSelectedPriorities={setSelectedPriorities}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
        />

        {/* Views */}
        {viewMode === 'list' ? (
          <TasksListMode
            filteredTasks={filteredTasks}
            toggleTaskStatus={toggleTaskStatus}
            getPriorityColor={getPriorityColor}
            updateTask={updateTask}
            columns={columns}
            moveTaskStatus={moveTaskStatus}
            openEditTaskModal={openEditTaskModal}
            handleDeleteTask={handleDeleteTask}
          />
        ) : (
          <TasksKanbanMode
            columns={columns}
            filteredTasks={filteredTasks}
            mobileActiveCol={mobileActiveCol}
            setMobileActiveCol={setMobileActiveCol}
            draggedTaskId={draggedTaskId}
            setDraggedTaskId={setDraggedTaskId}
            draggedOverCol={draggedOverCol}
            setDraggedOverCol={setDraggedOverCol}
            openNewTaskModal={openNewTaskModal}
            moveTaskStatus={moveTaskStatus}
            updateTask={updateTask}
            openEditTaskModal={openEditTaskModal}
            toggleTaskStatus={toggleTaskStatus}
            handleDeleteTask={handleDeleteTask}
            setSearchQuery={setSearchQuery}
            getPriorityColor={getPriorityColor}
          />
        )}
      </div>

      {/* Creation/Edition Modal */}
      <NovaTarefaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialValue={editingTask ? {
          nome: editingTask.title,
          tipo: editingTask.type,
          prioridade: editingTask.priority,
          data: convertReadableDateToDatetimeLocal(editingTask.date),
          relacionado: editingTask.related,
          vendedor: editingTask.seller || "Carlos Eduardo Mendes",
          produtos: (editingTask.relatedProductIds || []).join(", "),
          tags: (editingTask.tags || []).join(", ")
        } : undefined}
      />

      <ConfirmModal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
          }
        }}
        title="Confirmar Exclusão de Tarefa"
        message="Tem certeza de que deseja remover permanentemente esta tarefa? Essa ação não pode ser desfeita."
      />

      <NovaPautaModal
        isOpen={isPautaModalOpen}
        onClose={() => setIsPautaModalOpen(false)}
        onSave={(data) => {
          console.log("Nova Pauta criada:", data);
          // Integrar com DataContext se necessário
        }}
      />
    </PageContainer>
  );
}
