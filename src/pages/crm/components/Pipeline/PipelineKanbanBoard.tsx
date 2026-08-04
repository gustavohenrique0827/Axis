import { Plus, ChevronRight } from "lucide-react";
import { LeadCard } from "./LeadCard";
import { useData } from "../../../../contexts/DataContext";

interface PipelineKanbanBoardProps {
  activePipelineStages: any[];
  filteredItemsList: any[];
  tasks: any[];
  showAnalytics: boolean;
  draggedLeadId: string | null;
  setDraggedLeadId: (id: string | null) => void;
  draggedOverStageId: string | null;
  setDraggedOverStageId: (id: string | null) => void;
  currentPipeline: "sdr" | "comercial";

  minimizedColumns: Set<string>;
  toggleColumn: (id: string) => void;
  updateLead: (id: string, data: any) => void;
  tempDropdownId: string | null;
  setTempDropdownId: (id: string | null) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  setSelectedLead: (lead: any) => void;
  setIsModalOpen: (open: boolean) => void;
  handleTransferToComercial: (e: any, lead: any) => void;
  handleExportIAResume: (e: any, lead: any) => void;
  setWebhookModalLead: (lead: any) => void;
  triggerCelebration: () => void;
  onReuniaoStageDrop?: (leadId: string, stage: any) => void;
}

export function PipelineKanbanBoard({
  activePipelineStages, filteredItemsList, tasks, showAnalytics,
  draggedLeadId, setDraggedLeadId, draggedOverStageId, setDraggedOverStageId,
  currentPipeline, minimizedColumns, toggleColumn,
  updateLead, tempDropdownId, setTempDropdownId,
  openDropdownId, setOpenDropdownId, setSelectedLead,
  setIsModalOpen, handleTransferToComercial, handleExportIAResume,
  setWebhookModalLead, triggerCelebration, onReuniaoStageDrop,
}: PipelineKanbanBoardProps) {
  const { products } = useData();

  function getLeadValue(item: any): number {
    const ids: string[] = Array.isArray(item.productIds) ? item.productIds : [];
    if (ids.length > 0) {
      const total = (products as any[]).reduce(
        (s: number, p: any) => ids.includes(p.id) ? s + (Number(p.price) || 0) : s, 0
      );
      if (total > 0) return total;
    }
    return parseFloat(String(item.value ?? "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  }

  const knownStageIds = new Set(activePipelineStages.map((s: any) => s.id));

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
      style={{ height: `calc(100dvh - ${showAnalytics ? 580 : 360}px)`, minHeight: "380px" }}
    >
      {activePipelineStages.map((stage: any, idx: number) => {
        const stageLeads = filteredItemsList.filter((l: any) =>
          l.stageId === stage.id || (idx === 0 && !knownStageIds.has(l.stageId))
        );
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
                const isReuniaoStage = (stage.name || "").toLowerCase().includes("reuni");
                updateLead(leadId, { stageId: stage.id, status: isLastStage ? "Fechado" : "Em Negociação" });
                if (isLastStage && currentPipeline === "comercial") triggerCelebration();
                if (isReuniaoStage && onReuniaoStageDrop) onReuniaoStageDrop(leadId, stage);
              }
              setDraggedOverStageId(null);
              setDraggedLeadId(null);
            }}
            className={`shrink-0 flex flex-col bg-[var(--color-surface)]/40 border rounded-3xl transition-all duration-300 h-full ${
              isMinimized ? "w-[56px] p-2" : "w-[280px] p-3"
            } ${draggedOverStageId === stage.id ? "border-white/30 bg-white/5 scale-[1.02]" : "border-white/5 hover:border-white/20 hover:bg-[var(--color-surface-elevated)]/60"}`}
          >
            {isMinimized ? (
              <button
                onClick={() => toggleColumn(stage.id)}
                className="flex flex-col items-center gap-3 py-2 w-full cursor-pointer"
                title={`${stage.name} (${stageLeads.length})`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span
                  className="text-[9px] text-slate-400"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
                >
                  {stage.name}
                </span>
                <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 mt-auto" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                  <button onClick={() => toggleColumn(stage.id)} className="flex items-center gap-2 cursor-pointer group min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-xs text-slate-300 group-hover:text-white transition-colors truncate">{stage.name}</h3>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-slate-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
                        stageLeads.reduce((sum, item: any) => sum + getLeadValue(item), 0)
                      )}
                    </span>
                    <span className="text-[10px] text-white bg-white/10 px-2 py-0.5 rounded-full shrink-0">{stageLeads.length}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-3 scrollbar-none">
                  {stageLeads.map((item: any) => (
                    <div key={item.id}>
                      <LeadCard
                        item={item} tasks={tasks} stageName={stage.name} draggedLeadId={draggedLeadId} setDraggedLeadId={setDraggedLeadId}
                        updateLead={updateLead} tempDropdownId={tempDropdownId} setTempDropdownId={setTempDropdownId}
                        openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                        setSelectedLead={setSelectedLead} handleTransferToComercial={handleTransferToComercial}
                        handleExportIAResume={handleExportIAResume} setWebhookModalLead={setWebhookModalLead}
                        currentPipeline={currentPipeline}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2.5 border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-slate-400 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer bg-transparent"
                  >
                    <Plus className="w-3 h-3" /> Novo Lead
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
