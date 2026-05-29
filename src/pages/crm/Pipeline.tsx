import { useState, useMemo, MouseEvent } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { 
  Plus, Phone, Mail, Filter, Search, TrendingUp, 
  Briefcase, DollarSign, Target, User, ChevronRight, 
  Star, Trophy, CheckCircle, Flame, GripVertical, Zap,
  BarChart3, Download, Clock, Activity, Brain, PieChart,
  MoreVertical, Calendar, FileText, History, FileDown, ArrowRight
} from "lucide-react";
import { NewLeadModal } from "../../components/ui/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { PageContainer } from "../../components/PageContainer";

export default function Pipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sellerFilter, setSellerFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [tempDropdownId, setTempDropdownId] = useState<string | null>(null);
  const [webhookModalLead, setWebhookModalLead] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const { leads, updateLead, tasks, addTask } = useData();
  const { isModuleEnabled, user, allTenantModules } = useAuth();
  
  const isMaster = user?.isMaster || user?.tenantName?.includes("G-Tech");
  const [tenantFilter, setTenantFilter] = useState(user?.tenantName || "G-Tech Master");

  const [currentPipeline, setCurrentPipeline] = useState<'comercial' | 'sdr'>('comercial');
  const isSdrEnabled = true;
  const [activeStageId, setActiveStageId] = useState('1');

  // Drag and Drop States
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [draggedOverStageId, setDraggedOverStageId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  
  const tenantsList = useMemo(() => {
    if (!isMaster) return [user?.tenantName];
    return Array.from(new Set([...Object.keys(allTenantModules), ...leads.map(l => l.tenantName).filter(Boolean)]));
  }, [isMaster, allTenantModules, leads, user]);

  const [stages, setStages] = useState(() => {
    try {
      const saved = localStorage.getItem("axis_custom_stages");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: '1', name: "Prospecção", color: "#06B6D4", textClass: "text-[#06B6D4]", bgClass: "bg-[#06B6D4]/10", borderClass: "border-[#06B6D4]/20", type: 'comercial' },
      { id: '2', name: "Qualificação", color: "#6366F1", textClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20", type: 'comercial' },
      { id: '3', name: "Apresentação", color: "#8B5CF6", textClass: "text-[#8B5CF6]", bgClass: "bg-[#8B5CF6]/10", borderClass: "border-[#8B5CF6]/20", type: 'comercial' },
      { id: '4', name: "Negociação", color: "#F59E0B", textClass: "text-amber-400", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/20", type: 'comercial' },
      { id: '5', name: "Fechamento", color: "#10B981", textClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20", type: 'comercial' },
    ];
  });

  const sdrStages = [
    { id: 'sdr-1', name: "Triagem SDR", color: "#EC4899", textClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/20", type: 'sdr_ia' },
    { id: 'sdr-2', name: "Contato Efetuado", color: "#F43F5E", textClass: "text-rose-400", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/20", type: 'sdr_ia' },
    { id: 'sdr-3', name: "Qualificação SDR", color: "#6366F1", textClass: "text-indigo-400", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/20", type: 'sdr_ia' },
    { id: 'sdr-4', name: "Reunião Agendada", color: "#8B5CF6", textClass: "text-purple-400", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/20", type: 'sdr_ia' },
    { id: 'sdr-5', name: "Promovido Closer", color: "#10B981", textClass: "text-emerald-400", bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20", type: 'sdr_ia' }
  ];

  const activePipelineStages = useMemo(() => {
    return (currentPipeline === 'sdr' && isSdrEnabled) 
      ? sdrStages.filter(s => s.type === 'sdr_ia') 
      : stages.filter(s => s.type === 'comercial');
  }, [currentPipeline, isSdrEnabled]);

  const sellers = useMemo(() => ["Todos", ...Array.from(new Set(leads.map(l => l.seller).filter(Boolean)))], [leads]);
  const allSellersFullList = useMemo(() => Array.from(new Set(["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos", "Juliana Costa", ...sellers.filter(s => s !== "Todos")])), [sellers]);

  const filteredItemsList = useMemo(() => leads.filter(item => {
    const matchesTenant = !isMaster || tenantFilter === "Todos" || item.tenantName === tenantFilter;
    const matchesPipeline = (currentPipeline === 'sdr' && isSdrEnabled)
      ? item.pipelineId === 'sdr'
      : (!item.pipelineId || item.pipelineId === 'comercial');
    const matchesSeller = sellerFilter === "Todos" || item.seller === sellerFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTenant && matchesPipeline && matchesSeller && matchesSearch;
  }), [leads, currentPipeline, isSdrEnabled, sellerFilter, searchQuery, tenantFilter, isMaster]);

  const analyticsData = useMemo(() => {
    return activePipelineStages.map(s => ({
      name: s.name,
      value: filteredItemsList.filter(l => l.stageId === s.id).length,
      color: s.color
    }));
  }, [activePipelineStages, filteredItemsList]);

  const totalValueSum = filteredItemsList.reduce((sum, item) => {
    const num = parseFloat((item.value || "").replace(/[^\d]/g, "")) || 0;
    return sum + num;
  }, 0);

  const formattedTotalValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(totalValueSum);

  const totalLeadsCount = filteredItemsList.length;
  const closedWonCount = filteredItemsList.filter(l => l.stageId === '5' || l.stageId === 'sdr-5' || l.status === "Fechado").length;
  const winRate = totalLeadsCount > 0 ? Math.round((closedWonCount / totalLeadsCount) * 100) : 0;

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10B981", "#34D399", "#60A5FA"]
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Relatório de Pipeline - ${currentPipeline === 'sdr' ? 'SDR' : 'Comercial'}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    const tableData = filteredItemsList.map(l => [
      l.name,
      l.company,
      activePipelineStages.find(s => s.id === l.stageId)?.name || "Sem Fase",
      l.value,
      l.seller
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Nome', 'Empresa', 'Fase', 'Valor', 'Responsável']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: '#1E293B', textColor: '#FFFFFF' }
    });

    doc.save(`pipeline_${currentPipeline}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF exportado com sucesso! 📄");
  };

  const handleExportIAResume = (e: MouseEvent, lead: any) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`Resumo de IA - ${lead.name}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Empresa: ${lead.company} | Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Resumo de Qualificação:", 14, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(lead.iaSummary || "Nenhuma análise de IA disponível para este lead.", 170);
    doc.text(splitSummary, 14, 50);

    let nextY = 50 + splitSummary.length * 6 + 10;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Últimas 5 Atividades do CRM:", 14, nextY);
    nextY += 8;

    const leadTasks = tasks.filter(t => t.related === lead.name || t.related === lead.company).slice(0, 5);

    if (leadTasks.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Nenhuma atividade recente encontrada.", 14, nextY);
    } else {
      const tableData = leadTasks.map(t => [t.date || "Recente", t.desc, t.status]);
      autoTable(doc, {
        startY: nextY,
        head: [['Data', 'Atividade', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
      });
    }

    doc.save(`Resumo_IA_${lead.name.replace(/\s+/g, '_')}.pdf`);
    setOpenDropdownId(null);
  };

  const handleTransferToComercial = (e: MouseEvent, lead: any) => {
    e.stopPropagation();
    updateLead(lead.id, {
      pipelineId: 'comercial',
      stageId: '1' // First stage of Comercial
    });
    
    addTask({
      title: 'Bem-vindo ao Comercial',
      desc: `Apresentação recebida do SDR. Lead: ${lead.name}`,
      status: 'A Fazer',
      related: lead.name,
      responsible: lead.seller || user?.name || "Closer"
    });
    
    toast.success("Transferência Inteligente: Lead movido para o Comercial e tarefa criada!");
    setOpenDropdownId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Alta": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Média": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Baixa": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "LD";
  };

  const checkCapacityAndOpenModal = () => {
    const comercialLeadsCount = leads.filter(l => l.pipelineId === 'comercial' || !l.pipelineId).length;
    if (comercialLeadsCount > 50) {
      toast.error(`Capacidade do Closer crítica! (${comercialLeadsCount} leads no Comercial)`);
    } else if (comercialLeadsCount > 30) {
      toast.warning(`Capacidade do Closer próxima ao limite! (${comercialLeadsCount} leads no Comercial)`);
    }
    setIsModalOpen(true);
  };

  return (
    <PageContainer
      title="Pipeline de Oportunidades"
      description="Central de gestão de negócios com análise de performance integrada."
      actions={
        <div className="flex items-center gap-2">
           <Button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all cursor-pointer"
          >
            {showAnalytics ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />} 
            {showAnalytics ? "Ocultar" : "Performance"}
          </Button>

          <Button 
            id="btn-add-lead-top"
            onClick={checkCapacityAndOpenModal}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6 flex-1 min-h-0">
        
        {/* Analytics Section */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 bg-[#111827]/80 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-6 mb-2">
                <div className="flex-1 min-h-[200px]">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> Distribuição Financeira por Fase
                  </h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={analyticsData}>
                      <XAxis dataKey="name" hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Relatórios</h4>
                  <Button onClick={exportPDF} className="w-full bg-white/5 border border-white/10 text-xs font-bold h-10 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Exportar PDF Completo
                  </Button>
                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                     <p className="text-[9px] text-blue-400 font-bold uppercase mb-1">Previsão IA</p>
                     <p className="text-xs text-slate-300">Alta probabilidade de fechamento nas próximas 48h para 3 leads.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1.5 w-fit gap-1 relative shadow-xl">
             <button 
              onClick={() => {
                setCurrentPipeline('comercial');
                setActiveStageId('1');
              }}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer flex items-center gap-2 ${
                currentPipeline === 'comercial' 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Comercial
            </button>
            {isSdrEnabled && (
              <button 
                onClick={() => {
                  setCurrentPipeline('sdr');
                  setActiveStageId('sdr-1');
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer flex items-center gap-2 ${
                  currentPipeline === 'sdr' 
                    ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30' 
                    : 'text-[#64748B] hover:text-[#EC4899]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> SDR IA
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#111827]/60 border border-white/5 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Taxa</span>
              <span className="text-sm font-black text-emerald-400 leading-none">{winRate}% <span className="text-[9px] font-medium text-slate-600">win</span></span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#111827]/60 border border-white/5 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Valor Total</span>
              <span className="text-sm font-black text-white leading-none font-mono">{formattedTotalValue}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-[#111827]/60 border border-white/5 shadow-md flex flex-col lg:flex-row gap-3 rounded-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar negócios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full h-[38px]"
            />
          </div>
          {isMaster && (
            <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <select 
                className="bg-transparent border-none text-white focus:outline-none text-xs font-bold"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="Todos" className="bg-[#111827]">Todos os Clientes</option>
                {tenantsList.filter(Boolean).map(t => <option key={t} value={t!} className="bg-[#111827]">{t}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select 
              className="bg-transparent border-none text-white focus:outline-none text-xs font-bold"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              {sellers.map(s => <option key={s} value={s} className="bg-[#111827]">{s}</option>)}
            </select>
          </div>
        </Card>

        {/* Pipeline Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 scrollbar-thin">
          {activePipelineStages.map((stage, idx) => {
            const stageLeads = filteredItemsList.filter(l => l.stageId === stage.id);
            const isLastStage = idx === activePipelineStages.length - 1;
            
            return (
              <motion.div 
                key={stage.id} 
                layout
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedOverStageId(stage.id);
                }}
                onDragLeave={() => setDraggedOverStageId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const leadId = e.dataTransfer.getData("text/plain");
                  if (leadId) {
                    updateLead(leadId, { 
                      stageId: stage.id,
                      status: isLastStage ? 'Fechado' : 'Em Negociação'
                    });
                    if (isLastStage && currentPipeline === 'comercial') {
                      triggerCelebration();
                    }
                    toast.success(`Movido para: ${stage.name}`);
                  }
                  setDraggedOverStageId(null);
                  setDraggedLeadId(null);
                }}
                className={`w-[300px] shrink-0 flex flex-col bg-[#0B1120]/40 border rounded-3xl p-4 transition-all duration-300 ${
                  draggedOverStageId === stage.id ? 'border-blue-500/50 bg-blue-500/10 scale-[1.02]' : 'border-white/5 hover:border-white/20 hover:bg-[#111827]/60 hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col gap-2 mb-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stage.name}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 font-bold bg-[#0B1120] border border-white/5 px-2 py-1 rounded-lg w-fit shadow-inner">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(stageLeads.reduce((sum, item) => sum + (parseFloat((item.value || "").replace(/[^\d]/g, "")) || 0), 0))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] pb-10 scrollbar-none">
                  <AnimatePresence mode="popLayout">
                    {stageLeads.map((item) => {
                      const hasDelayedTask = tasks.some(t => (t.related === item.name || t.related === item.company) && t.status === 'Atrasado');
                      const isDragging = draggedLeadId === item.id;
                      
                      return (
                      <motion.div 
                         key={item.id} 
                         layoutId={item.id}
                         layout 
                         initial={{ opacity: 0, scale: 0.95 }} 
                         animate={{ opacity: 1, scale: 1 }} 
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ type: "spring", stiffness: 400, damping: 25, mass: 1 }}
                      >
                        <Card 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item.id);
                            setDraggedLeadId(item.id);
                          }}
                          className={`p-4 bg-[#111827]/80 border border-white/5 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group ${
                            isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
                          } ${
                            item.priority === 'Alta' ? 'border-rose-500/30' : ''
                          }`}
                          onClick={() => setSelectedLead(item)}
                        >
                          {hasDelayedTask && (
                            <div className="absolute top-3 right-3 flex items-center justify-center pointer-events-none" title="Tarefa Atrasada">
                              <span className="absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-rose-500 opacity-75"></span>
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-400 border border-blue-500/30 shrink-0" title={`Responsável: ${item.seller || "Não atribuído"}`}>
                                  {getInitials(item.seller)}
                               </div>
                               <div className="relative">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setTempDropdownId(tempDropdownId === item.id ? null : item.id); }}
                                   className="flex items-center justify-center p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded sidebar-modules-changed cursor-pointer"
                                   title={`Temperatura: ${item.temperature || 'frio'}`}
                                 >
                                   {item.temperature === 'quente' ? <Flame className="w-3.5 h-3.5 text-rose-500" /> : 
                                    item.temperature === 'morno' ? <Flame className="w-3.5 h-3.5 text-amber-500" /> :
                                    <Flame className="w-3.5 h-3.5 text-blue-500" />}
                                 </button>
                                 {tempDropdownId === item.id && (
                                   <>
                                      <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setTempDropdownId(null); }} />
                                      <div className="absolute left-0 top-full mt-1 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex gap-1 cursor-default animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                                         <button onClick={() => { updateLead(item.id, { temperature: 'quente' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-rose-500 cursor-pointer" title="Quente"><Flame className="w-4 h-4" /></button>
                                         <button onClick={() => { updateLead(item.id, { temperature: 'morno' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-amber-500 cursor-pointer" title="Morno"><Flame className="w-4 h-4" /></button>
                                         <button onClick={() => { updateLead(item.id, { temperature: 'frio' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-blue-500 cursor-pointer" title="Frio"><Flame className="w-4 h-4" /></button>
                                      </div>
                                   </>
                                 )}
                               </div>
                             </div>
                             
                             <div className="flex gap-2 items-center">
                               <div className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${getPriorityColor(item.priority)}`}>
                                 {item.priority}
                               </div>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button className="p-1 text-slate-500 hover:text-emerald-400 cursor-pointer"><Phone className="w-3 h-3" /></button>
                                  <button className="p-1 text-slate-500 hover:text-blue-400 cursor-pointer"><Mail className="w-3 h-3" /></button>
                               </div>
                               <div className="relative shrink-0">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                    }} 
                                    className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>
                                  {openDropdownId === item.id && (
                                    <>
                                       <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                                       <div className="absolute right-0 top-full mt-1 w-52 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); toast.success("Follow-up agendado com sucesso!"); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                                             <Calendar className="w-3.5 h-3.5" /> Agendar Follow-up
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); toast.success("Proposta enviada ao e-mail do cliente."); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                                             <FileText className="w-3.5 h-3.5" /> Enviar Proposta
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setSelectedLead(item); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                                             <History className="w-3.5 h-3.5" /> Ver Histórico
                                          </button>
                                          
                                          {currentPipeline === 'sdr' && (
                                            <>
                                              <div className="h-px bg-white/5 my-1" />
                                              <button onClick={(e) => handleTransferToComercial(e, item)} className="flex items-center gap-2 w-full p-2 hover:bg-blue-500/10 rounded-lg text-xs font-medium text-blue-400 transition-colors cursor-pointer sidebar-modules-changed">
                                                 <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Transf. Inteligente
                                              </button>
                                              <button onClick={(e) => handleExportIAResume(e, item)} className="flex items-center gap-2 w-full p-2 hover:bg-emerald-500/10 rounded-lg text-xs font-medium text-emerald-400 transition-colors cursor-pointer">
                                                 <FileDown className="w-3.5 h-3.5 shrink-0" /> Exportar Resumo IA
                                              </button>
                                              <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setWebhookModalLead(item); }} className="flex items-center gap-2 w-full p-2 hover:bg-purple-500/10 rounded-lg text-xs font-medium text-purple-400 transition-colors cursor-pointer">
                                                 <Activity className="w-3.5 h-3.5 shrink-0" /> Configurar Webhook SDR
                                              </button>
                                            </>
                                          )}
                                       </div>
                                    </>
                                  )}
                               </div>
                             </div>
                          </div>
                          <h4 className="font-bold text-sm text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mb-2">{item.company}</p>
                          
                          <div 
                            className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2 py-1.5 rounded-lg w-fit mb-3 cursor-pointer transition-colors landing-page-card group/ia"
                            onClick={(e) => { e.stopPropagation(); toast.success(`Interação IA com: ${item.name} iniciada.`); }}
                            title="Interagir com IA Master"
                          >
                            <Brain className="w-3 h-3 text-blue-400 group-hover/ia:text-white" />
                            <span className="text-[9px] font-bold text-blue-400 group-hover/ia:text-white uppercase tracking-widest">
                               {item.status === 'IA Analisando' ? 'Analisando' : (item.temperature === 'quente' ? 'Qualificado' : 'Em Nutrição')}
                            </span>
                          </div>
                          
                          {currentPipeline === 'sdr' && (
                            <div className="mb-3 space-y-2">
                               <div className="flex items-center gap-2">
                                  <Zap className={`w-3.5 h-3.5 ${item.scoreIA && item.scoreIA > 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
                                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <div 
                                       className={`h-full ${item.scoreIA && item.scoreIA > 80 ? 'bg-emerald-500' : item.scoreIA && item.scoreIA > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                       style={{ width: `${item.scoreIA || 45}%` }}
                                     />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-300">{item.scoreIA || 45}%</span>
                               </div>
                               <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                                  <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">IA ANALISADO</span>
                                  <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded whitespace-nowrap truncate max-w-[100px]">{item.temperature === 'quente' ? 'ALTA INTENÇÃO' : 'NUTRIÇÃO'}</span>
                               </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                             <span className="font-mono font-bold text-emerald-400/80">{item.value || "R$ 0"}</span>
                             
                             <div className="flex items-center gap-2">
                               {item.timeIdle !== undefined && (
                                 <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                   item.timeIdle > 7 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'
                                 }`} title="Tempo sem interação">
                                   ⏳ {item.timeIdle}d idle
                                 </span>
                               )}
                               <span className="text-[9px]">{item.seller?.split(' ')[0]}</span>
                             </div>
                          </div>
                        </Card>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <LeadDetailsModal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} lead={selectedLead} />
      
      {/* Webhook Modal */}
      {webhookModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setWebhookModalLead(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              X
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Webhook SDR para Closer
            </h3>
            <p className="text-xs text-slate-400 mb-6">Configurar URL de webhook (n8n/Zapier) para automação da passagem de bastão do lead <strong className="text-white">{webhookModalLead.name}</strong>.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Endpoint URL (POST)</label>
                <input 
                  type="url" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://sua-url-do-webhook.com"
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <button 
                onClick={() => {
                   if(webhookUrl) {
                     toast.success("Webhook configurado com sucesso e passagem processada!");
                     setWebhookModalLead(null);
                     setWebhookUrl("");
                   } else {
                     toast.error("Informe uma URL válida.");
                   }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Salvar e Ativar Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

