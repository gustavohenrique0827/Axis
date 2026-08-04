import { Card } from "../../../components/ui/card";
import { Database } from "lucide-react";

const ENVIRONMENTS = [
  { name: "Produção", status: "Operacional", version: "v2.4.1", color: "bg-emerald-500" },
  { name: "Staging", status: "Operacional", version: "v2.4.2-rc1", color: "bg-emerald-500" },
  { name: "Desenvolvimento", status: "Em Build", version: "v2.5.0-dev", color: "bg-amber-500" },
  { name: "QA / Testes", status: "Operacional", version: "v2.4.2-qa", color: "bg-emerald-500" },
];

export function DevEnvironmentStatus() {
  return (
    <Card className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
      <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <Database className="w-4 h-4" /> Status dos Ambientes
      </h3>
      <div className="space-y-4">
        {ENVIRONMENTS.map((env, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${env.color} animate-pulse`} />
              <div>
                <p className="text-xs font-black text-white">{env.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{env.version}</p>
              </div>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${env.status === "Operacional" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              {env.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
