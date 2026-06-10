import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Plus, Filter, Search, Briefcase, Target, Zap, BarChart3, PieChart,
  Building2, ChevronDown, Settings2, ChevronRight
} from "lucide-react";
import { NewLeadModal } from "../../components/ui/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

import { usePipeline } from "./usePipeline";
import { PipelineAnalytics } from "./components/PipelineAnalytics";
import { LeadCard } from "./components/LeadCard";
import { WebhookModal } from "./components/WebhookModal";

export default function Pipeline() {
  const [minimizedColumns, setMinimizedColumns] = useState<Set<string>>(new Set());

  const {
    isModalOpen, setIsModalOpen,
    selectedLead, setSelectedLead,
    sellerFilter, setSellerFilter,
    companyFilter, setCompanyFilter,
    searchQuery, setSearchQuery,
    showAnalytics, setShowAnalytics,
    openDropdownId, setOpenDropdownId,
    tempDropdownId, setTempDropdownId,
    webhookModalLead, setWebhookModalLead,
    webhookUrl, setWebhookUrl,
    leads, updateLead, tasks,
    isMaster, tenantFilter, setTenantFilter,
    clientFilter, setClientFilter, clientsList,
    currentPipeline, setCurrentPipeline,
    selectedFunilId, setSelectedFunilId,
    comercialFunis, sdrFunis,
    draggedLeadId, setDraggedLeadId,
    draggedOverStageId, setDraggedOverStageId,
    tenantsList,
    companiesList,
    activePipelineStages,
    sellers,
    filteredItemsList,
    analyticsData,
    formattedTotalValue,
    winRate,
    triggerCelebration,
    exportPDF,
    handleExportIAResume,
    handleTransferToComercial,
  } = usePipeline();

  // Initialize minimized columns from funil config whenever stages change
  useEffect(() => {
    setMinimizedColumns(
      new Set(activePipelineStages.filter((s: any) => s.iniciarMinimizado).map((s: any) => s.id))
    );
  }, [activePipelineStages.map((s: any) => s.id).join(",")]);

  const toggleColumn = (stageId: string) =>
    setMinimizedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });

  const checkCapacityAndOpenModal = () => {
    const comercialLeadsCount = leads.filter((l: any) => l.pipelineId === "comercial" || !l.pipelineId).length;
    if (comercialLeadsCount > 50) {
      toast.error(`Capacidade do Closer crítica! (${comercialLeadsCount} leads no Comercial)`);
    } else if (comercialLeadsCount > 30) {
      toast.warning(`Capacidade do Closer próxima ao limite! (${comercialLeadsCount} leads no Comercial)`);
    }
    setIsModalOpen(true);
  };

  const noPipelineConfigured = comercialFunis.length === 0 && sdrFunis.length === 0;

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
        <PipelineAnalytics showAnalytics={showAnalytics} analyticsData={analyticsData} exportPDF={exportPDF} />

        {/* No pipeline configured banner */}
        {noPipelineConfigured && (
          <Card className="p-6 bg-[#111827]/60 border border-amber-500/20 rounded-2xl flex items-center gap-4">
            <Settings2 className="w-8 h-8 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Nenhum funil configurado</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure seus funis e etapas nas configurações do CRM para usar o pipeline.
              </p>
            </div>
            <Link
              to="/app/configuracoes/crm/funis"
              className="shrink-0 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all"
            >
              Configurar →
            </Link>
          </Card>
        )}

        {/* Pipeline type tabs + metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {/* Comercial funis */}
            {comercialFunis.length === 1 ? (
              <button
                onClick={() => { setCurrentPipeline("comercial"); setSelectedFunilId(comercialFunis[0].id); }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  currentPipeline === "comercial"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                    : "text-slate-500 hover:text-white border-transparent bg-[#111827]/80"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                {comercialFunis[0].nome}
              </button>
            ) : comercialFunis.length > 1 ? (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                currentPipeline === "comercial"
                  ? "bg-blue-600/20 border-blue-500/30"
                  : "bg-[#111827]/80 border-white/5"
              }`}>
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <select
                  value={selectedFunilId}
                  onChange={(e) => {
                    setCurrentPipeline("comercial");
                    setSelectedFunilId(e.target.value);
                  }}
                  className="bg-transparent border-none text-blue-400 focus:outline-none text-xs font-bold cursor-pointer"
                >
                  {comercialFunis.map((f: any) => (
                    <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-blue-400" />
              </div>
            ) : null}

            {/* SDR funis */}
            {sdrFunis.length === 1 ? (
              <button
                onClick={() => { setCurrentPipeline("sdr"); setSelectedFunilId(sdrFunis[0].id); }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-2 ${
                  currentPipeline === "sdr"
                    ? "bg-pink-600/20 text-pink-400 border-pink-500/30"
                    : "text-slate-500 hover:text-pink-400 border-transparent bg-[#111827]/80"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {sdrFunis[0].nome}
              </button>
            ) : sdrFunis.length > 1 ? (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                currentPipeline === "sdr"
                  ? "bg-pink-600/20 border-pink-500/30"
                  : "bg-[#111827]/80 border-white/5"
              }`}>
                <Zap className="w-3.5 h-3.5 text-pink-400" />
                <select
                  value={selectedFunilId}
                  onChange={(e) => {
                    setCurrentPipeline("sdr");
                    setSelectedFunilId(e.target.value);
                  }}
                  className="bg-transparent border-none text-pink-400 focus:outline-none text-xs font-bold cursor-pointer"
                >
                  {sdrFunis.map((f: any) => (
                    <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-pink-400" />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#111827]/60 border border-white/5 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Taxa</span>
              <span className="text-sm font-black text-emerald-400 leading-none">
                {winRate}% <span className="text-[9px] font-medium text-slate-600">win</span>
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#111827]/60 border border-white/5 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Valor Total</span>
              <span className="text-sm font-black text-white leading-none font-mono">{formattedTotalValue}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-3 bg-[#111827]/60 border border-white/5 shadow-md flex flex-wrap gap-2 rounded-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar negócios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-full h-[38px]"
            />
          </div>

          {/* Empresa / company */}
          <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              {companiesList.map((c) => (
                <option key={c} value={c} className="bg-[#111827]">
                  {c === "Todos" ? "Todas as empresas" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Parceiro / tenant (master only) */}
          {isMaster && (
            <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
              <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="Todos" className="bg-[#111827]">Todos os parceiros</option>
                {(tenantsList as string[]).filter(Boolean).map((t) => (
                  <option key={t} value={t} className="bg-[#111827]">{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cliente (da tabela clientes) */}
          {clientsList.length > 0 && (
            <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <option value="Todos" className="bg-[#111827]">Todos os clientes</option>
                {clientsList.map((c) => (
                  <option key={c} value={c} className="bg-[#111827]">{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Vendedor */}
          <div className="flex items-center gap-2 bg-[#0B1120] px-3 py-1.5 rounded-xl border border-white/10 h-[38px]">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              {sellers.map((s) => (
                <option key={s} value={s} className="bg-[#111827]">
                  {s === "Todos" ? "Todos os vendedores" : s}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Pipeline Board */}
        {activePipelineStages.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1 scrollbar-thin items-start">
            {activePipelineStages.map((stage: any, idx: number) => {
              const stageLeads = filteredItemsList.filter((l: any) => l.stageId === stage.id);
              const isLastStage = idx === activePipelineStages.length - 1;
              const isMinimized = minimizedColumns.has(stage.id);

              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => { e.preventDefault(); setDraggedOverStageId(stage.id); }}
                  onDragLeave={() => setDraggedOverStageId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leadId = e.dataTransfer.getData("text/plain");
                    if (leadId) {
                      updateLead(leadId, {
                        stageId: stage.id,
                        status: isLastStage ? "Fechado" : "Em Negociação",
                      });
                      if (isLastStage && currentPipeline === "comercial") triggerCelebration();
                      toast.success(`Movido para: ${stage.name}`);
                    }
                    setDraggedOverStageId(null);
                    setDraggedLeadId(null);
                  }}
                  className={`shrink-0 flex flex-col bg-[#0B1120]/40 border rounded-3xl transition-all duration-300 ${
                    isMinimized ? "w-[56px] p-2" : "w-[300px] p-4"
                  } ${
                    draggedOverStageId === stage.id
                      ? "border-blue-500/50 bg-blue-500/10 scale-[1.02]"
                      : "border-white/5 hover:border-white/20 hover:bg-[#111827]/60 hover:shadow-lg"
                  }`}
                >
                  {/* Column header — always visible, click to toggle */}
                  {isMinimized ? (
                    <button
                      onClick={() => toggleColumn(stage.id)}
                      className="flex flex-col items-center gap-3 py-2 w-full cursor-pointer"
                      title={`${stage.name} (${stageLeads.length})`}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                      <span
                        className="text-[9px] font-black text-slate-400 uppercase tracking-widest"
                        style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
                      >
                        {stage.name}
                      </span>
                      <span className="text-[10px] font-black text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-600 mt-auto" />
                    </button>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2 mb-4 shrink-0 text-left">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleColumn(stage.id)}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-slate-300 transition-colors">
                              {stage.name}
                            </h3>
                          </button>
                          <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {stageLeads.length}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold bg-[#0B1120] border border-white/5 px-2 py-1 rounded-lg w-fit shadow-inner">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
                            stageLeads.reduce((sum, item: any) => sum + (parseFloat((item.value || "").replace(/[^\d]/g, "")) || 0), 0)
                          )}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] pb-10 scrollbar-none">
                        <AnimatePresence mode="popLayout">
                          {stageLeads.map((item: any) => (
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
                                stageName={stage.name}
                                pipelineName={currentPipeline === 'sdr' ? 'Pipeline SDR' : 'Pipeline Comercial'}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer bg-transparent"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : !noPipelineConfigured ? (
          <Card className="flex-1 flex items-center justify-center p-12 bg-[#111827]/40 border border-white/5 rounded-3xl">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-400">
                Selecione um funil para visualizar o pipeline.
              </p>
            </div>
          </Card>
        ) : null}
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <LeadDetailsModal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} lead={selectedLead} />

      <WebhookModal
        webhookModalLead={webhookModalLead}
        setWebhookModalLead={setWebhookModalLead}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />
    </PageContainer>
  );
}
