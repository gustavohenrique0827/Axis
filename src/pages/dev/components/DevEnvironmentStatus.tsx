import { Card } from "../../../components/ui/card";
import { Database } from "lucide-react";
import { useAmbientes, type EnvStatus } from "../hooks/useAmbientes";

const STATUS_LABEL: Record<EnvStatus, string> = {
  operacional: "Operacional",
  degradado: "Degradado",
  offline: "Offline",
  "em deploy": "Em Deploy",
};

const STATUS_DOT: Record<EnvStatus, string> = {
  operacional: "bg-emerald-500",
  degradado: "bg-amber-500",
  offline: "bg-red-500",
  "em deploy": "bg-slate-400",
};

export function DevEnvironmentStatus() {
  const { environments } = useAmbientes();

  return (
    <Card className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <Database className="w-4 h-4" /> Status dos Ambientes
      </h3>
      <div className="space-y-4">
        {environments.map((env) => (
          <div key={env.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT[env.status]} animate-pulse`} />
              <div>
                <p className="text-xs font-black text-white">{env.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{env.version}</p>
              </div>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${env.status === "operacional" ? "bg-emerald-500/10 text-emerald-400" : env.status === "em deploy" ? "bg-slate-500/10 text-slate-300" : env.status === "degradado" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
              {STATUS_LABEL[env.status]}
            </span>
          </div>
        ))}
        {environments.length === 0 && (
          <div className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest py-6">
            Nenhum ambiente cadastrado.
          </div>
        )}
      </div>
    </Card>
  );
}
