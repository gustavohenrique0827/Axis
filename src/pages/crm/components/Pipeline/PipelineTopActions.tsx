import { Plus } from "lucide-react";

import { Button } from "../../../../components/ui/button";

type Props = {
  view: "kanban" | "lista";
  setView: (v: "kanban" | "lista") => void;
  showAnalytics: boolean;
  setShowAnalytics: (v: boolean) => void;
  onNewLead: () => void;
};

export function PipelineTopActions({
  view,
  setView,
  showAnalytics,
  setShowAnalytics,
  onNewLead,
}: Props) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] overflow-hidden h-11">
        {(["lista", "kanban"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border-none ${
              view === v
                ? "bg-[var(--color-primary-blue)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {v === "lista" ? "Lista" : "Kanban"}
          </button>
        ))}
      </div>

      {view === "kanban" && (
        <Button
          onClick={() => setShowAnalytics(!showAnalytics)}
          variant="subtle"
          className="font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-4"
        >
          {showAnalytics ? "Ocultar" : "Performance"}
        </Button>
      )}

      <Button
        onClick={onNewLead}
        className="font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-4 h-4" /> Novo Lead
      </Button>
    </div>
  );
}

