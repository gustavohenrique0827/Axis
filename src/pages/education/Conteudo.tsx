import { useState } from "react";
import { readKanbanConfig, KANBAN_KEYS, KANBAN_COR_DOT } from "../../hooks/useKanbanConfig";
import {
  Search, Plus, FileText, Video,
  HelpCircle, MoreVertical, Download, Layers,
  Globe, Clock, ChevronRight, Star,
  LayoutGrid, List as ListIcon, GripVertical
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable as DraggableOrig,
  DropResult
} from "@hello-pangea/dnd";
const Draggable = DraggableOrig as any;
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { NovoConteudoModal } from "../../components/ui/NovoConteudoModal";

interface ContentItem {
  id: string;
  title: string;
  type: 'Video' | 'PDF' | 'Quiz' | 'Artigo';
  module: string;
  course: string;
  duration?: string;
  lastUpdate: string;
  accessCount: number;
  status: 'Publicado' | 'Rascunho' | 'Em Revisão' | 'Arquivado';
}

const INITIAL_CONTENT: ContentItem[] = [];

export default function Conteudo() {
  const [viewMode, setViewMode] = useState<'Table' | 'Kanban'>('Kanban');
  const [content, setContent] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem("axis_edu_content");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CONTENT;
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const saveContent = (updated: ContentItem[]) => {
    setContent(updated);
    try {
      localStorage.setItem("axis_edu_content", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ContentItem['status'];
    
    const updated = content.map(item => 
      item.id === draggableId ? { ...item, status: newStatus } : item
    );
    saveContent(updated);
    toast.success(`Material movido para ${newStatus}`);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmitContent = (data: { title: string; type: ContentItem['type']; duration: string; course: string; module: string; status: ContentItem['status'] }) => {
    if (editingItem) {
      const updated = content.map(item => item.id === editingItem.id ? {
        ...item, ...data, duration: data.duration || undefined
      } : item);
      saveContent(updated);
      toast.success("Material atualizado com sucesso!");
    } else {
      const newItem: ContentItem = {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
        duration: data.duration || undefined,
        lastUpdate: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
        accessCount: 0,
      };
      saveContent([newItem, ...content]);
      toast.success("Material adicionado com sucesso!");
    }
    handleClose();
  };

  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.course.toLowerCase().includes(search.toLowerCase()) ||
                          c.module.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === "Todos") return matchesSearch;
    const typeMap: Record<string, string> = { 'Vídeo': 'Video', 'PDF': 'PDF', 'Quiz': 'Quiz' };
    return matchesSearch && (c.type === typeMap[selectedCategory]);
  });

  const columns = readKanbanConfig(KANBAN_KEYS.educacao).map(c => ({
    id: c.id as ContentItem['status'],
    label: c.nome,
    dotColor: KANBAN_COR_DOT[c.cor] ?? KANBAN_COR_DOT.slate,
  }));

  const totalAcessos = content.reduce((acc, c) => acc + (c.accessCount || 0), 0);
  const totalAcessosFmt = totalAcessos >= 1000 ? `${(totalAcessos / 1000).toFixed(1)}k` : String(totalAcessos);
  const contentStats = [
    { label: "Ativos Totais",  value: String(content.length),                                        icon: Layers,  color: "text-blue-500",   bg: "bg-blue-500/10"   },
    { label: "Total Acessos",  value: content.length === 0 ? "—" : totalAcessosFmt,                  icon: Globe,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Publicados",     value: String(content.filter(c => c.status === 'Publicado').length),   icon: Star,    color: "text-amber-500",   bg: "bg-amber-500/10"  },
    { label: "Em Rascunho",    value: String(content.filter(c => c.status === 'Rascunho').length),    icon: Download,color: "text-indigo-500",  bg: "bg-indigo-500/10" },
  ];

  return (
    <PageContainer
      title="Repositório de Conteúdo Axis"
      description="Gestão centralizada de ativos educacionais e trilhas de aprendizagem de alta performance."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-2xl gap-2">
            <Download className="w-4 h-4" /> Exportar Lote
          </Button>
          <Button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white h-11 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Material
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        
        {/* Content Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentStats.map((stat, i) => (
            <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por título, curso ou palavra-chave..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex gap-4">
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                 {['Todos', 'Vídeo', 'PDF', 'Quiz'].map((cat) => (
                   <button 
                     key={cat} 
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border ${
                       selectedCategory === cat 
                         ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                         : 'text-slate-500 hover:text-white border-transparent'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                  <button onClick={() => setViewMode('Table')} className={`p-2 rounded-xl transition-all ${viewMode === 'Table' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500'}`}>
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('Kanban')} className={`p-2 rounded-xl transition-all ${viewMode === 'Kanban' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
              </div>
           </div>
        </Card>

        {viewMode === 'Table' ? (
          <Card className="bg-[#111827]/80 border-white/5 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-10">Material Educacional</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso / Módulo</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Performance</th>
                         <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {filteredContent.map((item) => (
                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => handleOpenEdit(item)}>
                           <td className="p-6 pl-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/20 transition-all">
                                    {item.type === 'Video' ? <Video className="w-5 h-5" /> : item.type === 'PDF' ? <FileText className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-1">{item.title}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic font-mono">ID: {item.id} • UPDATED: {item.lastUpdate}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <p className="text-xs font-bold text-slate-300 mb-1">{item.module}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[150px]">{item.course}</p>
                           </td>
                           <td className="p-6">
                              <Badge className="bg-white/5 border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                 {item.type}
                              </Badge>
                           </td>
                           <td className="p-6">
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-white font-mono">{item.accessCount}</span>
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter italic">Views</span>
                                 </div>
                                 <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (item.accessCount / 500) * 100)}%` }} />
                                 </div>
                              </div>
                           </td>
                           <td className="p-6 pr-10 text-right">
                               <div className="flex items-center justify-end gap-3">
                                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                    item.status === 'Publicado' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                                    item.status === 'Em Revisão' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                                    'bg-slate-500/5 text-slate-500 border-white/5'
                                  }`}>
                                     {item.status}
                                  </span>
                                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                               </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {columns.map(col => (
                 <div key={col.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dotColor }}></span>
                          {col.label}
                       </h4>
                       <Badge className="bg-white/5 border-white/5 text-slate-600 text-[9px] font-bold">
                          {filteredContent.filter(c => c.status === col.id).length}
                       </Badge>
                    </div>
                    
                    <Droppable droppableId={col.id}>
                       {(provided, snapshot) => (
                         <div 
                           {...provided.droppableProps}
                           ref={provided.innerRef}
                           className={`min-h-[600px] rounded-[24px] transition-colors p-2 ${snapshot.isDraggingOver ? 'bg-white/[0.03]' : 'bg-transparent'}`}
                         >
                            {filteredContent.filter(c => c.status === col.id).map((item, idx) => (
                              <Draggable key={item.id} draggableId={item.id} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="mb-4"
                                  >
                                     <Card className={`p-5 bg-[#111827] border-white/5 hover:border-white/10 transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50 border-blue-500/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-4">
                                           <div {...provided.dragHandleProps} className="p-1 rounded hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing">
                                              <GripVertical className="w-4 h-4 text-slate-700" />
                                           </div>
                                           <Badge className="bg-white/5 border-white/5 text-slate-500 text-[8px] font-black uppercase">
                                              {item.type}
                                           </Badge>
                                        </div>
                                        <h5 className="text-sm font-black text-white italic group-hover:text-blue-400 transition-colors uppercase leading-tight mb-3">
                                           {item.title}
                                        </h5>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate mb-4">{item.course}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                           <div className="flex items-center gap-2 text-slate-600">
                                              <Clock className="w-3 h-3" />
                                              <span className="text-[9px] font-bold font-mono">{item.lastUpdate}</span>
                                           </div>
                                           <button onClick={() => handleOpenEdit(item)} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-blue-400">
                                              <ChevronRight className="w-4 h-4" />
                                           </button>
                                        </div>
                                     </Card>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                         </div>
                       )}
                    </Droppable>
                 </div>
               ))}
            </div>
          </DragDropContext>
        )}
      </div>

      <NovoConteudoModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmitContent}
        editingTitle={editingItem?.title}
        initialValues={editingItem ? {
          title: editingItem.title,
          type: editingItem.type,
          duration: editingItem.duration || "",
          course: editingItem.course,
          module: editingItem.module,
          status: editingItem.status,
        } : undefined}
      />
    </PageContainer>
  );
}
