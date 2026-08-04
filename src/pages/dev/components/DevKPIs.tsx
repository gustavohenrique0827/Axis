import { Card } from "../../../components/ui/card";
import { ArrowUpRight, Zap, Bug, Rocket, Server } from "lucide-react";

const STATS = [
  { label: "Pontos no Sprint", value: "--", trend: "--", icon: Zap, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  { label: "Issues em Aberto", value: "--", trend: "--", icon: Bug, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  { label: "Deploys Hoje", value: "--", trend: "--", icon: Rocket, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  { label: "Uptime Produção", value: "--", trend: "--", icon: Server, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
];

export function DevKPIs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 group">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black ${stat.color}`}>
              <ArrowUpRight className="w-3 h-3" /> {stat.trend}
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-2">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
