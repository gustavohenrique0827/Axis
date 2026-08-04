export function MiaHero(props: { robotStatus: string; leadsCount: number }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl mb-6">
      <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl overflow-hidden border border-white/10 p-1">
        <img src="/avatar-ia.png" alt="MIA" className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-medium text-white">Centro de Comando MIA-6</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs shrink-0 ${
            props.robotStatus === "executando" ? "text-slate-300" : "text-slate-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${props.robotStatus === "executando" ? "bg-slate-300" : "bg-slate-500"}`} />
            Robô: {(props.robotStatus || "idle")}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitorando funil SDR e Comercial · {props.leadsCount} leads ativos
        </p>
      </div>
    </div>
  );
}
