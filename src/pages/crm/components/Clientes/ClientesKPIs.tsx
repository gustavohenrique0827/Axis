import { Card } from "../../../../components/ui/card";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ClientesKPIsProps {
  total: number;
  ativos: number;
  implantacao: number;
  inativos: number;
}

export function ClientesKPIs({ total, ativos, implantacao, inativos }: ClientesKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-blue-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total</p>
          <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400"><Users className="w-3.5 h-3.5" /></div>
        </div>
        <h3 className="text-2xl font-black text-white">{total}</h3>
      </Card>
      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-emerald-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Ativos</p>
          <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></div>
        </div>
        <h3 className="text-2xl font-black text-emerald-400">{ativos}</h3>
      </Card>
      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-amber-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Em Implantação</p>
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400"><Clock className="w-3.5 h-3.5" /></div>
        </div>
        <h3 className="text-2xl font-black text-amber-400">{implantacao}</h3>
      </Card>
      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-slate-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Inativos</p>
          <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400"><AlertCircle className="w-3.5 h-3.5" /></div>
        </div>
        <h3 className="text-2xl font-black text-slate-400">{inativos}</h3>
      </Card>
    </div>
  );
}
