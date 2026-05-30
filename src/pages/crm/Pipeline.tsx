import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { 
  Plus, Filter, Search, Briefcase, Target, Zap, BarChart3, PieChart
} from "lucide-react";
import { NewLeadModal } from "../../components/ui/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";

import { usePipeline } from "./usePipeline";
import { PipelineAnalytics } from "./components/PipelineAnalytics";
import { LeadCard } from "./components/LeadCard";
import { WebhookModal } from "./components/WebhookModal";

export default function Pipeline() {
  const {
    isModalOpen,
    setIsModalOpen,
    selectedLead,
    setSelectedLead,
    sellerFilter,
    setSellerFilter,
    searchQuery,
    setSearchQuery,
    showAnalytics,
    setShowAnalytics,
    openDropdownId,
    setOpenDropdownId,
    tempDropdownId,
    setTempDropdownId,
    webhookModalLead,
    setWebhookModalLead,
    webhookUrl,
    setWebhookUrl,
    leads,
    updateLead,
    tasks,
    isMaster,
    tenantFilter,
    setTenantFilter,
    currentPipeline,
    setCurrentPipeline,
    isSdrEnabled,
    draggedLeadId,
    setDraggedLeadId,
    draggedOverStageId,
    setDraggedOverStageId,
    tenantsList,
    activePipelineStages,
    sellers,
    filteredItemsList,
    analyticsData,
    formattedTotalValue,
    winRate,
    triggerCelebration,
    exportPDF,
    handleExportIAResume,
    handleTransferToComercial
  } = usePipeline();

  const { user } = useAuth();

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
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all cursor-pointer bg-transparent border-none"
          >
            {showAnalytics ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />} 
            {showAnalytics ? "Ocultar" : "Performance"}
          </Button>

          <Button 
            id="btn-add-lead-top"
            onClick={checkCapacityAndOpenModal}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6 flex-1 min-h-0">
        
        {/* Analytics Section */}
        <PipelineAnalytics
          showAnalytics={showAnalytics}
          analyticsData={analyticsData}
          exportPDF={exportPDF}
        />

        {/* Global Stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1.5 w-fit gap-1 relative shadow-xl">
            <button 
              onClick={() => {
                setCurrentPipeline('comercial');
              }}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer border-none bg-transparent flex items-center gap-2 ${
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
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer border-none bg-transparent flex items-center gap-2 ${
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
            <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px] text-left">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <select 
                className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="Todos" className="bg-[#111827]">Todos os Clientes</option>
                {tenantsList.filter(Boolean).map(t => <option key={t} value={t!} className="bg-[#111827]">{t}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px] text-left">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select 
              className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
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
              <div 
                key={stage.id} 
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
                <div className="flex flex-col gap-2 mb-4 shrink-0 text-left">
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
                    {stageLeads.map((item) => (
                      <motion.div 
                        key={item.id} 
                        layoutId={item.id}
                        layout 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 1 }}
                      >
                        <LeadCard
                          item={item}
                          tasks={tasks}
                          draggedLeadId={draggedLeadId}
                          setDraggedLeadId={setDraggedLeadId}
                          updateLead={updateLead}
                          tempDropdownId={tempDropdownId}
                          setTempDropdownId={setTempDropdownId}
                          openDropdownId={openDropdownId}
                          setOpenDropdownId={setOpenDropdownId}
                          setSelectedLead={setSelectedLead}
                          handleTransferToComercial={handleTransferToComercial}
                          handleExportIAResume={handleExportIAResume}
                          setWebhookModalLead={setWebhookModalLead}
                          currentPipeline={currentPipeline}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer bg-transparent">
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <LeadDetailsModal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} lead={selectedLead} />
      
      {/* Webhook Modal */}
      <WebhookModal
        webhookModalLead={webhookModalLead}
        setWebhookModalLead={setWebhookModalLead}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />
    </PageContainer>
  );
}
