import React, { useMemo } from "react";

const TEMP_CFG = {
  Quente: {
    gradient: "from-rose-600/20 via-rose-500/5 to-transparent",
    badge: "bg-rose-500/10 border-rose-500/25 text-rose-400",
    avatar: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
    emoji: "🔥",
  },
  Morno: {
    gradient: "from-amber-500/20 via-amber-400/5 to-transparent",
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-400",
    avatar: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
    emoji: "☀️",
  },
  Frio: {
    gradient: "from-blue-600/20 via-blue-500/5 to-transparent",
    badge: "bg-blue-500/10 border-blue-500/25 text-blue-400",
    avatar: "bg-blue-500/20 text-blue-200 ring-blue-500/40",
    emoji: "❄️",
  },
};

interface ProfileHeroCardProps {
  temperature: "Quente" | "Morno" | "Frio";
  companyName: string;
  leadName: string;
  displayValue: string;
  slaStatus: string;
  priority: "Alta" | "Média" | "Baixa";
  score: number;
  probability: number;
  timeIdle: string;
}

export function ProfileHeroCard({
  temperature,
  companyName,
  leadName,
  displayValue,
  slaStatus,
  priority,
  score,
  probability,
  timeIdle,
}: ProfileHeroCardProps) {
  const tc = TEMP_CFG[temperature] || TEMP_CFG.Frio;
  const probNum = Math.round(Number(probability) || 0);
  const timeIdleNum = parseInt(String(timeIdle)) || 0;

  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br ${tc.gradient} bg-[var(--color-surface-elevated)]`}>
      <div className="p-4">
        {/* Top badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${tc.badge}`}>
              {tc.emoji} {temperature}
            </span>
            <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${
              slaStatus === "Em Dia"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : slaStatus === "Crítico"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              SLA · {slaStatus}
            </span>
          </div>
          <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${
            priority === "Alta"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : priority === "Média"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-slate-700/40 border-white/10 text-slate-400"
          }`}>
            ▲ {priority}
          </span>
        </div>

        {/* Avatar + identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ring-2 ring-offset-2 ring-offset-[#111827] ${tc.avatar}`}>
            {(companyName || leadName || "LD").substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-white leading-tight truncate">
              {companyName || leadName || <span className="text-slate-500 italic font-normal text-sm">Sem nome cadastrado</span>}
            </h3>
            {companyName && leadName && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{leadName}</p>
            )}
            <div className="mt-2">
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{displayValue}</span>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[var(--color-surface)]/70 rounded-xl p-3 border border-white/[0.05]">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Score</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-cyan-400">{score}</span>
              <span className="text-[9px] text-slate-600">/100</span>
            </div>
            <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="bg-[var(--color-surface)]/70 rounded-xl p-3 border border-white/[0.05]">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Conversão</div>
            <div className="mt-1">
              <span className={`text-xl font-black ${
                probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-slate-400"
              }`}>{probNum}%</span>
            </div>
            <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  probNum >= 70 ? "bg-emerald-400" : probNum >= 40 ? "bg-amber-400" : "bg-slate-600"
                }`}
                style={{ width: `${probNum}%` }}
              />
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${
            timeIdleNum > 7
              ? "bg-rose-500/10 border-rose-500/20"
              : timeIdleNum > 3
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-[var(--color-surface)]/70 border-white/[0.05]"
          }`}>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Parado</div>
            <div className={`text-xl font-black mt-1 ${
              timeIdleNum > 7 ? "text-rose-400" : timeIdleNum > 3 ? "text-amber-400" : "text-slate-300"
            }`}>{timeIdle || "0d"}</div>
            <div className="text-[8px] text-slate-600 mt-1">sem contato</div>
          </div>
        </div>
      </div>
    </div>
  );
}
