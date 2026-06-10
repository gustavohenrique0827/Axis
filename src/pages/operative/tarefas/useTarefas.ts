import { useState, useEffect, useMemo } from "react";
import { useData } from "../../../contexts/DataContext";
import { readKanbanConfig, KANBAN_KEYS, KanbanColConfig } from "../../../hooks/useKanbanConfig";
import { Task } from "../../../types";
import { initAuth, googleSignIn, getAccessToken } from "../../../lib/firebase";
import { toast } from "sonner";

export function useTarefas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("");
  const { tasks, addTask, updateTask, deleteTask } = useData();

  const [needsAuth, setNeedsAuth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      () => setNeedsAuth(false),
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleSyncGoogleTasks = async () => {
    setIsSyncing(true);
    let token = await getAccessToken();
    
    try {
      if (!token) {
        const result = await googleSignIn();
        if (result) {
          token = result.accessToken;
          setNeedsAuth(false);
        } else {
          setIsSyncing(false);
          return;
        }
      }

      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listsData = await listsRes.json();
      
      let importedCount = 0;
      
      if (listsData.items && listsData.items.length > 0) {
        for (const list of listsData.items) {
           const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks`, {
             headers: { Authorization: `Bearer ${token}` }
           });
           const tasksData = await tasksRes.json();
           
           if (tasksData.items) {
             for (const gTask of tasksData.items) {
               if (!tasks.some(t => t.title === gTask.title)) {
                 addTask({
                   title: gTask.title,
                   type: "Acompanhamento (Follow-up)",
                   priority: "Média",
                   date: gTask.due ? new Date(gTask.due).toLocaleDateString('pt-BR') : "Hoje",
                   related: "Google Tasks",
                   status: gTask.status === "completed" ? "Concluída" : "Em Aberto",
                   seller: "",
                   relatedProductIds: [],
                   tags: ["google-tasks"]
                 });
                 importedCount++;
               }
             }
           }
        }
      }
      
      toast.success(`Sincronização concluída: ${importedCount} tarefas importadas.`);
      
    } catch (err) {
      console.error(err);
      toast.error("Erro ao sincronizar com Google Tasks. Verifique os popups e permissões.");
      setNeedsAuth(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const [mobileActiveCol, setMobileActiveCol] = useState<string>('Em Aberto');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  const parseTaskDate = (dateStr: string): Date => {
    const now = new Date();
    if (!dateStr) return now;
    
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    const lower = dateStr.toLowerCase();
    if (lower.includes("hoje")) {
      return now;
    }
    if (lower.includes("amanhã") || lower.includes("amanha")) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;
    }
    if (lower.includes("ontem")) {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return yesterday;
    }
    
    try {
      const cleanStr = dateStr.replace(/[^0-9a-zA-Záàâãéèêíóôõúç \-\/]/g, '').trim();
      const slashParts = cleanStr.split('/');
      if (slashParts.length >= 2) {
        const day = parseInt(slashParts[0], 10);
        const month = parseInt(slashParts[1], 10) - 1;
        const year = slashParts[2] ? parseInt(slashParts[2], 10) : now.getFullYear();
        if (!isNaN(day) && !isNaN(month)) {
          return new Date(year, month, day);
        }
      }
      
      const words = cleanStr.split(/\s+/);
      if (words.length >= 2) {
        const day = parseInt(words[0], 10);
        const monthLabel = words[1].toLowerCase().substring(0, 3);
        const months: Record<string, number> = {
          jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
        };
        const month = months[monthLabel] !== undefined ? months[monthLabel] : now.getMonth();
        const year = words[2] ? parseInt(words[2], 10) : now.getFullYear();
        if (!isNaN(day)) {
          return new Date(year, month, day);
        }
      }
    } catch (e) {}
    return now;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.related.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(t.priority);
      
      const matchesType = selectedTypes.length === 0 || selectedTypes.some(selectedOption => {
        const typeLower = t.type.toLowerCase();
        const optionLower = selectedOption.toLowerCase();
        return typeLower === optionLower || typeLower.includes(optionLower) || optionLower.includes(typeLower);
      });
      
      const matchesDeadline = !deadlineFilter || (() => {
        const taskDate = parseTaskDate(t.date);
        const limitDate = new Date(deadlineFilter + 'T23:59:59');
        return taskDate <= limitDate;
      })();
      
      return matchesSearch && matchesPriority && matchesType && matchesDeadline;
    });
  }, [tasks, searchQuery, selectedPriorities, selectedTypes, deadlineFilter]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Concluída').length;
  const openCount = tasks.filter(t => t.status === 'Em Aberto').length;
  const overdueCount = tasks.filter(t => t.status === 'Atrasado').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'Alta' && t.status !== 'Concluída').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const convertReadableDateToDatetimeLocal = (dateStr: string): string => {
    const taskDate = parseTaskDate(dateStr);
    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, '0');
    const day = String(taskDate.getDate()).padStart(2, '0');
    
    let hours = "09";
    let minutes = "00";
    const timeMatch = dateStr?.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      hours = timeMatch[1];
      minutes = timeMatch[2];
    } else {
      hours = String(taskDate.getHours()).padStart(2, '0');
      minutes = String(taskDate.getMinutes()).padStart(2, '0');
    }
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const pushTaskToGoogle = async (task: Task) => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listsData = await listsRes.json();
      if (!listsData.items || listsData.items.length === 0) return;

      const listId = listsData.items[0].id;
      
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: task.title,
          due: task.date !== "Hoje" ? new Date(task.date).toISOString() : undefined
        })
      });
    } catch (err) {
      console.error("Failed to push to Google Tasks:", err);
    }
  };

  const handleSaveTask = (data: any) => {
    const rawDate = data.data;
    let formattedDate = "Hoje";
    
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: data.nome,
        type: data.tipo || "Acompanhamento (Follow-up)",
        priority: data.prioridade || "Média",
        date: formattedDate,
        related: data.relacionado || "Interno",
        seller: data.vendedor || "",
        relatedProductIds: data.produtos || [],
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
      });
      toast.success("Tarefa editada com sucesso!");
    } else {
      const newTask: any = {
        title: data.nome,
        type: data.tipo || "Acompanhamento (Follow-up)",
        priority: data.prioridade || "Média",
        date: formattedDate,
        related: data.relacionado || "Interno",
        status: "Em Aberto",
        seller: data.vendedor || "",
        relatedProductIds: data.produtos || [],
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
      };
      addTask(newTask);
      pushTaskToGoogle(newTask);
      toast.success("Tarefa agendada com sucesso!");
    }
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const toggleTaskStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Concluída' ? 'Em Aberto' : 'Concluída';
    updateTask(id, { status: newStatus });
    toast.success(`Tarefa marcada como ${newStatus.toLowerCase()}!`);
  };

  const moveTaskStatus = (id: string, newStatus: 'Atrasado' | 'Em Aberto' | 'Concluída') => {
    updateTask(id, { status: newStatus });
    toast.success(`Tarefa movida para ${newStatus}!`);
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDelete(id);
  };
  return {
    columns: readKanbanConfig(KANBAN_KEYS.tarefas) as KanbanColConfig[],
    getPriorityColor: (p: string) => {
      switch(p) {
        case "Alta": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        case "Média": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        case "Baixa": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
      }
    },
    openNewTaskModal: () => {
      setEditingTask(null);
      setIsModalOpen(true);
    },
    openEditTaskModal: (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
    },
    isModalOpen, setIsModalOpen,
    editingTask, setEditingTask,
    taskToDelete, setTaskToDelete,
    viewMode, setViewMode,
    searchQuery, setSearchQuery,
    selectedPriorities, setSelectedPriorities,
    selectedTypes, setSelectedTypes,
    deadlineFilter, setDeadlineFilter,
    tasks, addTask, updateTask, deleteTask,
    needsAuth,
    isSyncing,
    handleSyncGoogleTasks,
    mobileActiveCol, setMobileActiveCol,
    draggedTaskId, setDraggedTaskId,
    draggedOverCol, setDraggedOverCol,
    filteredTasks,
    totalCount,
    completedCount,
    openCount,
    overdueCount,
    highPriorityCount,
    completionRate,
    convertReadableDateToDatetimeLocal,
    handleSaveTask,
    toggleTaskStatus,
    moveTaskStatus,
    handleDeleteTask
  };
}
