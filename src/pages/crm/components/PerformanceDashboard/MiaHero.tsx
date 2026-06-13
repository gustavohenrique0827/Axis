import { Users } from "lucide-react";

export function MiaHero(props: { robotStatus: string; leadsCount: number }) {
  return (
    <div className="flex items-center gap-4 bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl backdrop-blur-xl mb-6">
      <div className="w-12 h-12 shrink-0 bg-blue-600/20 rounded-xl overflow-hidden border border-blue-500/30 p-1">
        <img src="/avatar-ia.png" alt="MIA" className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Centro de Comando MIA-6</h2>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/30 animate-pulse shrink-0">
            ● ONLINE
          </span>
          <span
            className={`px-2 py-0.5 text-[9px] font-black rounded-full border shrink-0 ${
              props.robotStatus === "executando"
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse"
                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }`}
          >
            ● ROBÔ: {(props.robotStatus || "idle").toUpperCase()}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Monitorando funil SDR e Comercial · {props.leadsCount} leads ativos
        </p>
      </div>
    </div>
  );
}

