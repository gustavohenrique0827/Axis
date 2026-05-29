import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Search, Plus, CheckCircle2, Clock, Calendar, 
  MoreHorizontal, LayoutGrid, List as ListIcon,
  Flag, Trash2, Filter, CheckSquare, Sparkles, AlertTriangle, 
  Settings, ChevronRight, Eye, Edit, Flame, RefreshCw,
  Target, Zap, TrendingUp, Users
} from "lucide-react";
import { ActionModal } from "../../components/ui/ActionModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useData } from "../../contexts/DataContext";
import { Task } from "../../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { initAuth, googleSignIn, getAccessToken } from "../../lib/firebase";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

import { PageContainer } from "../../components/PageContainer";

const WORKLOAD_DATA = [
  { name: 'Carlos', tasks: 12, color: '#2563EB' },
  { name: 'Ana', tasks: 8, color: '#10b981' },
  { name: 'Roberto', tasks: 15, color: '#6366f1' },
  { name: 'Juliana', tasks: 5, color: '#f59e0b' },
];

export default function Tarefas() {
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

  // Mobile current col for Kanban view
  const [mobileActiveCol, setMobileActiveCol] = useState<'Atrasado' | 'Em Aberto' | 'Concluída'>('Em Aberto');

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverCol, setDraggedOverCol] = useState<'Atrasado' | 'Em Aberto' | 'Concluída' | null>(null);

  const columns: ('Atrasado' | 'Em Aberto' | 'Concluída')[] = ["Atrasado", "Em Aberto", "Concluída"];

  const getPriorityColor = (p: string) => {
    switch(p) {
      case "Alta": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "Média": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Baixa": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  }

  // Helper function to robustly parse task date text/string to Date object
  const parseTaskDate = (dateStr: string): Date => {
    const now = new Date();
    if (!dateStr) return now;
    
    // If it can be parsed as a direct js Date, use it
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

  // Filter tasks with support for multiple priorities and types simultaneously, plus deadline limit comparison
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.related.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(t.priority);
    
    // Resilient matching for task types (e.g. "Reunião" matches both "Reunião" and "Reunião Presencial")
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

  // Productivity Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Concluída').length;
  const openCount = tasks.filter(t => t.status === 'Em Aberto').length;
  const overdueCount = tasks.filter(t => t.status === 'Atrasado').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'Alta' && t.status !== 'Concluída').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const convertReadableDateToDatetimeLocal = (dateStr: string): string => {
    const taskDate = parseTaskDate(dateStr);
    
    // Format as YYYY-MM-DDTHH:MM
    const year = taskDate.getFullYear();
    const month = String(taskDate.getMonth() + 1).padStart(2, '0');
    const day = String(taskDate.getDate()).padStart(2, '0');
    
    // For hours/minutes: let's try to extract time from dateStr like "10:30"
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
      // Get first list
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
      pushTaskToGoogle(newTask); // Push to Google Tasks
      toast.success("Tarefa agendada com sucesso!");
    }
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
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

  // Get distinct task types for the filter dropdown
  const taskTypes = ["Todos", "Reunião", "Call", "Docs", "Acompanhamento (Follow-up)", "Demonstração", "Reunião Presencial", "Call Online"];

  return (
    <PageContainer
      title="Tarefas Axis"
      description="Organize suas demandas comerciais, reuniões de diagnóstico e follow-ups de vendas."
      actions={
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#111827] border border-white/10 rounded-xl p-1">
             <button 
               onClick={() => setViewMode('kanban')}
               className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${viewMode === 'kanban' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'}`}
             >
                <LayoutGrid className="w-3.5 h-3.5" /> Quadro
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'}`}
             >
                <ListIcon className="w-3.5 h-3.5" /> Lista
             </button>
          </div>
          <Button onClick={handleSyncGoogleTasks} disabled={isSyncing} className="gap-2 bg-white flex items-center justify-center text-slate-800 shadow-xl border border-slate-200 hover:bg-slate-50 transition-all font-black uppercase tracking-wider text-[10px] h-11 px-4 rounded-xl">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
            {isSyncing ? 'Sincronizando...' : (needsAuth ? 'Conectar Google Tasks' : 'Sincronizar Google Tasks')}
          </Button>
          <Button onClick={openNewTaskModal} className="gap-2 bg-[#2563EB] hover:bg-blue-600 h-11 px-6 rounded-xl text-[10px] uppercase font-black shadow-xl shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Cadastrar Tarefa
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Elite Focus & Workload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Focus Mode Card */}
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group bento-card">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                 <Target className="w-48 h-48 text-blue-500" />
              </div>

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                          <Zap className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Strategic Focus</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Ação prioritária baseada no pipeline</p>
                       </div>
                    </div>

                    <AnimatePresence mode="wait">
                       {tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída') ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.08] transition-all cursor-pointer group/task"
                          >
                             <div className="flex justify-between items-start mb-4">
                               <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-black uppercase text-[8px] h-6">Urgente / High Ticket</Badge>
                               <span className="text-[10px] font-mono text-slate-500">{tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída')?.date}</span>
                             </div>
                             <h4 className="text-xl font-black text-white italic tracking-tighter leading-tight mb-4 group-hover/task:text-blue-400 transition-colors">
                                {tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída')?.title}
                             </h4>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-white/10 flex items-center justify-center text-[8px] font-black">{tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída')?.avatar || 'AX'}</div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase">{tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída')?.related}</span>
                                </div>
                                <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest group-hover/task:translate-x-2 transition-transform">Expand Task</Button>
                             </div>
                          </motion.div>
                       ) : (
                          <div className="p-12 text-center text-slate-600 border border-dashed border-white/5 rounded-[32px]">
                             <CheckCircle2 className="w-8 h-8 mx-auto mb-4 opacity-20" />
                             <p className="text-[10px] font-black uppercase tracking-[0.2em]">All high-priority goals completed</p>
                          </div>
                       )}
                    </AnimatePresence>
                 </div>

                 <div className="w-full md:w-64 space-y-4">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Workload Balance</h5>
                    <div className="h-48 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={WORKLOAD_DATA} layout="vertical" margin={{ left: -30 }}>
                             <XAxis type="number" hide />
                             <Tooltip cursor={false} content={({payload}) => {
                                if (!payload || !payload.length) return null;
                                return <div className="bg-black/90 border border-white/10 p-2 rounded-xl text-[9px] font-black uppercase text-white">{payload[0].payload.name}: {payload[0].value} Tasks</div>
                             }} />
                             <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={12}>
                                {WORKLOAD_DATA.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center md:justify-start gap-4">
                       <div className="flex flex-col text-center md:text-left">
                          <span className="text-xl font-black text-white italic tracking-tighter">40</span>
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active</span>
                       </div>
                       <div className="flex flex-col text-center md:text-left border-l border-white/10 pl-4">
                          <span className="text-xl font-black text-emerald-400 italic tracking-tighter">92%</span>
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Velocity</span>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>

           {/* Quick Action Bento */}
           <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div>
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Performance Engine</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                             <TrendingUp className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">Lead Conversion</span>
                       </div>
                       <span className="text-xs font-black text-emerald-400 font-mono">+12.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                             <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">Avg Time to Close</span>
                          <span className="text-xs font-black text-blue-400 font-mono">4.2d</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                 <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Integrations</h5>
                 <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase">Google Tasks</div>
                    <div className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase">Slack Ops</div>
                 </div>
              </div>
           </Card>
        </div>

        {/* Task Dashboard Statistics Widgets - Minimalist version now at middle */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#111827]/80 to-[#1e293b]/50 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#2563EB]/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Taxa de Conclusão</span>
            <div className="text-2xl md:text-3xl font-black text-white">{completionRate}%</div>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 block font-medium">{completedCount} de {totalCount} concluídas</span>
          </div>
        </Card>

        <Card className="p-4 bg-[#111827]/80 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Atrasadas / Pendentes</span>
            <div className="text-2xl md:text-3xl font-black text-rose-400 flex items-center gap-2">
              {overdueCount}
              <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">Atrasadas</span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 font-medium">
            Exige atenção imediata de follow-up.
          </div>
        </Card>

        <Card className="p-4 bg-[#111827]/80 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Em Aberto / Hoje</span>
            <div className="text-2xl md:text-3xl font-black text-amber-400 flex items-center gap-2">
              {openCount}
              <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">Fluxo</span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-500 font-medium">
            Sincronizadas com agenda interna.
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#111827]/80 to-[#991b1b]/10 border border-rose-500/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div>
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest block mb-1">Urgente Alta Prioridade</span>
            <div className="text-2xl md:text-3xl font-black text-red-400 flex items-center gap-2">
              {highPriorityCount}
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 text-[10px] text-red-400/80 font-semibold uppercase tracking-wider">
            Prioridade comercial máxima!
          </div>
        </Card>
      </div>

      {/* Advanced Filter controls - responsive styling */}
      <Card className="p-4 bg-[#111827]/60 border border-white/5 shadow-md flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por título ou contato do lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0B1120] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB] w-full"
            />
          </div>

          {/* Date Limit Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B1120] border border-white/10 rounded-xl p-1.5 shrink-0 px-3 h-[38px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Até:</span>
            <input 
              type="date"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              className="bg-[#0B1120] text-white text-[11px] focus:outline-none border-none font-mono cursor-pointer"
              title="Filtrar por data limite da tarefa"
            />
          </div>

          {/* Reset Filters */}
          {(searchQuery !== "" || selectedPriorities.length > 0 || selectedTypes.length > 0 || deadlineFilter !== "") && (
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedPriorities([]);
                setSelectedTypes([]);
                setDeadlineFilter("");
              }} 
              className="text-[11px] font-bold text-red-400 hover:text-red-300 border border-red-500/10 hover:bg-red-500/5 rounded-xl px-4 h-[38px] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Multi-selection Toggle Rails */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full border-t border-white/5 pt-2.5">
          {/* Multi Priority Select Tag Chips */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0B1120] border border-white/5 rounded-xl p-1 shrink-0">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2.5">Prioridades:</span>
            {['Alta', 'Média', 'Baixa'].map(p => {
              const isSelected = selectedPriorities.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPriorities(prev => 
                      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                    );
                  }}
                  type="button"
                  className={`text-[10.5px] font-black px-3 py-1 rounded-lg transition-all border cursor-pointer ${
                    isSelected 
                      ? p === 'Alta' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : p === 'Média' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-450 border-emerald-500/30'
                      : 'bg-transparent text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Multi Type Select Tag Chips (Scrollbar scrollable wrapper) */}
          <div className="flex flex-1 items-center gap-1.5 bg-[#0B1120] border border-white/5 rounded-xl p-1 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2.5 shrink-0">Tipos de Ação:</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {["Reunião Presencial", "Call Online", "Acompanhamento (Follow-up)", "Demonstração", "Envio Docs", "Ligação"].map(t => {
                const isSelected = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTypes(prev => 
                        prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                      );
                    }}
                    type="button"
                    className={`text-[10.5px] font-black px-3 py-1 rounded-lg transition-all whitespace-nowrap border cursor-pointer ${
                      isSelected 
                        ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
                        : 'bg-transparent text-slate-400 hover:text-white border-transparent'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* RENDER TASKS */}
      {viewMode === 'list' ? (
        /* LIST VIEW MODE (Highly responsive alternative to standard tables!) */
        <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-5 py-4 border-b border-white/10 bg-white/[0.01] flex flex-wrap items-center justify-between gap-3">
             <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
               Minhas demandas registradas ({filteredTasks.length})
             </div>
             <span className="text-[10px] text-slate-500 font-medium">Toque para concluir ou gerenciar</span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => (
                <div key={t.id} className="p-4 hover:bg-white/[0.015] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Actions indicator & Title */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleTaskStatus(t.id, t.status)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        t.status === 'Concluída' 
                        ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_#10b981]' 
                        : 'border-slate-500 hover:border-[#2563EB]'
                      }`}
                      title={t.status === 'Concluída' ? "Marcar como pendente" : "Marcar como concluída"}
                    >
                      {t.status === 'Concluída' && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                         <span className="text-[9px] font-extrabold uppercase bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                           {t.type}
                         </span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(t.priority)}`}>
                           {t.priority}
                         </span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase border ${
                            t.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            t.status === 'Atrasado' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {t.status}
                         </span>
                      </div>
                      <h4 className={`text-sm font-bold leading-tight ${t.status === 'Concluída' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-wider flex flex-wrap items-center gap-2">
                        <span>Relacionado a: <span className="text-[#06B6D4] hover:underline cursor-pointer">{t.related}</span></span>
                        <span className="text-slate-700">&bull;</span>
                        <span className="flex items-center gap-1">
                          <span>Responsável:</span>
                          <select
                            value={t.seller || ""}
                            onChange={(e) => updateTask(t.id, { seller: e.target.value })}
                            className="bg-[#111827] text-[10px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 border border-white/10 cursor-pointer hover:bg-white/10"
                          >
                            <option value="" className="text-slate-400">Sem responsável</option>
                            <option value="Carlos Eduardo Mendes" className="text-white">Carlos Eduardo Mendes</option>
                            <option value="Ana Silva" className="text-white">Ana Silva</option>
                            <option value="Roberto Ramos" className="text-white">Roberto Ramos</option>
                            <option value="Juliana Costa" className="text-white">Juliana Costa</option>
                          </select>
                        </span>
                        
                        {t.relatedProductIds && t.relatedProductIds.length > 0 && (
                            <>
                                <span className="text-slate-700">&bull;</span>
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                                    <span className="text-[#06B6D4] truncate max-w-[150px] sm:max-w-xs">{t.relatedProductIds.join(', ')}</span>
                                </span>
                            </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Date, Change Stage & Actions */}
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end shrink-0 pl-8 sm:pl-0">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                      t.status === 'Concluída' ? 'text-slate-500' :
                      t.date.includes('Ontem') || t.status === 'Atrasado' ? 'text-rose-400' : 
                      t.date.includes('Hoje') ? 'text-yellow-400' : 'text-slate-400'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t.date}</span>
                    </div>

                    {/* Change columns quickly on list mode */}
                    <div className="flex gap-1 items-center bg-[#0B1120] border border-white/5 rounded-lg p-0.5">
                      {columns.map(col => (
                        <button
                          key={col}
                          onClick={() => moveTaskStatus(t.id, col)}
                          className={`text-[9px] font-black px-2 py-1 rounded transition-colors ${
                            t.status === col 
                            ? 'bg-[#2563EB] text-white' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <button 
                      onClick={() => openEditTaskModal(t)}
                      className="p-2 text-slate-500 hover:text-[#06B6D4] hover:bg-white/5 rounded-lg transition-colors ml-1"
                      title="Editar tarefa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors ml-1"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-slate-500">
                <CheckSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Nenhuma tarefa encontrada</p>
                <p className="text-xs text-slate-500 mt-1">Experimente remover filtros de busca ou criar novas demandas no botão acima.</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* KANBAN CARD VIEW MODE (Extremely responsive with Mobile Tabs!) */
        <div className="space-y-4">
          
          {/* Mobile Segments Header: hidden on desktop, visible on mobile to prevent squishing */}
          <div className="flex md:hidden bg-[#0A1120] border border-white/10 rounded-2xl p-1 w-full shrink-0 relative">
             {columns.map(col => {
               const isActive = mobileActiveCol === col;
               const count = filteredTasks.filter(t => t.status === col).length;
               
               const getThemeColor = () => {
                 if (col === "Atrasado") return "bg-rose-500";
                 if (col === "Em Aberto") return "bg-amber-500";
                 return "bg-emerald-500";
               };

               return (
                 <button
                   key={col}
                   onClick={() => setMobileActiveCol(col)}
                   className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all relative flex items-center justify-center gap-2 select-none cursor-pointer"
                 >
                   {/* Sliding selection background */}
                   {isActive && (
                     <motion.div
                       layoutId="activeKanbanTabIndicator"
                       className="absolute inset-0 bg-[#1e293b] border border-white/10 rounded-xl shadow-lg"
                       transition={{ type: "spring", stiffness: 350, damping: 28 }}
                     />
                   )}
                   
                   <span className="relative z-10 flex items-center gap-1.5">
                     <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : getThemeColor()}`} />
                     <span className={isActive ? "text-white font-extrabold" : "text-slate-400 font-medium hover:text-white"}>{col}</span>
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
               const count = filteredTasks.filter(t => t.status === col).length;
               
               // In mobile mode, dynamic visibility: show ONLY chosen column in Segment Tabs
               const isVisibleOnMobile = mobileActiveCol === col;

               return (
                 <motion.div 
                   key={col} 
                   initial={{ opacity: 0, x: isVisibleOnMobile ? 12 : 0 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.2 }}
                   className={`flex flex-col gap-4 min-w-0 ${
                     isVisibleOnMobile ? 'flex' : 'hidden md:flex'
                   }`}
                 >
                    {/* Header of Column */}
                    <div className="flex items-center justify-between px-2 shrink-0 border-b border-white/5 pb-2">
                       <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${
                             col === 'Concluída' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                             col === 'Atrasado' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                             'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                           }`}></span>
                           <h3 className="text-xs font-black text-white uppercase tracking-widest">{col}</h3>
                           <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-extrabold">{count}</span>
                       </div>
                       <button className="text-slate-500 hover:text-white transition-colors" onClick={openNewTaskModal}>
                         <Plus className="w-4 h-4" />
                       </button>
                    </div>

                    {/* Column Contents */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDraggedOverCol(col);
                      }}
                      onDragLeave={() => {
                        if (draggedOverCol === col) {
                          setDraggedOverCol(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData("text/plain");
                        if (taskId) {
                          moveTaskStatus(taskId, col);
                        }
                        setDraggedOverCol(null);
                        setDraggedTaskId(null);
                      }}
                      className={`space-y-4 pr-1 min-h-[350px] rounded-2xl transition-all duration-300 ${
                        draggedOverCol === col 
                        ? 'bg-[#2563EB]/10 ring-2 ring-[#2563EB]/40 border-2 border-dashed border-[#2563EB]/50 p-2' 
                        : 'p-0'
                      }`}
                    >
                       {filteredTasks.filter(t => t.status === col).length > 0 ? (
                         filteredTasks.filter(t => t.status === col).map(task => (
                            <Card 
                               key={task.id} 
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
                                     className="text-[9px] bg-white/5 px-1.5 py-0.5 text-slate-400 rounded-md hover:bg-[#2563EB]/20 hover:text-white"
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
                                        className="w-6 h-6 rounded-md border border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-all"
                                        title="Editar tarefa"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => toggleTaskStatus(task.id, task.status)}
                                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
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
                                        className="w-6 h-6 rounded-md border border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/50 transition-all"
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
                                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                            task.status === statusOption
                                            ? 'bg-white/10 text-white font-extrabold border border-white/10'
                                            : 'text-slate-505 text-slate-500 hover:text-white hover:bg-white/5'
                                          }`}
                                        >
                                          {statusOption === "Em Aberto" ? "Aberto" : statusOption === "Concluída" ? "Concluir" : "Atrasar"}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                               </div>
                            </Card>
                         ))
                       ) : (
                         <div className="py-12 border border-dashed border-white/5 rounded-xl text-center bg-[#111827]/10">
                            <CheckSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
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
      )}

      {/* Creation/Edition Modal */}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onAction={handleSaveTask}
        title={editingTask ? "Editar Tarefa / Compromisso" : "Nova Tarefa / Compromisso"}
        actionText={editingTask ? "Salvar Alterações" : "Agendar Tarefa"}
        fields={[
          { 
            name: "nome", 
            label: "Título do Compromisso", 
            type: "text", 
            required: true, 
            defaultValue: editingTask ? editingTask.title : "" 
          },
          { 
            name: "tipo", 
            label: "Tipo do Canal", 
            type: "select", 
            options: ["Reunião Presencial", "Call Online", "Acompanhamento (Follow-up)", "Demonstração", "Envio Docs", "Ligação"],
            defaultValue: editingTask ? editingTask.type : "Acompanhamento (Follow-up)"
          },
          { 
            name: "prioridade", 
            label: "Prioridade Comercial", 
            type: "select", 
            options: ["Alta", "Média", "Baixa"],
            defaultValue: editingTask ? editingTask.priority : "Média"
          },
          { 
            name: "data", 
            label: "Data & Hora Limite", 
            type: "datetime-local", 
            required: true,
            defaultValue: editingTask ? convertReadableDateToDatetimeLocal(editingTask.date) : new Date().toISOString().substring(0, 16)
          },
          { 
            name: "relacionado", 
            label: "Lead / Empresa Associado", 
            type: "text", 
            required: true,
            defaultValue: editingTask ? editingTask.related : ""
          },
           {
            name: "vendedor",
            label: "Vendedor Responsável",
            type: "select",
            options: ["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos", "Juliana Costa"],
            defaultValue: editingTask ? (editingTask.seller || "Carlos Eduardo Mendes") : "Carlos Eduardo Mendes"
          },
          {
            name: "produtos",
            label: "Produtos/Serviços Relacionados",
            type: "multi-select",
            options: ["Consultoria Enterprise", "Setup PRO", "Licença SaaS"], // Simplifing for now
            defaultValue: editingTask ? (editingTask.relatedProductIds || []) : []
          },
          {
            name: "tags",
            label: "Tags",
            type: "text",
            defaultValue: editingTask ? (editingTask.tags || []).join(", ") : ""
          }
        ]}
      />

      <ConfirmModal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete);
            toast.success("Tarefa excluída com sucesso!");
          }
        }}
        title="Confirmar Exclusão de Tarefa"
        message="Tem certeza de que deseja remover permanentemente esta tarefa? Essa ação não pode ser desfeita."
      />
    </div>
  </PageContainer>
  );
}
