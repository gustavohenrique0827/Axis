import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, LayoutDashboard, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TeamMember, Squad } from "../../hooks/useEquipe";


interface EquipeOverviewProps {
  team: TeamMember[];
  squads: Squad[];
  logs: Array<{ name: string; from: string; to: string; date: string }>;
  onAdmitir: () => void;
  onGoLogs: () => void;
}


export function EquipeOverview({ team, squads, logs, onAdmitir, onGoLogs }: EquipeOverviewProps) {
  const stats = [
    { label: "Membros Ativos", val: team.length, color: "text-blue-500" },
    { label: "Squads Operantes", val: squads.length, color: "text-cyan-500" },
    { label: "Líderes Alocados", val: squads.filter(s => s.leader).length, color: "text-emerald-500" },
    { label: "Taxa de Eficiência", val: "0%", color: "text-amber-500" },
  ];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="space-y-10"
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="p-2 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <LayoutDashboard className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Equipe & Estrutura</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md">Gerencie capital humano, squads de vendas e audite mudanças de hierarquia institucional.</p>
        </div>
        <Button onClick={onAdmitir} className="gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 font-bold rounded-2xl">
          <Plus className="w-5 h-5" /> Admitir Membro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-3xl hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-colors" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
            <div className={`text-3xl font-black mt-2 ${stat.color} tracking-tighter`}>{stat.val}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-8 bg-[#111827]/30 border-white/5 col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white tracking-tight">Densidade Populacional por Squad</h3>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500">
              Média: {squads.length > 0 ? (team.length / squads.length).toFixed(1) : "0"} / squad
            </div>
          </div>
          <div className="grid gap-6">
            {squads.map((s) => (
              <div key={s.name} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-all" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{s.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{team.filter((m) => m.squad === s.name).length}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${team.length > 0 ? (team.filter((m) => m.squad === s.name).length / team.length) * 100 : 0}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-[#111827]/30 border-white/5">
          <h3 className="text-lg font-black text-white tracking-tight mb-8">Fluxo Institucional</h3>
          <div className="space-y-6">
            {logs.slice(0, 4).map((l, i) => (
              <div key={i} className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
                <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#111827] border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                  {new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </div>
                <div className="text-xs">
                  <span className="text-white font-black">{l.name}</span>
                  <span className="text-slate-500 mx-1.5 ml-2 mr-2">transferido para</span>
                  <span className="text-blue-400 font-bold bg-blue-400/5 px-2 py-0.5 rounded-lg border border-blue-400/10">{l.to}</span>
                </div>
              </div>
            ))}
          </div>
          {logs.length > 4 && (
            <button onClick={onGoLogs} className="w-full mt-6 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white border-t border-white/5 transition-all">
              Ver Histórico Completo →
            </button>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
