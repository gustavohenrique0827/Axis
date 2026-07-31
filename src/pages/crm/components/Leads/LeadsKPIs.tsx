import { Card } from "../../../../components/ui/card";
import { Users, Flame, CheckCircle2 } from "lucide-react";

export function LeadsKpis(props: {
  stats: { total: number; hot: number; closed: number };
}) {
  const { stats } = props;
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card className="p-4 border-blue-500/20 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Total</span>
          <Users className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <h3 className="text-2xl font-extrabold text-white">{stats.total}</h3>
      </Card>

      <Card className="p-4 border-amber-500/20 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Alta Prior.</span>
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>
        <h3 className="text-2xl font-extrabold text-amber-500">{stats.hot}</h3>
      </Card>

      <Card className="p-4 border-emerald-500/20 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Ganhos</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-extrabold text-emerald-400">{stats.closed}</h3>
      </Card>
    </div>
  );
}

