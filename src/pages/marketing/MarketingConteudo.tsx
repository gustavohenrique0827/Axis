import { PageContainer } from "../../components/PageContainer";
import { Plus, Calendar, Zap, CheckCircle2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { toast } from "sonner";
import { DragDropContext } from "@hello-pangea/dnd";

import { useMarketingConteudo } from "./useMarketingConteudo";
import { KanbanColumn } from "./components/KanbanColumn";
import { NewTaskModal } from "./components/NewTaskModal";
import { TaskDetailsDrawer } from "./components/TaskDetailsDrawer";

export default function MarketingConteudo() {
  const {
    tasks,
    setTasks,
    isModalOpen,
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    selectedTask,
    setSelectedTask,
    activeTab,
    setActiveTab,
    columnSearches,
    setColumnSearches,
    newTitle,
    setNewTitle,
    newValue,
    setNewValue,
    newPlatform,
    setNewPlatform,
    newDate,
    setNewDate,
    newDesc,
    setNewDesc,
    newPriority,
    setNewPriority,
    initialColumns,
    onDragEnd,
    handleCreateTask,
    openTask,
    closeModal,
    updateTaskInDatabase,
  } = useMarketingConteudo();

  return (
    <PageContainer
      title="Gestão de Conteúdo (Kanban)"
      subtitle="Organize postagens, vídeos, e criativos em um fluxo visual."
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center overflow-x-auto pb-2 scrollbar-none">
          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="gap-2"
          >
             <Plus className="w-4 h-4" /> Nova Pauta
          </Button>
          <Button variant="outline" className="gap-2">
             <Calendar className="w-4 h-4" /> Calendário
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
           <Zap className="w-3 h-3 text-slate-400" />
           <span className="text-xs text-slate-400">IA Pauta Pro Ativa</span>
        </div>
      </div>

      <div id="app-marketing-conteudo-kanban-board" className="w-full flex-1 flex flex-col min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto min-h-[500px] scrollbar-thin pb-6 flex-1 items-start">
            {initialColumns.map(col => (
              <div key={col.id}>
                <KanbanColumn
                  col={col}
                  tasks={tasks}
                  columnSearches={columnSearches}
                  setColumnSearches={setColumnSearches}
                  openTask={openTask}
                />
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modal: Nova Pauta */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newValue={newValue}
        setNewValue={setNewValue}
        newPlatform={newPlatform}
        setNewPlatform={setNewPlatform}
        newDate={newDate}
        setNewDate={setNewDate}
        newPriority={newPriority}
        setNewPriority={setNewPriority}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        handleCreateTask={handleCreateTask}
      />

      {/* Modal: Detalhes da Pauta */}
      <Modal 
        isOpen={isModalOpen && !!selectedTask} 
        onClose={closeModal} 
        maxWidth="max-w-xl"
        position="right"
        title={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => toast.success('Conteúdo marcado como CONCLUÍDO! 🏆')}
              className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Concluir
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.warning('Pauta arquivada para revisão futura.')}
              className="text-rose-400 border-rose-400/20 bg-rose-400/10 hover:bg-rose-400/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <X className="w-4 h-4" /> Arquivar
            </Button>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <Button 
              variant="outline" 
              onClick={() => toast.error('Pauta excluída.')}
              className="border-white/5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 gap-1.5 h-10 px-4 text-[10px] uppercase font-black cursor-pointer bg-transparent"
            >
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal} className="text-slate-400 font-bold px-4 text-[10px] uppercase cursor-pointer">Fechar</Button>
              <Button onClick={() => toast.success('Alterações salvas!')} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6 text-[10px] uppercase cursor-pointer">Salvar</Button>
            </div>
          </div>
        }
      >
        {selectedTask && (
          <TaskDetailsDrawer
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            tasks={tasks}
            setTasks={setTasks}
            initialColumns={initialColumns}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            updateTaskInDatabase={updateTaskInDatabase}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
