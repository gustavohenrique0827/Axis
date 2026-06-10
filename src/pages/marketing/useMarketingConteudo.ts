import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { DropResult } from "@hello-pangea/dnd";
import { useData } from "../../contexts/DataContext";
import { readKanbanConfig, KANBAN_KEYS, KANBAN_COR_CLASS } from "../../hooks/useKanbanConfig";

function getMarketingColumns() {
  return readKanbanConfig(KANBAN_KEYS.marketing).map(c => ({
    id: c.id,
    title: c.nome,
    color: KANBAN_COR_CLASS[c.cor] ?? "bg-slate-500",
  }));
}

export function useMarketingConteudo() {
  const { marketingContent: tasks, setMarketingContent: setTasks } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'script' | 'refs' | 'ai'>('overview');

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverColId, setDraggedOverColId] = useState<string | null>(null);
  const [columnSearches, setColumnSearches] = useState<{ [key: string]: string }>({});

  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newPlatform, setNewPlatform] = useState("Instagram");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("Média");

  // Tasks are loaded via DataContext

  const updateTaskInDatabase = async (task: any) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("marketing_content")
          .upsert({
            id: task.id,
            col_id: task.colId,
            title: task.title,
            desc: task.desc,
            platform: task.platform,
            date: task.date,
            priority: task.priority,
            value: task.value
          });
        
        if (error) {
          console.error("Supabase upsert failure:", error.message);
        }
      } catch (err) {
        console.error("Supabase communication exception:", err);
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    const movedTask = tasks.find(t => t.id === draggableId);
    if (!movedTask) return;

    const tasksInSource = tasks.filter(t => t.colId === sourceColId && t.id !== draggableId);
    const tasksInOtherCols = tasks.filter(t => t.colId !== sourceColId && t.colId !== destColId);

    if (sourceColId === destColId) {
      const reorderedSourceTasks = [...tasksInSource];
      reorderedSourceTasks.splice(destination.index, 0, movedTask);
      const updatedTasks = [...tasksInOtherCols, ...reorderedSourceTasks];
      setTasks(updatedTasks);
      setTasks(updatedTasks);
      
      await updateTaskInDatabase({ ...movedTask, colId: destColId });
    } else {
      const tasksInDest = tasks.filter(t => t.colId === destColId);
      const updatedMovedTask = { ...movedTask, colId: destColId };
      const reorderedDestTasks = [...tasksInDest];
      reorderedDestTasks.splice(destination.index, 0, updatedMovedTask);
      
      const updatedTasks = [...tasksInOtherCols, ...tasksInSource, ...reorderedDestTasks];
      setTasks(updatedTasks);
      setTasks(updatedTasks);

      const colName = getMarketingColumns().find(c => c.id === destColId)?.title;
      toast.success(`"${movedTask.title}" movido para ${colName}`);
      
      await updateTaskInDatabase(updatedMovedTask);
    }
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) {
      toast.error("Por favor, insira um título para a pauta.");
      return;
    }
    
    let displayDate = "Sem data";
    if (newDate) {
      const parts = newDate.split("-");
      if (parts.length === 3) {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const day = parts[2];
        const monthIndex = parseInt(parts[1], 10) - 1;
        displayDate = `${day} ${months[monthIndex] || ""}`;
      }
    }

    const newTask = {
      id: String(Date.now()),
      colId: "ideia",
      title: newTitle,
      desc: newDesc || "Sem descrição.",
      platform: newPlatform,
      date: displayDate,
      priority: newPriority,
      value: parseFloat(newValue) || 0
    };
    
    const updated = [...tasks, newTask];
    setTasks(updated);
    setTasks(updated);
    await updateTaskInDatabase(newTask);

    setIsNewTaskModalOpen(false);
    
    setNewTitle("");
    setNewValue("");
    setNewPlatform("Instagram");
    setNewDate("");
    setNewDesc("");
    setNewPriority("Média");
    
    toast.success("Nova pauta criada em 'Ideias'!");
  };

  const openTask = (task: any) => {
    setSelectedTask(task);
    setActiveTab('overview');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return {
    tasks, setTasks,
    isModalOpen, setIsModalOpen,
    isNewTaskModalOpen, setIsNewTaskModalOpen,
    selectedTask, setSelectedTask,
    activeTab, setActiveTab,
    draggedTaskId, setDraggedTaskId,
    draggedOverColId, setDraggedOverColId,
    columnSearches, setColumnSearches,
    newTitle, setNewTitle,
    newValue, setNewValue,
    newPlatform, setNewPlatform,
    newDate, setNewDate,
    newDesc, setNewDesc,
    newPriority, setNewPriority,
    initialColumns: getMarketingColumns(),
    onDragEnd,
    handleCreateTask,
    openTask,
    closeModal,
    updateTaskInDatabase
  };
}
