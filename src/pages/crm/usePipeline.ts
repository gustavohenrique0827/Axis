import { useState, useMemo } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export function usePipeline() {
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
  }, [currentPipeline, isSdrEnabled, stages]);

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

  const auditStageWithAI = async (stageId: string) => {
    const stage = activePipelineStages.find(s => s.id === stageId);
    const stageLeads = filteredItemsList.filter(l => l.stageId === stageId);
    
    toast.promise(
      fetch("/api/ai/pipeline-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageName: stage?.name, leads: stageLeads })
      }).then(r => r.json()),
      {
        loading: `Master IA auditando etapa ${stage?.name}...`,
        success: (data) => `Insight: ${data.insight}\n\nAção: ${data.action}`,
        error: "Erro na auditoria da IA."
      }
    );
  };

  const handleExportIAResume = (e: any, lead: any) => {
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

  const handleTransferToComercial = (e: any, lead: any) => {
    e.stopPropagation();
    updateLead(lead.id, {
      pipelineId: 'comercial',
      stageId: '1'
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

  return {
    isModalOpen, setIsModalOpen,
    selectedLead, setSelectedLead,
    sellerFilter, setSellerFilter,
    searchQuery, setSearchQuery,
    showAnalytics, setShowAnalytics,
    openDropdownId, setOpenDropdownId,
    tempDropdownId, setTempDropdownId,
    webhookModalLead, setWebhookModalLead,
    webhookUrl, setWebhookUrl,
    leads, updateLead, tasks, addTask,
    isMaster, tenantFilter, setTenantFilter,
    currentPipeline, setCurrentPipeline,
    isSdrEnabled,
    activeStageId, setActiveStageId,
    draggedLeadId, setDraggedLeadId,
    draggedOverStageId, setDraggedOverStageId,
    draggedColumnId, setDraggedColumnId,
    tenantsList,
    stages, setStages,
    activePipelineStages,
    sellers,
    allSellersFullList,
    filteredItemsList,
    analyticsData,
    formattedTotalValue,
    winRate,
    auditStageWithAI,
    triggerCelebration,
    exportPDF,
    handleExportIAResume,
    handleTransferToComercial
  };
}
