import { useState, useEffect, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Plus, Filter, Search, Briefcase, Target, Zap, BarChart3, PieChart,
  Building2, Settings2, ChevronRight, LayoutList, Columns3,
} from "lucide-react";
import { NewLeadModal } from "../../components/ui/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { usePipeline } from "./usePipeline";
import { PipelineAnalytics } from "./components/PipelineAnalytics";
import { LeadCard } from "./components/LeadCard";
import { WebhookModal } from "./components/WebhookModal";
import { PipelineKPIs } from "./components/PipelineKPIs";
import { PipelineListaView } from "./components/PipelineListaView";

type ViewMode = "kanban" | "lista";

const tempOrder: Record<string, number> = { quente: 3, morno: 2, frio: 1 };

export default function Pipeline() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [minimizedColumns, setMinimizedColumns] = useState<Set<string>>(new Set());
  const [temperatureFilter, setTemperatureFilter] = useState("Todas");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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
    firstComercialStageId, firstSdrStageId,
    draggedLeadId, setDraggedLeadId,
    draggedOverStageId, setDraggedOverStageId,
    tenantsList, companiesList,
    activePipelineStages, sellers,
    filteredItemsList, analyticsData,
    formattedTotalValue, winRate,
    triggerCelebration, exportPDF,
    handleExportIAResume, handleTransferToComercial,
  } = usePipeline();

  useEffect(() => {
    setMinimizedColumns(
      new Set(activePipelineStages.filter((s: any) => s.iniciarMinimizado).map((s: any) => s.id))
    );
  }, [activePipelineStages.map((s: any) => s.id).join(",")]);

  const toggleColumn = (stageId: string) =>
    setMinimizedColumns(prev => {
      const next = new Set(prev);
      next.has(stageId) ? next.delete(stageId) : next.add(stageId);
      return next;
    });

  const checkCapacityAndOpenModal = () => {
    const count = leads.filter((l: any) => l.pipelineId === "comercial" || !l.pipelineId).length;
    if (count > 50) toast.error(`Capacidade crítica! (${count} leads)`);
    else if (count > 30) toast.warning(`Capacidade próxima ao limite! (${count} leads)`);
    setIsModalOpen(true);
  };

  const noPipelineConfigured = comercialFunis.length === 0 && sdrFunis.length === 0;

  const kpis = useMemo(() => ({
    total: filteredItemsList.length,
    hot: filteredItemsList.filter((l: any) => l.priority === "Alta").length,
    closed: filteredItemsList.filter((l: any) => l.status === "Fechado").length,
  }), [filteredItemsList]);

  const listaLeads = useMemo(() =>
    (leads as any[])
      .filter(l => !searchQuery || ["name", "company", "email"].some(k => l[k]?.toLowerCase().includes(searchQuery.toLowerCase())))
      .filter(l => sellerFilter === "Todos" || l.seller === sellerFilter)
      .filter(l => temperatureFilter === "Todas" || l.temperature === temperatureFilter)
      .sort((a, b) => sortOrder === "desc" ? (tempOrder[b.temperature] || 0) - (tempOrder[a.temperature] || 0) : (tempOrder[a.temperature] || 0) - (tempOrder[b.temperature] || 0)),
    [leads, searchQuery, sellerFilter, temperatureFilter, sortOrder]);

  return (
    <PageContainer
      title="Leads & Pipeline"
      description="Gerencie oportunidades em visão de lista ou kanban interativo."
      actions={
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#111827] border border-white/10 rounded-xl overflow-hidden h-11">
            {(["lista", "kanban"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border-none ${view === v ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white"}`}>
                {v === "lista" ? <LayoutList className="w-3.5 h-3.5" /> : <Columns3 className="w-3.5 h-3.5" />}
                {v === "lista" ? "Lista" : "Kanban"}
              </button>
            ))}
          </div>
          {view === "kanban" && (
            <Button onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all cursor-pointer bg-transparent border-none">
              {showAnalytics ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {showAnalytics ? "Ocultar" : "Performance"}
            </Button>
          )}
          <Button onClick={checkCapacityAndOpenModal}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer border-none">
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-4 flex-1 min-h-0">
        <PipelineKPIs total={kpis.total} hot={kpis.hot} closed={kpis.closed} winRate={winRate} formattedTotalValue={formattedTotalValue} />

        {/* ─── KANBAN VIEW ─────────────────────────────────────────── */}
        {view === "kanban" && (
          <>
            <PipelineAnalytics showAnalytics={showAnalytics} analyticsData={analyticsData} exportPDF={exportPDF} />

            {noPipelineConfigured && (
              <Card className="p-6 bg-[#111827]/60 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                <Settings2 className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Nenhum funil configurado</p>
                  <p className="text-xs text-slate-400 mt-0.5">Configure seus funis nas configurações do CRM.</p>
                </div>
                <Link to="/app/configuracoes/crm/funis" className="shrink-0 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all">
                  Configurar →
                </Link>
              </Card>
            )}

            {/* Funil selector + filters */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {(comercialFunis.length > 0 || sdrFunis.length > 0) && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 border border-white/5 rounded-xl px-2 py-1.5 h-[38px]">
                  {comercialFunis.length === 1 ? (
                    <button onClick={() => { setCurrentPipeline("comercial"); setSelectedFunilId(comercialFunis[0].id); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPipeline === "comercial" ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-white"}`}>
                      <Briefcase className="w-3 h-3" /> {comercialFunis[0].nome}
                    </button>
                  ) : comercialFunis.length > 1 ? (
                    <div className={`flex items-center gap-1 px-2 rounded-lg ${currentPipeline === "comercial" ? "text-blue-400" : "text-slate-500"}`}>
                      <Briefcase className="w-3 h-3" />
                      <select value={selectedFunilId} onChange={(e) => { setCurrentPipeline("comercial"); setSelectedFunilId(e.target.value); }} className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer">
                        {comercialFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>)}
                      </select>
                    </div>
                  ) : null}
                  {comercialFunis.length > 0 && sdrFunis.length > 0 && <div className="w-px h-4 bg-white/10" />}
                  {sdrFunis.length === 1 ? (
                    <button onClick={() => { setCurrentPipeline("sdr"); setSelectedFunilId(sdrFunis[0].id); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPipeline === "sdr" ? "bg-pink-600/20 text-pink-400" : "text-slate-500 hover:text-pink-400"}`}>
                      <Zap className="w-3 h-3" /> {sdrFunis[0].nome}
                    </button>
                  ) : sdrFunis.length > 1 ? (
                    <div className={`flex items-center gap-1 px-2 rounded-lg ${currentPipeline === "sdr" ? "text-pink-400" : "text-slate-500"}`}>
                      <Zap className="w-3 h-3" />
                      <select value={selectedFunilId} onChange={(e) => { setCurrentPipeline("sdr"); setSelectedFunilId(e.target.value); }} className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer">
                        {sdrFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>)}
                      </select>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Buscar negócios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111827]/80 border border-white/5 rounded-xl pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 w-full h-[38px]" />
              </div>

              <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                  {companiesList.map(c => <option key={c} value={c} className="bg-[#111827]">{c === "Todos" ? "Todas as empresas" : c}</option>)}
                </select>
              </div>

              {isMaster && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                  <Target className="w-3 h-3 text-blue-400 shrink-0" />
                  <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
                    <option value="" className="bg-[#111827]">Todos os parceiros</option>
                    {(tenantsList as any[]).map(t => <option key={t.id} value={t.id} className="bg-[#111827]">{t.name}</option>)}
                  </select>
                </div>
              )}

              {clientsList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                  <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                    <option value="Todos" className="bg-[#111827]">Todos os clientes</option>
                    {clientsList.map(c => <option key={c} value={c} className="bg-[#111827]">{c}</option>)}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                <Filter className="w-3 h-3 text-slate-500 shrink-0" />
                <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)}>
                  {sellers.map(s => <option key={s} value={s} className="bg-[#111827]">{s === "Todos" ? "Todos os vendedores" : s}</option>)}
                </select>
              </div>
            </div>

            {/* Kanban board */}
            {activePipelineStages.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
                style={{ height: `calc(100dvh - ${showAnalytics ? 580 : 360}px)`, minHeight: "380px" }}>
                {activePipelineStages.map((stage: any, idx: number) => {
                  const stageLeads = filteredItemsList.filter((l: any) => l.stageId === stage.id);
                  const isLastStage = idx === activePipelineStages.length - 1;
                  const isMinimized = minimizedColumns.has(stage.id);

                  return (
                    <div key={stage.id}
                      onDragOver={(e) => { e.preventDefault(); setDraggedOverStageId(stage.id); }}
                      onDragLeave={() => setDraggedOverStageId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("text/plain");
                        if (leadId) {
                          updateLead(leadId, { stageId: stage.id, status: isLastStage ? "Fechado" : "Em Negociação" });
                          if (isLastStage && currentPipeline === "comercial") triggerCelebration();
                          toast.success(`Movido para: ${stage.name}`);
                        }
                        setDraggedOverStageId(null); setDraggedLeadId(null);
                      }}
                      className={`shrink-0 flex flex-col bg-[#0B1120]/40 border rounded-3xl transition-all duration-300 h-full ${
                        isMinimized ? "w-[56px] p-2" : "w-[280px] p-3"
                      } ${draggedOverStageId === stage.id ? "border-blue-500/50 bg-blue-500/10 scale-[1.02]" : "border-white/5 hover:border-white/20 hover:bg-[#111827]/60 hover:shadow-lg"}`}
                    >
                      {isMinimized ? (
                        <button onClick={() => toggleColumn(stage.id)} className="flex flex-col items-center gap-3 py-2 w-full cursor-pointer" title={`${stage.name} (${stageLeads.length})`}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest" style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-black text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                          <ChevronRight className="w-3 h-3 text-slate-600 mt-auto" />
                        </button>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                            <button onClick={() => toggleColumn(stage.id)} className="flex items-center gap-2 cursor-pointer group min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                              <h3 className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-slate-300 transition-colors truncate">{stage.name}</h3>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-mono font-bold text-slate-600">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
                                  stageLeads.reduce((sum, item: any) => sum + (parseFloat(String(item.value ?? "").replace(/[^\d]/g, "")) || 0), 0)
                                )}
                              </span>
                              <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full shrink-0">{stageLeads.length}</span>
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-3 scrollbar-none">
                            {stageLeads.map((item: any) => (
                              <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                                <LeadCard
                                  item={item} tasks={tasks} draggedLeadId={draggedLeadId} setDraggedLeadId={setDraggedLeadId}
                                  updateLead={updateLead} tempDropdownId={tempDropdownId} setTempDropdownId={setTempDropdownId}
                                  openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                                  setSelectedLead={setSelectedLead} handleTransferToComercial={handleTransferToComercial}
                                  handleExportIAResume={handleExportIAResume} setWebhookModalLead={setWebhookModalLead}
                                  currentPipeline={currentPipeline}
                                />
                              </motion.div>
                            ))}
                            <button onClick={() => setIsModalOpen(true)}
                              className="w-full py-2.5 border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-slate-400 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer bg-transparent">
                              <Plus className="w-3 h-3" /> Novo Lead
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
                <p className="text-sm font-bold text-slate-400">Selecione um funil para visualizar o pipeline.</p>
              </Card>
            ) : null}
          </>
        )}

        {/* ─── LISTA VIEW ───────────────────────────────────────────── */}
        {view === "lista" && (
          <PipelineListaView
            listaLeads={listaLeads} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            sellerFilter={sellerFilter} setSellerFilter={setSellerFilter} sellers={sellers}
            temperatureFilter={temperatureFilter} setTemperatureFilter={setTemperatureFilter}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            setSelectedLead={setSelectedLead} updateLead={updateLead}
          />
        )}
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} firstComercialStageId={firstComercialStageId} firstSdrStageId={firstSdrStageId} />
      <LeadDetailsModal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} lead={selectedLead} />
      <WebhookModal webhookModalLead={webhookModalLead} setWebhookModalLead={setWebhookModalLead} webhookUrl={webhookUrl} setWebhookUrl={setWebhookUrl} />
    </PageContainer>
  );
}
