import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { Plus, GripVertical, CheckSquare, MessageSquare, Image, MoreHorizontal, Calendar, X, AlignLeft, Tag, Globe, CheckCircle2, FileText, Zap, Sparkles, Clock, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";
import { Modal } from "../../components/ui/modal";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "../../lib/supabase";

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
  { id: "3", colId: "revisao", title: "Post Blog: Supabase Setup", desc: "Mostrando a estrutura sql e performance...", platform: "Blog", date: "28 Mai", priority: "Baixa", value: 850 },
];

export default function MarketingConteudo() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'script' | 'refs' | 'ai'>('overview');

  // Drag and drop states & search filters
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverColId, setDraggedOverColId] = useState<string | null>(null);
  const [columnSearches, setColumnSearches] = useState<{ [key: string]: string }>({});

  // New task form states
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newPlatform, setNewPlatform] = useState("Instagram");
  const [newDate, setNewDate] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("Média");

  // Load tasks from Supabase or localStorage on mount
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
            // map database field names to our frontend tasks keys if they differ
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

  // Sync state to localstorage & Supabase
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
      // Re-order in the same column
      const reorderedSourceTasks = [...tasksInSource];
      reorderedSourceTasks.splice(destination.index, 0, movedTask);
      const updatedTasks = [...tasksInOtherCols, ...reorderedSourceTasks];
      setTasks(updatedTasks);
      localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
      
      await updateTaskInDatabase({ ...movedTask, colId: destColId });
    } else {
      // Move to a different column
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
    
    // Clear form
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

  return (
    <PageContainer
      title="Gestão de Conteúdo (Kanban)"
      subtitle="Organize postagens, vídeos, e criativos em um fluxo visual."
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center overflow-x-auto pb-2 scrollbar-none">
          <Button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-600 shadow-lg text-xs font-bold gap-2"
          >
             <Plus className="w-4 h-4" /> Nova Pauta
          </Button>
          <Button variant="outline" className="border-white/10 text-xs font-bold gap-2">
             <Calendar className="w-4 h-4" /> Calendário
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
           <Zap className="w-3 h-3 text-blue-400" />
           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">IA Pauta Pro Ativa</span>
        </div>
      </div>

      <div id="app-marketing-conteudo-kanban-board" className="w-full flex-1 flex flex-col min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto min-h-[500px] scrollbar-thin pb-6 flex-1 items-start">
            {initialColumns.map(col => {
              const searchQuery = columnSearches[col.id] || "";
              const colTasksAll = tasks.filter(t => t.colId === col.id);
              const colTasks = colTasksAll.filter(t => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  t.title.toLowerCase().includes(q) ||
                  t.desc.toLowerCase().includes(q) ||
                  t.platform.toLowerCase().includes(q) ||
                  (t.priority && t.priority.toLowerCase().includes(q))
                );
              });
              
              return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-w-[320px] w-[320px] bg-[#111827] rounded-2xl border transition-all duration-200 flex flex-col max-h-full shrink-0 ${
                        snapshot.isDraggingOver 
                          ? "border-blue-500/50 bg-[#151F30] shadow-lg shadow-blue-500/5" 
                          : "border-white/5"
                      }`}
                    >
                       <div className="p-4 border-b border-white/5 flex flex-col gap-3 sticky top-0 bg-[#111827] z-10 rounded-t-2xl kanban-column-header">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{col.title}</h3>
                          </div>
                          
                          {/* Dynamic Badge for Total Value */}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-blue-400/80 shadow-sm">
                            <DollarSign className="w-2.5 h-2.5" />
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              maximumFractionDigits: 0 
                            }).format(colTasksAll.reduce((sum, t) => sum + (t.value || 0), 0))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pl-3.5">
                           <div className="flex items-center gap-1.5">
                             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                               Ticket Médio: 
                               <strong className="text-slate-500 ml-1">
                                 {new Intl.NumberFormat('pt-BR', { 
                                   style: 'currency', 
                                   currency: 'BRL',
                                   maximumFractionDigits: 0 
                                 }).format(colTasksAll.length > 0 ? colTasksAll.reduce((sum, t) => sum + (t.value || 0), 0) / colTasksAll.length : 0)}
                               </strong>
                             </span>
                           </div>
                           <span className="text-[9px] font-black text-slate-700 bg-white/[0.02] px-1.5 py-0.5 rounded h-fit">{colTasksAll.length} ops</span>
                        </div>
                      </div>
                           </div>
                           <button className="p-1 hover:bg-white/10 rounded-lg text-slate-500 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                           </button>
                         </div>
                         
                         {/* Column Search Bar */}
                         <div className="relative">
                            <input
                              type="text"
                              value={columnSearches[col.id] || ""}
                              onChange={(e) => setColumnSearches(prev => ({ ...prev, [col.id]: e.target.value }))}
                              placeholder="Filtrar por pauta, canal, prioridade..."
                              className="w-full bg-[#1E293B] border border-white/5 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 outline-none transition-all"
                            />
                            {columnSearches[col.id] ? (
                              <button 
                                onClick={() => setColumnSearches(prev => ({ ...prev, [col.id]: "" }))}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            )}
                         </div>
                       </div>
                       
                       <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]">
                         {colTasks.length === 0 ? (
                           <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl min-h-[120px]">
                              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Sem pautas</p>
                           </div>
                         ) : (
                           colTasks.map((task, index) => (
                             <Draggable key={task.id} {...({ draggableId: task.id, index } as any)}>
                               {(dragProvided, dragSnapshot) => (
                                 <div
                                   ref={dragProvided.innerRef}
                                   {...dragProvided.draggableProps}
                                   {...dragProvided.dragHandleProps}
                                   className="focus:outline-none"
                                   style={dragProvided.draggableProps.style}
                                 >
                                   <Card 
                                     onClick={() => openTask(task)}
                                     className={`p-4 bg-[#1E293B] transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-xl hover:shadow-blue-900/20 kanban-card ${
                                       dragSnapshot.isDragging 
                                         ? "ring-2 ring-blue-500 bg-[#253248] scale-[1.02] shadow-2xl" 
                                         : "border-white/5 hover:border-blue-500/30"
                                     }`}
                                   >
                                     <div className="flex items-start justify-between mb-3">
                                       <div className="flex flex-wrap gap-1.5 items-center">
                                         {/* Platform Badge */}
                                         {task.platform === 'Instagram' && <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-pink-500/10 text-pink-400 border border-pink-500/20">{task.platform}</span>}
                                         {task.platform === 'TikTok' && <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{task.platform}</span>}
                                         {task.platform === 'Blog' && <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{task.platform}</span>}
                                         {task.platform === 'LinkedIn' && <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">{task.platform}</span>}
                                         {task.platform === 'YouTube' && <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">{task.platform}</span>}
                                         
                                         {/* Priority Badge */}
                                         {task.priority === 'Alta' && (
                                           <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]">
                                             Alta
                                           </span>
                                         )}
                                         {task.priority === 'Média' && (
                                           <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                                             Média
                                           </span>
                                         )}
                                         {task.priority === 'Baixa' && (
                                           <span className="text-[10px] px-2 py-0.5 rounded uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                                             Baixa
                                           </span>
                                         )}
                                       </div>
                                       <GripVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     </div>
                                     
                                     <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{task.title}</h4>
                                     <div className="flex items-center gap-2 mb-2">
                                       <span className="text-[10px] font-bold text-blue-400">
                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(task.value || 0)}
                                       </span>
                                     </div>
                                     <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.desc}</p>
                                     
                                     <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                       <div className="flex items-center gap-3">
                                         <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                            <Calendar className="w-3 h-3" /> {task.date}
                                         </div>
                                       </div>
                                       <div className="flex items-center text-slate-500 gap-2">
                                          <Image className="w-3.5 h-3.5" />
                                          <MessageSquare className="w-3.5 h-3.5" />
                                       </div>
                                     </div>
                                   </Card>
                                 </div>
                               )}
                             </Draggable>
                           ))
                         )}
                         {provided.placeholder}
                       </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modal: Nova Pauta */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
             <div className="p-6 border-b border-white/10 flex justify-between items-center text-white">
                <h3 className="text-lg font-black uppercase tracking-tighter">Criar Nova Pauta</h3>
                <button onClick={() => setIsNewTaskModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título da Ideia</label>
                   <input 
                     type="text" 
                     value={newTitle}
                     onChange={(e) => setNewTitle(e.target.value)}
                     placeholder="Ex: Tutorial Dashboard Financeiro" 
                     className="w-full bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" 
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor da Oportunidade (R$)</label>
                   <input 
                     type="number" 
                     value={newValue}
                     onChange={(e) => setNewValue(e.target.value)}
                     placeholder="0,00" 
                     className="w-full bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" 
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plataforma</label>
                      <select 
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        className="w-full bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      >
                         <option value="Instagram">Instagram</option>
                         <option value="TikTok">TikTok</option>
                         <option value="LinkedIn">LinkedIn</option>
                         <option value="YouTube">YouTube</option>
                         <option value="Blog">Blog</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Limite</label>
                      <input 
                        type="date" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-sm text-[#94A3B8] outline-none" 
                      />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridade</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['Alta', 'Média', 'Baixa'].map((p) => {
                         const isSelected = newPriority === p;
                         const activeColors = p === 'Alta' 
                           ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold' 
                           : p === 'Média' 
                           ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                           : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold';
                         return (
                            <button
                               key={p}
                               type="button"
                               onClick={() => setNewPriority(p)}
                               className={`py-2 px-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                  isSelected 
                                    ? activeColors 
                                    : 'bg-[#1E293B] border-white/5 text-slate-400 hover:text-white'
                               }`}
                            >
                               {p}
                            </button>
                         );
                      })}
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Breve Briefing</label>
                   <textarea 
                     rows={3} 
                     value={newDesc}
                     onChange={(e) => setNewDesc(e.target.value)}
                     placeholder="Descreva brevemente o objetivo desse conteúdo..." 
                     className="w-full bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                   ></textarea>
                </div>
             </div>
             <div className="p-6 bg-white/5 flex gap-3">
                <Button variant="ghost" onClick={() => setIsNewTaskModalOpen(false)} className="flex-1 text-slate-400">Cancelar</Button>
                <Button onClick={handleCreateTask} className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold">Criar Pauta</Button>
             </div>
          </motion.div>
        </div>
      )}

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
              className="border-white/5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 gap-1.5 h-10 px-4 text-[10px] uppercase font-black cursor-pointer"
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
          <div className="flex flex-col gap-6">
            {/* Dynamic Content Stages Navigation */}
            <div className="flex items-center gap-2 mb-1 overflow-x-auto pb-3 scrollbar-none shrink-0 border-b border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] shrink-0 mr-1.5">Mover para:</span>
              {initialColumns.map(col => {
                const isActive = selectedTask.colId === col.id;
                return (
                  <button 
                    key={col.id} 
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, colId: col.id } : t));
                      setSelectedTask({ ...selectedTask, colId: col.id });
                      toast.success(`Movido para: ${col.title}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                        : 'bg-[#111827] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {col.title}
                  </button>
                );
              })}
            </div>

            {/* Progress Bar indicator */}
            <div className="h-1 w-full bg-slate-800 rounded-full mb-2 overflow-hidden shrink-0">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out"
                style={{ 
                  width: `${(initialColumns.findIndex(c => c.id === selectedTask.colId) + 1) / initialColumns.length * 100}%` 
                }}
              />
            </div>

            {/* Header Block */}
            <Card className="p-5 border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
               <div className="absolute top-2 right-2 flex gap-1">
                  <span className="text-[8px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                    {selectedTask.platform}
                  </span>
               </div>
               <div className="flex items-center gap-4 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white shrink-0">
                     {selectedTask.platform === 'Instagram' ? <Image className="w-6 h-6" /> : selectedTask.platform === 'TikTok' ? <Zap className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-lg font-black text-white leading-tight truncate uppercase tracking-tighter">
                        {selectedTask.title}
                     </h3>
                     <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <Calendar className="w-3.5 h-3.5" /> {selectedTask.date}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <Clock className="w-3.5 h-3.5" /> ID: {selectedTask.id}
                        </span>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Tabs for Drawer Layout */}
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-none shrink-0">
               {[
                 { id: 'overview', label: 'GERAL', icon: AlignLeft },
                 { id: 'script', label: 'ROTEIRO', icon: FileText },
                 { id: 'refs', label: 'REFERÊNCIAS', icon: Globe },
                 { id: 'ai', label: 'ASSISTENTE IA', icon: Zap },
               ].map((tab) => {
                 const isActive = activeTab === tab.id;
                 return (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex items-center gap-2 pb-2.5 pt-1.5 px-3 font-bold text-[10px] tracking-widest border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                       isActive 
                         ? 'border-blue-500 text-blue-500' 
                         : 'border-transparent text-slate-400 hover:text-white'
                     }`}
                   >
                     <tab.icon className="w-3.5 h-3.5" />
                     {tab.label}
                   </button>
                 );
               })}
            </div>

            {/* Content per Tab */}
            <div className="flex-1">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Valor da Oportunidade</h4>
                       <div className="relative">
                         <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
                         <input
                           type="number"
                           value={selectedTask.value || 0}
                           onChange={async (e) => {
                             const updatedValue = parseFloat(e.target.value) || 0;
                             const updatedTask = { ...selectedTask, value: updatedValue };
                             setSelectedTask(updatedTask);
                             const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
                             setTasks(updatedTasks);
                             localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
                             await updateTaskInDatabase(updatedTask);
                           }}
                           className="bg-[#1E293B] border border-white/5 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white outline-none w-full cursor-pointer hover:border-white/20 transition-all font-bold"
                         />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Prioridade</h4>
                       <select 
                         value={selectedTask.priority || "Média"}
                         onChange={async (e) => {
                           const updatedPriority = e.target.value;
                           const updatedTask = { ...selectedTask, priority: updatedPriority };
                           setSelectedTask(updatedTask);
                           const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
                           setTasks(updatedTasks);
                           localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
                           await updateTaskInDatabase(updatedTask);
                           toast.success(`Prioridade alterada para ${updatedPriority}`);
                         }}
                         className="bg-[#1E293B] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none w-full cursor-pointer hover:border-white/20 transition-all font-bold"
                       >
                         <option value="Alta">🔴 Alta</option>
                         <option value="Média">🟡 Média</option>
                         <option value="Baixa">🟢 Baixa</option>
                       </select>
                     </div>
                     <div className="space-y-1.5">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Canal / Rede</h4>
                       <select 
                         value={selectedTask.platform}
                         onChange={async (e) => {
                           const updatedPlatform = e.target.value;
                           const updatedTask = { ...selectedTask, platform: updatedPlatform };
                           setSelectedTask(updatedTask);
                           const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
                           setTasks(updatedTasks);
                           localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
                           await updateTaskInDatabase(updatedTask);
                           toast.success(`Plataforma alterada para ${updatedPlatform}`);
                         }}
                         className="bg-[#1E293B] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none w-full cursor-pointer hover:border-white/20 transition-all font-bold"
                       >
                         <option value="Instagram">Instagram</option>
                         <option value="TikTok">TikTok</option>
                         <option value="LinkedIn">LinkedIn</option>
                         <option value="YouTube">YouTube</option>
                         <option value="Blog">Blog</option>
                       </select>
                     </div>
                   </div>

                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Descrição Detalhada</h4>
                     <textarea
                       value={selectedTask.desc}
                       onChange={async (e) => {
                         const updatedDesc = e.target.value;
                         const updatedTask = { ...selectedTask, desc: updatedDesc };
                         setSelectedTask(updatedTask);
                         const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
                         setTasks(updatedTasks);
                         localStorage.setItem("axis_marketing_tasks", JSON.stringify(updatedTasks));
                       }}
                       onBlur={async () => {
                         await updateTaskInDatabase(selectedTask);
                       }}
                       className="w-full bg-[#1E293B] border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed outline-none focus:border-blue-500/50 resize-none h-24"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Tarefas</h4>
                       <div className="space-y-2">
                          {['Definir briefing', 'Criar roteiro', 'Gravar / Produzir', 'Aprovar'].map((t, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                               <CheckCircle2 className={`w-4 h-4 ${i < 2 ? 'text-emerald-500' : 'text-slate-600'}`} />
                               <span className={`text-[11px] font-bold ${i < 2 ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{t}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Links / Anexos</h4>
                       <div className="flex flex-wrap gap-2">
                          <button className="w-10 h-10 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                             <Plus className="w-4 h-4" />
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5"></div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'script' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Editor de Roteiro</h4>
                    <Button variant="ghost" className="h-6 text-[9px] uppercase font-black px-2 hover:bg-white/5 cursor-pointer" onClick={() => toast.success('Copiado para área de transferência!')}>Copiar Tudo</Button>
                  </div>
                  <textarea 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed focus:border-blue-500 outline-none transition-all min-h-[300px] shadow-inner font-mono"
                    placeholder="Escreva seu roteiro passo-a-passo aqui..."
                  ></textarea>
                </div>
              )}

              {activeTab === 'refs' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Referências Externas</h4>
                  <div className="space-y-3">
                    <Card className="p-3 bg-white/5 border-white/5 flex items-center gap-3 hover:border-white/20 transition-all cursor-pointer">
                       <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                          <Globe className="w-4 h-4" />
                       </div>
                       <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-white truncate">Referência Instagram #01</h5>
                          <p className="text-[9px] text-slate-500 truncate">instagram.com/p/C6...</p>
                       </div>
                    </Card>
                    <Button variant="outline" className="w-full border-dashed border-white/10 h-12 text-[10px] uppercase font-bold text-slate-500 gap-2 hover:bg-white/5 cursor-pointer">
                       <Plus className="w-3.5 h-3.5" /> Adicionar Link de Ideia
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <Zap className="w-5 h-5 text-blue-400" />
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest">CoPilot IA Content</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                           Posso gerar um roteiro completo de 15, 30 ou 60 segundos otimizado para o algoritmo do <strong>{selectedTask.platform}</strong>.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold uppercase text-[10px] tracking-widest cursor-pointer">Gerar Script de Alta Conversão</Button>
                     </div>
                  </div>
                  
                  <Card className="p-4 bg-white/5 border-white/5">
                     <h5 className="text-[9px] font-black text-white uppercase tracking-[0.2em] mb-3 flex gap-2 items-center">
                        <Sparkles className="w-3 h-3 text-yellow-500" /> Hashtags sugeridas
                     </h5>
                     <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                        #MarketingDigital #Growth #CRM #AxisCloud #VendasOnLine
                     </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

