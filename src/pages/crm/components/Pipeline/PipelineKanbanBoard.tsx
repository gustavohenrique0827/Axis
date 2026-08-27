import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { LeadCard } from "./LeadCard";
import { Task } from "../../../../types";

interface PipelineKanbanBoardProps {
  activePipelineStages: any[];
  filteredItemsList: any[];
  tasks: Task[];
  showAnalytics?: boolean;
  draggedLeadId: string | null;
  setDraggedLeadId: (id: string | null) => void;
  draggedOverStageId: string | null;
  setDraggedOverStageId: (id: string | null) => void;
  currentPipeline: any;
  minimizedColumns: Set<string>;
  toggleColumn: (stageId: string) => void;
  updateLead: (id: string, updates: any) => void;
  tempDropdownId: string | null;
  setTempDropdownId: (id: string | null) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  setSelectedLead: (lead: any) => void;
  setIsModalOpen: (open: boolean) => void;
  handleTransferToComercial: (e: any, lead: any) => void;
  handleExportIAResume: (e: any, lead: any) => void;
  setWebhookModalLead: (lead: any) => void;
  triggerCelebration?: () => void;
  onReuniaoStageDrop?: (leadId: string, stage: any) => void;
}

export function PipelineKanbanBoard({
  activePipelineStages,
  filteredItemsList,
  tasks,
  draggedLeadId,
  setDraggedLeadId,
  draggedOverStageId,
  setDraggedOverStageId,
  currentPipeline,
  minimizedColumns,
  toggleColumn,
  updateLead,
  tempDropdownId,
  setTempDropdownId,
  openDropdownId,
  setOpenDropdownId,
  setSelectedLead,
  setIsModalOpen,
  handleTransferToComercial,
  handleExportIAResume,
  setWebhookModalLead,
  triggerCelebration,
  onReuniaoStageDrop,
}: PipelineKanbanBoardProps) {
  const getLeadValue = (l: any) => {
    if (!l.valor) return 0;
    const clean = String(l.valor).replace(/[^\d]/g, "");
    return clean ? parseFloat(clean) / 100 : 0;
  };

  const handleDrop = (stage: any, e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (leadId) {
      updateLead(leadId, { status: stage.id || stage.name });
      if (stage.name?.toLowerCase().includes("ganho") || stage.name?.toLowerCase().includes("fechado")) {
        triggerCelebration?.();
      }
      const isReuniaoStage = ["reuniao_agendada", "reuniao agendada", "reunião agendada", "diagnostico", "apresentacao"].includes(
        (stage.name || "").toLowerCase()
      );
      if (isReuniaoStage && onReuniaoStageDrop) onReuniaoStageDrop(leadId, stage);
    }
    setDraggedOverStageId(null);
    setDraggedLeadId(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[500px] scrollbar-none select-none items-stretch">
      {activePipelineStages.map((stage) => {
        const isMinimized = minimizedColumns.has(stage.id);
        const stageLeads = filteredItemsList.filter((l: any) => l.status === stage.id || l.status === stage.name);

        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggedOverStageId(stage.id);
            }}
            onDragLeave={() => setDraggedOverStageId(null)}
            onDrop={(e) => handleDrop(stage, e)}
            className={`shrink-0 flex flex-col bg-[var(--color-surface)]/40 border rounded-3xl transition-all duration-300 h-full ${
              isMinimized ? "w-[56px] p-2" : "w-[280px] p-3"
            } ${draggedOverStageId === stage.id ? "border-[var(--color-primary-blue)]/50 bg-[var(--color-primary-blue)]/10 scale-[1.01]" : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-surface-elevated)]/60"}`}
          >
            {isMinimized ? (
              <button
                type="button"
                onClick={() => toggleColumn(stage.id)}
                className="flex flex-col items-center gap-3 py-2 w-full cursor-pointer"
                title={`${stage.name} (${stageLeads.length})`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span
                  className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
                >
                  {stage.name}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-sunken)] px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                <ChevronRight className="w-3 h-3 text-[var(--color-text-faint)] mt-auto" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                  <button type="button" onClick={() => toggleColumn(stage.id)} className="flex items-center gap-2 cursor-pointer group min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider group-hover:text-[var(--color-primary-blue)] transition-colors truncate">{stage.name}</h3>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)]">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
                        stageLeads.reduce((sum: number, item: any) => sum + getLeadValue(item), 0)
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-primary)] bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] px-2 py-0.5 rounded-full shrink-0">{stageLeads.length}</span>
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
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2 border border-dashed border-[var(--color-border-default)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)]/80 hover:bg-[var(--color-surface-sunken)] transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" /> Novo Lead
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
