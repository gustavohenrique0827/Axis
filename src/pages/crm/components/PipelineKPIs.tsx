import { Card } from "../../../components/ui/card";
import { Users, Flame, CheckCircle2, Target, BarChart3 } from "lucide-react";

interface PipelineKPIsProps {
  total: number;
  hot: number;
  closed: number;
  winRate: number;
  formattedTotalValue: string;
}

export function PipelineKPIs({ total, hot, closed, winRate, formattedTotalValue }: PipelineKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
      <Card className="p-3 border-blue-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Total</span>
          <Users className="w-3 h-3 text-blue-400" />
        </div>
        <h3 className="text-xl font-extrabold text-white">{total}</h3>
      </Card>
      <Card className="p-3 border-yellow-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Alta Prior.</span>
          <Flame className="w-3 h-3 text-yellow-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-extrabold text-yellow-500">{hot}</h3>
      </Card>
      <Card className="p-3 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Ganhos</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        </div>
        <h3 className="text-xl font-extrabold text-emerald-400">{closed}</h3>
      </Card>
      <Card className="p-3 border-white/5 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Win Rate</span>
          <Target className="w-3 h-3 text-pink-400" />
        </div>
        <h3 className="text-xl font-extrabold text-pink-400">{winRate}%</h3>
      </Card>
      <Card className="p-3 border-white/5 bg-[#111827]/80 backdrop-blur-xl hover:scale-[1.02] transition-all col-span-2 md:col-span-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Valor Total</span>
          <BarChart3 className="w-3 h-3 text-cyan-400" />
        </div>
        <h3 className="text-base font-extrabold text-white font-mono">{formattedTotalValue}</h3>
      </Card>
    </div>
  );
}
