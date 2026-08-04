import { Card } from "../../../../components/ui/card";
import { FileText, DollarSign, AlertCircle, TrendingUp } from "lucide-react";

interface ContractsKPIsProps {
  totalMRR: number;
  ativos: number;
  inadimplentes: number;
}

export function ContractsKPIs({ totalMRR, ativos, inadimplentes }: ContractsKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-5 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">MRR Total</p>
          <h3 className="text-2xl font-bold text-white">R$ {totalMRR.toLocaleString("pt-BR")}</h3>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Contratos Ativos</p>
          <h3 className="text-2xl font-bold text-white">{ativos}</h3>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Inadimplência</p>
          <h3 className="text-2xl font-bold text-white">{inadimplentes}</h3>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)]/80 border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Retenção Estimada</p>
          <h3 className="text-2xl font-bold text-white">96.8%</h3>
        </div>
      </Card>
    </div>
  );
}
