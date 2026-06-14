import React from "react";
import { Trophy, ThumbsDown, X, Brain, ChevronRight, User, Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import { toast } from "sonner";

interface LeadDetailsModalHeroProps {
  tc: {
    stripe: string;
    hero: string;
    avatar: string;
    badge: string;
    icon: React.ElementType;
    label: string;
  };
  initials: string;
  companyName: string;
  leadName: string;
  formattedValue: string;
  priority: string;
  slaStatus: string;
  stagesDef: any[];
  lead: any;
  seller: string;
  setAlterationLogs: React.Dispatch<React.SetStateAction<any[]>>;
  updateLead: (id: string, data: any) => void;
  showCopilot: boolean;
  setShowCopilot: (v: boolean) => void;
  onClose: () => void;
  moveToStage: (stg: any) => void;
}

export function LeadDetailsModalHero({
  tc,
  initials,
  companyName,
  leadName,
  formattedValue,
  priority,
  slaStatus,
  stagesDef,
  lead,
  seller,
  setAlterationLogs,
  updateLead,
  showCopilot,
  setShowCopilot,
  onClose,
  moveToStage,
}: LeadDetailsModalHeroProps) {
  const TempIcon = tc.icon;
  const currentStageIdx = stagesDef.findIndex((s) => s.id === lead.stageId);

  return (
    <>
      {/* Temperature stripe */}
      <div className={`h-[3px] shrink-0 bg-gradient-to-r ${tc.stripe}`} />

      <div className={`relative shrink-0 bg-gradient-to-b ${tc.hero} border-b border-white/[0.06] overflow-hidden`}>
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-[0.08] bg-white pointer-events-none" />

        {/* Top action bar */}
        <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const lastStage = stagesDef[stagesDef.length - 1];
                updateLead(lead.id, { stageId: lastStage?.id ?? "5", status: "Fechado" });
                toast.success("Lead fechado como GANHO! 🏆");
                setAlterationLogs((prev) => [
                  { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO GANHO", time: "Agora" },
                  ...prev,
                ]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95"
            >
              <Trophy className="w-3 h-3" /> Ganho
            </button>
            <button
              onClick={() => {
                updateLead(lead.id, { status: "Perdido" });
                toast.warning("Lead marcado como Perdido.");
                setAlterationLogs((prev) => [
                  { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO PERDIDO", time: "Agora" },
                  ...prev,
                ]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
            >
              <ThumbsDown className="w-3 h-3" /> Perdido
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowCopilot(!showCopilot)}
              title="IA Copilot"
              className={cn(
                "p-1.5 rounded-lg border transition-all",
                showCopilot
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-md shadow-violet-500/20"
                  : "border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10"
              )}
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lead identity */}
        <div className="relative flex items-center gap-4 px-5 pb-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-lg",
            "ring-2 ring-offset-2 ring-offset-[#0B1120] select-none",
            tc.avatar
          )}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white truncate leading-tight">
                {companyName || leadName || <span className="text-slate-500 italic font-normal text-sm">Sem nome</span>}
              </h2>
              <span className={cn(
                "inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0",
                tc.badge
              )}>
                <TempIcon className="w-2.5 h-2.5" />
                {tc.label}
              </span>
            </div>

            {companyName && leadName && (
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <User className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="truncate">{leadName}</span>
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-sm font-black text-emerald-400 font-mono tracking-tight">
                {formattedValue}
              </span>
              <div className="w-px h-3 bg-white/10 shrink-0" />
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                priority === "Alta"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : priority === "Média"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-slate-700/40 border-white/10 text-slate-500"
              )}>
                ▲ {priority}
              </span>
              {slaStatus && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  slaStatus === "Em Dia"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : slaStatus === "Crítico"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                  SLA · {slaStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stage stepper */}
        <div className="relative px-5 pb-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-max">
            {stagesDef.map((stg: any, idx: number) => {
              const isActive = lead.stageId === stg.id;
              const isPast = currentStageIdx > idx;
              const isLast = idx === stagesDef.length - 1;
              return (
                <React.Fragment key={stg.id}>
                  <button
                    onClick={() => moveToStage(stg)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border",
                      isActive
                        ? "bg-blue-500/15 text-blue-300 border-blue-500/35 shadow-sm shadow-blue-500/15"
                        : isPast
                        ? "text-emerald-500/70 border-transparent hover:border-white/10 hover:bg-white/5"
                        : "text-slate-600 border-transparent hover:text-slate-300 hover:border-white/10 hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                    )}
                    {isPast && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Check className="w-2 h-2 text-emerald-400" />
                      </span>
                    )}
                    {stg.name}
                  </button>
                  {!isLast && (
                    <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 mx-0.5" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
