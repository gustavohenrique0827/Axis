import { useState, useEffect, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Plus, Filter, Search, Briefcase, Target, Zap, BarChart3, PieChart,
  Building2, Settings2, ChevronRight,
  LayoutList, Columns3, Mail, Phone, Calendar, MoreHorizontal,
  Users, Flame, CheckCircle2,
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
    const comercialCount = leads.filter((l: any) => l.pipelineId === "comercial" || !l.pipelineId).length;
    if (comercialCount > 50) toast.error(`Capacidade crítica! (${comercialCount} leads no Comercial)`);
    else if (comercialCount > 30) toast.warning(`Capacidade próxima ao limite! (${comercialCount} leads)`);
    setIsModalOpen(true);
  };

  const noPipelineConfigured = comercialFunis.length === 0 && sdrFunis.length === 0;

  // KPI stats
  const kpis = useMemo(() => ({
    total: filteredItemsList.length,
    hot: filteredItemsList.filter((l: any) => l.priority === "Alta").length,
    closed: filteredItemsList.filter((l: any) => l.status === "Fechado").length,
  }), [filteredItemsList]);

  // Lista view filtered leads
  const listaLeads = useMemo(() => {
    return (leads as any[])
      .filter((l) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return l.name?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q);
      })
      .filter((l) => sellerFilter === "Todos" || l.seller === sellerFilter)
      .filter((l) => temperatureFilter === "Todas" || l.temperature === temperatureFilter)
      .sort((a, b) => {
        const va = tempOrder[a.temperature] || 0;
        const vb = tempOrder[b.temperature] || 0;
        return sortOrder === "desc" ? vb - va : va - vb;
      });
  }, [leads, searchQuery, sellerFilter, temperatureFilter, sortOrder]);

  return (
    <PageContainer
      title="Leads & Pipeline"
      description="Gerencie oportunidades em visão de lista ou kanban interativo."
      actions={
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center bg-[#111827] border border-white/10 rounded-xl overflow-hidden h-11">
            <button
              onClick={() => setView("lista")}
              className={`flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border-none ${
                view === "lista" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border-none ${
                view === "kanban" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          {view === "kanban" && (
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all cursor-pointer bg-transparent border-none"
            >
              {showAnalytics ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {showAnalytics ? "Ocultar" : "Performance"}
            </Button>
          )}

          <Button
            onClick={checkCapacityAndOpenModal}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-4 flex-1 min-h-0">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
          <Card className="p-3 border-blue-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Total</span>
              <Users className="w-3 h-3 text-blue-400" />
            </div>
            <h3 className="text-xl font-extrabold text-white">{kpis.total}</h3>
          </Card>
          <Card className="p-3 border-yellow-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Alta Prior.</span>
              <Flame className="w-3 h-3 text-yellow-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-yellow-500">{kpis.hot}</h3>
          </Card>
          <Card className="p-3 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Ganhos</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <h3 className="text-xl font-extrabold text-emerald-400">{kpis.closed}</h3>
          </Card>
          <Card className="p-3 border-white/5 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Win Rate</span>
              <Target className="w-3 h-3 text-pink-400" />
            </div>
            <h3 className="text-xl font-extrabold text-pink-400">{winRate}%</h3>
          </Card>
          <Card className="p-3 border-white/5 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all col-span-2 md:col-span-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Valor Total</span>
              <BarChart3 className="w-3 h-3 text-cyan-400" />
            </div>
            <h3 className="text-base font-extrabold text-white font-mono">{formattedTotalValue}</h3>
          </Card>
        </div>

        {/* ─── KANBAN VIEW ──────────────────────────────────────────── */}
        {view === "kanban" && (
          <>
            <PipelineAnalytics showAnalytics={showAnalytics} analyticsData={analyticsData} exportPDF={exportPDF} />

            {noPipelineConfigured && (
              <Card className="p-6 bg-[#111827]/60 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                <Settings2 className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Nenhum funil configurado</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure seus funis nas configurações do CRM para usar o pipeline.
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

            {/* Funil selector + Kanban filters — single compact bar */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Pipeline toggles */}
              {(comercialFunis.length > 0 || sdrFunis.length > 0) && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 border border-white/5 rounded-xl px-2 py-1.5 h-[38px]">
                  {comercialFunis.length === 1 ? (
                    <button
                      onClick={() => { setCurrentPipeline("comercial"); setSelectedFunilId(comercialFunis[0].id); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentPipeline === "comercial" ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      <Briefcase className="w-3 h-3" /> {comercialFunis[0].nome}
                    </button>
                  ) : comercialFunis.length > 1 ? (
                    <div className={`flex items-center gap-1 px-2 rounded-lg transition-all ${currentPipeline === "comercial" ? "text-blue-400" : "text-slate-500"}`}>
                      <Briefcase className="w-3 h-3" />
                      <select value={selectedFunilId} onChange={(e) => { setCurrentPipeline("comercial"); setSelectedFunilId(e.target.value); }} className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer">
                        {comercialFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>)}
                      </select>
                    </div>
                  ) : null}

                  {comercialFunis.length > 0 && sdrFunis.length > 0 && (
                    <div className="w-px h-4 bg-white/10" />
                  )}

                  {sdrFunis.length === 1 ? (
                    <button
                      onClick={() => { setCurrentPipeline("sdr"); setSelectedFunilId(sdrFunis[0].id); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentPipeline === "sdr" ? "bg-pink-600/20 text-pink-400" : "text-slate-500 hover:text-pink-400"
                      }`}
                    >
                      <Zap className="w-3 h-3" /> {sdrFunis[0].nome}
                    </button>
                  ) : sdrFunis.length > 1 ? (
                    <div className={`flex items-center gap-1 px-2 rounded-lg transition-all ${currentPipeline === "sdr" ? "text-pink-400" : "text-slate-500"}`}>
                      <Zap className="w-3 h-3" />
                      <select value={selectedFunilId} onChange={(e) => { setCurrentPipeline("sdr"); setSelectedFunilId(e.target.value); }} className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer">
                        {sdrFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[#111827] text-white">{f.nome}</option>)}
                      </select>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar negócios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111827]/80 border border-white/5 rounded-xl pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 w-full h-[38px]"
                />
              </div>

              {/* Company */}
              <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                  {companiesList.map((c) => <option key={c} value={c} className="bg-[#111827]">{c === "Todos" ? "Todas as empresas" : c}</option>)}
                </select>
              </div>

              {/* Tenant (master only) */}
              {isMaster && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                  <Target className="w-3 h-3 text-blue-400 shrink-0" />
                  <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)}>
                    <option value="" className="bg-[#111827]">Todos os parceiros</option>
                    {(tenantsList as { id: string; name: string }[]).map((t) => <option key={t.id} value={t.id} className="bg-[#111827]">{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Client */}
              {clientsList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                  <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                    <option value="Todos" className="bg-[#111827]">Todos os clientes</option>
                    {clientsList.map((c) => <option key={c} value={c} className="bg-[#111827]">{c}</option>)}
                  </select>
                </div>
              )}

              {/* Seller */}
              <div className="flex items-center gap-1.5 bg-[#111827]/80 px-3 rounded-xl border border-white/5 h-[38px]">
                <Filter className="w-3 h-3 text-slate-500 shrink-0" />
                <select className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer" value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)}>
                  {sellers.map((s) => <option key={s} value={s} className="bg-[#111827]">{s === "Todos" ? "Todos os vendedores" : s}</option>)}
                </select>
              </div>
            </div>

            {/* Kanban board */}
            {activePipelineStages.length > 0 ? (
              <div
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
                style={{ height: `calc(100dvh - ${showAnalytics ? 580 : 360}px)`, minHeight: "380px" }}
              >
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
                          updateLead(leadId, { stageId: stage.id, status: isLastStage ? "Fechado" : "Em Negociação" });
                          if (isLastStage && currentPipeline === "comercial") triggerCelebration();
                          toast.success(`Movido para: ${stage.name}`);
                        }
                        setDraggedOverStageId(null);
                        setDraggedLeadId(null);
                      }}
                      className={`shrink-0 flex flex-col bg-[#0B1120]/40 border rounded-3xl transition-all duration-300 h-full ${
                        isMinimized ? "w-[56px] p-2" : "w-[300px] p-4"
                      } ${
                        draggedOverStageId === stage.id
                          ? "border-blue-500/50 bg-blue-500/10 scale-[1.02]"
                          : "border-white/5 hover:border-white/20 hover:bg-[#111827]/60 hover:shadow-lg"
                      }`}
                    >
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
                              <button onClick={() => toggleColumn(stage.id)} className="flex items-center gap-2 cursor-pointer group">
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
                                stageLeads.reduce((sum, item: any) => sum + (parseFloat(String(item.value ?? "").replace(/[^\d]/g, "")) || 0), 0)
                              )}
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-6 scrollbar-none">
                            {stageLeads.map((item: any) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18 }}
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
                <p className="text-sm font-bold text-slate-400">Selecione um funil para visualizar o pipeline.</p>
              </Card>
            ) : null}
          </>
        )}

        {/* ─── LISTA VIEW ───────────────────────────────────────────── */}
        {view === "lista" && (
          <>
            {/* Lista filters */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome, empresa ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#111827]/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#2563EB] w-full"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-xl px-3 h-10">
                <span className="text-[9px] uppercase font-bold text-slate-500">Temp:</span>
                <select
                  value={temperatureFilter}
                  onChange={(e) => setTemperatureFilter(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
                >
                  <option value="Todas">Todas</option>
                  <option value="quente">🔥 Quente</option>
                  <option value="morno">☀️ Morno</option>
                  <option value="frio">❄️ Frio</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-xl px-3 h-10">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
                >
                  {sellers.map((s) => (
                    <option key={s} value={s} className="bg-[#111827]">{s === "Todos" ? "Todos os vendedores" : s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1.5 bg-[#111827] border border-white/10 rounded-xl px-3 h-10 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Temp {sortOrder === "desc" ? "▼" : "▲"}
              </button>
            </div>

            {/* Desktop table */}
            <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Nome & Empresa</th>
                      <th className="px-6 py-4">Contato</th>
                      <th className="px-6 py-4">Status / Prioridade</th>
                      <th className="px-6 py-4">Valor</th>
                      <th className="px-6 py-4">Responsável</th>
                      <th className="px-6 py-4">Última Interação</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {listaLeads.map((lead: any) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white group-hover:text-[#06B6D4] transition-colors">{lead.name}</div>
                          <div className="text-slate-400 text-xs">{lead.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {lead.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 mt-1 text-xs">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {lead.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`w-fit px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                              lead.status === "Novo" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              lead.status === "Qualificado" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                              lead.status === "Em Negociação" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                              lead.status === "Fechado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>{lead.status}</span>
                            <span className={`w-fit px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                              lead.priority === "Alta" ? "bg-red-500/20 text-red-500" :
                              lead.priority === "Média" ? "bg-yellow-500/20 text-yellow-500" :
                              "bg-blue-500/20 text-blue-500"
                            }`}>{lead.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-emerald-400/80">{lead.value}</td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.seller || ""}
                            onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                            className="bg-[#0B1120]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#2563EB] cursor-pointer hover:bg-white/5"
                          >
                            <option value="">Sem Vendedor</option>
                            {sellers.filter((s: string) => s !== "Todos").map((s: string) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {lead.date}
                          </div>
                          <div className="text-[10px] mt-1 italic">{lead.title}</div>
                          {lead.timeIdle !== undefined && (
                            <div className="mt-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                lead.timeIdle > 7 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse inline-block" : "bg-slate-800 text-slate-400 inline-block"
                              }`}>
                                ⏳ {lead.timeIdle}d sem contato
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {listaLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                          Nenhum lead encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {listaLeads.map((lead: any) => (
                <Card
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="p-4 bg-[#111827]/80 border-white/5 active:border-white/20 transition-all flex flex-col gap-3 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{lead.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{lead.company}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase shrink-0 ml-2 ${
                      lead.priority === "Alta" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      lead.priority === "Média" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>{lead.priority}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2 px-1">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Valor</span>
                      <span className="font-mono text-emerald-400 text-xs">{lead.value}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Status</span>
                      <span className={`w-fit px-2 py-0.5 text-[8px] font-black rounded-full border block ${
                        lead.status === "Novo" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        lead.status === "Fechado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>{lead.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="truncate">{lead.email}</span>
                    <span className="shrink-0 font-medium ml-2">{lead.phone}</span>
                  </div>
                </Card>
              ))}
              {listaLeads.length === 0 && (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
                  Nenhum lead encontrado
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} firstComercialStageId={firstComercialStageId} firstSdrStageId={firstSdrStageId} />
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
