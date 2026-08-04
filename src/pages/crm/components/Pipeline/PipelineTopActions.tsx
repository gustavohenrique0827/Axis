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
      <div className="flex items-center bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl overflow-hidden h-11">
        {(["lista", "kanban"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex items-center gap-2 px-4 h-full text-xs transition-all cursor-pointer border-none ${
              view === v
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {v === "lista" ? "Lista" : "Kanban"}
          </button>
        ))}
      </div>

      {view === "kanban" && (
        <Button
          variant="subtle"
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="gap-2 h-11 px-4"
        >
          {showAnalytics ? "Ocultar" : "Performance"}
        </Button>
      )}

      <Button
        onClick={onNewLead}
        className="gap-2 h-11 px-6"
      >
        <Plus className="w-4 h-4" /> Novo Lead
      </Button>
    </div>
  );
}

