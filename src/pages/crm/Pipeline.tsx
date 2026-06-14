import { useState, useEffect, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Plus, BarChart3, PieChart, Settings2, LayoutList, Columns3 } from "lucide-react";

import { PipelineTopActions } from "./components/Pipeline/PipelineTopActions";

import { NewLeadModal } from "../../components/ui/modals/crm/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { usePipeline } from "./usePipeline";
import { PipelineAnalytics } from "./components/Pipeline/PipelineAnalytics";
import { WebhookModal } from "./components/Pipeline/WebhookModal";
import { PipelineKPIs } from "./components/Pipeline/PipelineKPIs";
import { PipelineListaView } from "./components/Pipeline/PipelineListaView";
import { PipelineFilterBar } from "./components/Pipeline/PipelineFilterBar";
import { PipelineKanbanBoard } from "./components/Pipeline/PipelineKanbanBoard";
import { PipelineViewShell } from "./components/Pipeline/PipelineViewShell";
import { PipelineDefaultState } from "./components/Pipeline/PipelineDefaultState";
import { PipelineEmptySelection } from "./components/Pipeline/PipelineEmptySelection";

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
        <PipelineTopActions
          view={view}
          setView={setView}
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
          onNewLead={checkCapacityAndOpenModal}
        />
      }
    >
      <div className="flex flex-col space-y-4 flex-1 min-h-0">
        <PipelineKPIs total={kpis.total} hot={kpis.hot} closed={kpis.closed} winRate={winRate} formattedTotalValue={formattedTotalValue} />

        {view === "kanban" && (
          <>
            <PipelineAnalytics showAnalytics={showAnalytics} analyticsData={analyticsData} exportPDF={exportPDF} />

            {noPipelineConfigured ? <PipelineDefaultState /> : null}


            <PipelineFilterBar
              comercialFunis={comercialFunis} sdrFunis={sdrFunis}
              currentPipeline={currentPipeline} setCurrentPipeline={setCurrentPipeline}
              selectedFunilId={selectedFunilId} setSelectedFunilId={setSelectedFunilId}
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              companyFilter={companyFilter} setCompanyFilter={setCompanyFilter}
              companiesList={companiesList} isMaster={!!isMaster}
              tenantFilter={tenantFilter} setTenantFilter={setTenantFilter}
              tenantsList={tenantsList} clientFilter={clientFilter}
              setClientFilter={setClientFilter} clientsList={clientsList}
              sellerFilter={sellerFilter} setSellerFilter={setSellerFilter}
              sellers={sellers}
            />

            {activePipelineStages.length > 0 ? (
              <PipelineKanbanBoard
                activePipelineStages={activePipelineStages}
                filteredItemsList={filteredItemsList} tasks={tasks}
                showAnalytics={showAnalytics}
                draggedLeadId={draggedLeadId} setDraggedLeadId={setDraggedLeadId}
                draggedOverStageId={draggedOverStageId} setDraggedOverStageId={setDraggedOverStageId}
                currentPipeline={currentPipeline} minimizedColumns={minimizedColumns} toggleColumn={toggleColumn}
                updateLead={updateLead} tempDropdownId={tempDropdownId} setTempDropdownId={setTempDropdownId}
                openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                setSelectedLead={setSelectedLead} setIsModalOpen={setIsModalOpen}
                handleTransferToComercial={handleTransferToComercial} handleExportIAResume={handleExportIAResume}
                setWebhookModalLead={setWebhookModalLead} triggerCelebration={triggerCelebration}
              />
            ) : !noPipelineConfigured ? <PipelineEmptySelection /> : null}

          </>
        )}

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
