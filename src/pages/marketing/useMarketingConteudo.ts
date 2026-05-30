import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { DropResult } from "@hello-pangea/dnd";

const initialColumns = [
  { id: "ideia", title: "Ideias", color: "bg-slate-500" },
  { id: "producao", title: "Em Produção", color: "bg-blue-500" },
  { id: "revisao", title: "Em Revisão", color: "bg-yellow-500" },
  { id: "agendado", title: "Agendado", color: "bg-purple-500" },
  { id: "publicado", title: "Publicado", color: "bg-emerald-500" },
];

const initialTasks = [
  { id: "1", colId: "ideia", title: "Post Carrossel sobre n8n", desc: "Como usar n8n no novo CRM.", platform: "Instagram", date: "24 Mai", priority: "Média", value: 1200 },
  { id: "2", colId: "producao", title: "Vídeo Reels Axis CRM", desc: "Demonstrando a funcionalidade Kanban.", platform: "TikTok", date: "26 Mai", priority: "Alta", value: 3500 },
  { id: "3", colId: "revisao", title: "Post Blog: Supabase Setup", desc: "Mostrando a structure sql e performance...", platform: "Blog", date: "28 Mai", priority: "Baixa", value: 850 },
];

export function useMarketingConteudo() {
  const [tasks, setTasks] = useState(initialTasks);
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

  useEffect(() => {
    const loadTasks = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("marketing_conteudo")
            .select("*")
            .order("id", { ascending: true });
          
          if (error) {
            console.warn("Supabase fetch warning, using local fallback:", error.message);
          } else if (data && data.length > 0) {
            const mapped = data.map(item => ({
              id: String(item.id),
              colId: item.col_id || item.colId,
              title: item.title,
              desc: item.desc,
              platform: item.platform,
              date: item.date,
              priority: item.priority || "Média",
              value: item.value || 0
            }));
            setTasks(mapped);
            return;
          }
        } catch (err) {
          console.warn("Supabase load exception, using local fallback:", err);
        }
      }

      const saved = localStorage.getItem("axis_marketing_tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          setTasks(initialTasks);
        }
      } else {
        setTasks(initialTasks);
      }
    };

    loadTasks();
  }, []);

  const updateTaskInDatabase = async (task: any) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("marketing_conteudo")
          .upsert({
            id: task.id,
            col_id: task.colId,
            colId: task.colId,
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
      localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
      
      await updateTaskInDatabase({ ...movedTask, colId: destColId });
    } else {
      const tasksInDest = tasks.filter(t => t.colId === destColId);
      const updatedMovedTask = { ...movedTask, colId: destColId };
      const reorderedDestTasks = [...tasksInDest];
      reorderedDestTasks.splice(destination.index, 0, updatedMovedTask);
      
      const updatedTasks = [...tasksInOtherCols, ...tasksInSource, ...reorderedDestTasks];
      setTasks(updatedTasks);
      localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));

      const colName = initialColumns.find(c => c.id === destColId)?.title;
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
    localStorage.setItem("axis_marketing_tasks", JSON.stringify(updated));
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
    initialColumns,
    onDragEnd,
    handleCreateTask,
    openTask,
    closeModal,
    updateTaskInDatabase
  };
}
