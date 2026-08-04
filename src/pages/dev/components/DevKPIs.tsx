import { Card } from "../../../components/ui/card";
import { ArrowUpRight, Zap, Bug, Rocket, Server } from "lucide-react";

const STATS = [
  { label: "Pontos no Sprint", value: "--", trend: "--", icon: Zap },
  { label: "Issues em Aberto", value: "--", trend: "--", icon: Bug },
  { label: "Deploys Hoje", value: "--", trend: "--", icon: Rocket },
  { label: "Uptime Produção", value: "--", trend: "--", icon: Server },
];

export function DevKPIs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((stat, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpRight className="w-3 h-3" /> {stat.trend}
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
