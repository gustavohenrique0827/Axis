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
    <Card className="p-4">
      <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
        <Database className="w-4 h-4" /> Status dos Ambientes
      </h3>
      <div className="space-y-2">
        {ENVIRONMENTS.map((env, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${env.color}`} />
              <div>
                <p className="text-xs text-white">{env.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{env.version}</p>
              </div>
            </div>
            <span className={`text-xs ${env.status === "Operacional" ? "text-emerald-400" : "text-amber-400"}`}>
              {env.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
