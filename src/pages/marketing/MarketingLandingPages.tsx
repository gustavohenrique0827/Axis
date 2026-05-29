import React, { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { 
  Globe, Plus, Link as LinkIcon, Eye, MousePointerClick, 
  TrendingUp, Edit2, Trash2, CheckCircle2, Clock, Settings, 
  X, Activity, Sparkles 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { toast } from "sonner";

const initialLandingPages = [
  { id: 1, name: "Campanha Black Friday", url: "lp.seussistema.com/black-friday", status: "published", views: 12500, conversions: 850, rate: "6.8%", sparkline: [12, 18, 25, 22, 35, 45, 55] },
  { id: 2, name: "Webinar Axis RAG IA", url: "lp.seussistema.com/webinar-ia", status: "draft", views: 0, conversions: 0, rate: "0%", sparkline: [0, 0, 0, 0, 0, 0, 0] },
  { id: 3, name: "Captura E-book N8N", url: "lp.seussistema.com/ebook-n8n", status: "published", views: 4500, conversions: 1200, rate: "26.6%", sparkline: [5, 10, 8, 15, 20, 18, 30] },
];

export default function MarketingLandingPages() {
  const [pages, setPages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("axis_landing_pages");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialLandingPages;
  });

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [gtagId, setGtagId] = useState("");

  const savePages = (updated: any[]) => {
    setPages(updated);
    try {
      localStorage.setItem("axis_landing_pages", JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleStatus = (id: number) => {
    const updated = pages.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } 
        : p
    );
    savePages(updated);
    const affected = updated.find(p => p.id === id);
    toast.success(`Página alterada para: ${affected?.status === 'published' ? 'Publicada' : 'Rascunho'}`);
  };

  const openTrackingModal = (page: any) => {
    setSelectedPage(page);
    setPixelId(page.pixel || "");
    setGtagId(page.gtag || "");
    setIsTrackingModalOpen(true);
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const newPage = {
      id: Date.now(),
      name: newName,
      url: `lp.seussistema.com/${newSlug.replace(/\s+/g, "-").toLowerCase()}`,
      status: "published",
      views: 0,
      conversions: 0,
      rate: "0%",
      sparkline: [5, 5, 5, 5, 5, 5, 5],
      pixel: pixelId,
      gtag: gtagId
    };

    const updated = [newPage, ...pages];
    savePages(updated);
    toast.success("Landing Page criada e publicada com sucesso!");
    setIsCreateModalOpen(false);

    setNewName("");
    setNewSlug("");
    setPixelId("");
    setGtagId("");
  };

  const handleDeletePage = (id: number) => {
    const updated = pages.filter(p => p.id !== id);
    savePages(updated);
    toast.success("Página excluída com sucesso.");
  };

  const handleSaveTracking = () => {
    if (!selectedPage) return;
    const updated = pages.map(p => 
      p.id === selectedPage.id 
        ? { ...p, pixel: pixelId, gtag: gtagId } 
        : p
    );
    savePages(updated);
    toast.success("Parâmetros de rastreamento salvos!");
    setIsTrackingModalOpen(false);
  };

  return (
    <PageContainer
      title="Landing Pages"
      subtitle="Crie, publique e acompanhe a conversão das suas páginas de captura."
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white">Suas Páginas ({pages.length})</h3>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-600 shadow-xl gap-2 font-bold text-xs uppercase tracking-wider px-6 rounded-xl h-11"
        >
          <Plus className="w-4 h-4" /> Criar Página
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pages.map((page, index) => (
          <motion.div
            key={page.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="p-5 bg-[#111827] border-white/5 hover:border-blue-500/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group landing-page-card">
              <div className="flex items-start gap-4 flex-1">
                 <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${page.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                   <Globe className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <h4 className="font-bold text-white text-base">{page.name}</h4>
                       <button 
                         onClick={() => toggleStatus(page.id)}
                         className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors hover:bg-opacity-80 ${
                           page.status === 'published' 
                             ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
                             : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
                         }`}
                         title="Clique para alternar o status"
                       >
                         {page.status === 'published' ? <><CheckCircle2 className="w-3 h-3" /> Online</> : <><Clock className="w-3 h-3" /> Rascunho</>}
                       </button>
                     </div>
                     <a href={`https://${page.url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                       <LinkIcon className="w-3 h-3" /> {page.url}
                     </a>
                 </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 lg:gap-12 flex-1 lg:flex-none border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0 overflow-x-auto scrollbar-none pb-2 lg:pb-0">
                 <div className="hidden lg:block w-32 h-12 shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={page.sparkline.map((val: any, i: number) => ({ day: i, value: val }))}>
                       <YAxis hide domain={['dataMin', 'dataMax']} />
                       <Line 
                         type="monotone" 
                         dataKey="value" 
                         stroke={page.status === 'published' ? "#10b981" : "#64748b"} 
                         strokeWidth={2} 
                         dot={false}
                         isAnimationActive={false}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
                 
                 <div className="flex flex-col items-center lg:items-start shrink-0">
                   <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1 mb-1"><Eye className="w-3" /> Visitas</span>
                   <span className="text-base sm:text-lg font-bold text-white">{page.views.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col items-center lg:items-start shrink-0">
                   <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1 mb-1"><MousePointerClick className="w-3 text-purple-400" /> Leads</span>
                   <span className="text-base sm:text-lg font-bold text-white">{page.conversions.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col items-center lg:items-start shrink-0">
                   <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1 mb-1"><TrendingUp className="w-3 text-emerald-400" /> Tx Conv</span>
                   <span className="text-base sm:text-lg font-bold text-emerald-400">{page.rate}</span>
                 </div>
              </div>

              <div className="flex justify-end gap-2 shrink-0 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
                 <div className="hidden lg:flex items-center gap-4 mr-4 border-r border-white/10 pr-4">
                   <div className="text-right">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pixel Meta</p>
                     <p className="text-xs text-emerald-400 font-semibold">• {page.pixel ? 'Ativo' : 'Inativo'}</p>
                   </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => openTrackingModal(page)}
                   className="hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"
                   title="Configurações de Rastreamento"
                 >
                   <Settings className="w-4 h-4" />
                 </Button>
                 <Button 
                   onClick={() => {
                     setSelectedPage(page);
                     setNewName(page.name);
                     setNewSlug(page.url.split('/').pop() || "");
                     setPixelId(page.pixel || "");
                     setGtagId(page.gtag || "");
                     setIsCreateModalOpen(true);
                   }}
                   variant="ghost" 
                   size="icon" 
                   className="hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"
                 >
                   <Edit2 className="w-4 h-4" />
                 </Button>
                 <Button 
                   onClick={() => handleDeletePage(page.id)}
                   variant="ghost" 
                   size="icon" 
                   className="hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Landing Page Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  🚀 Criar Nova Landing Page
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure o título e os dados da sua nova página de captura.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Título da Página</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Black Friday, Captura Ebook"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Caminho / Slug (URL)</label>
                <div className="flex items-center bg-[#1e293b] border border-white/10 rounded-xl h-11 overflow-hidden px-4 text-sm text-slate-400">
                  <span className="shrink-0">lp.seussistema.com/</span>
                  <input
                    type="text"
                    required
                    placeholder="black-friday"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="flex-1 bg-transparent text-white focus:outline-none h-full pl-1 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Pixel ID (Meta)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1029384756"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="Ex: G-XXXXXXXXXX"
                    value={gtagId}
                    onChange={(e) => setGtagId(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white h-11 rounded-xl border border-white/5 uppercase text-xs font-black tracking-widest"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl uppercase text-xs font-black tracking-widest"
                >
                  Criar Página
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking and Integration Modal */}
      {isTrackingModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1E293B]/30">
               <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" /> Rastreamento
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedPage.name}</p>
               </div>
               <button onClick={() => setIsTrackingModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">ID do Pixel Meta</label>
                  <input 
                    type="text" 
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    placeholder="Ex: 1029384756" 
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
               </div>
               
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Analytics (G-TAG)</label>
                  <input 
                    type="text" 
                    value={gtagId}
                    onChange={(e) => setGtagId(e.target.value)}
                    placeholder="Ex: G-XXXXXXXXXX" 
                    className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
               </div>
            </div>

            <div className="p-6 border-t border-white/10 flex flex-col gap-3 bg-[#1E293B]/30">
               <Button 
                onClick={() => {
                  toast.promise(new Promise(res => setTimeout(res, 1200)), {
                    loading: 'Verificando scripts...',
                    success: 'Pixel e Google Tag instalados com sucesso!',
                    error: 'Falha na validação.'
                  });
                }}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold gap-2"
               >
                 <Sparkles className="w-4 h-4 animation-pulse" /> Validar Instalação
               </Button>
               <Button 
                onClick={handleSaveTracking}
                className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold gap-2 mt-2"
               >
                 Salvar Configurações
               </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
