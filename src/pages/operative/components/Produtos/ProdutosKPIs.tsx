import { Card } from "../../../../components/ui/card";
import { Package, Activity, TrendingUp, Sparkles } from "lucide-react";

interface ProdutosKPIsProps {
  totalSkuCount: number;
  activeSkuCount: number;
  averageMarginVal: number;
  bestSellerCount: number;
}

export function ProdutosKPIs({ totalSkuCount, activeSkuCount, averageMarginVal, bestSellerCount }: ProdutosKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
        <Package className="w-5 h-5 text-indigo-500 mb-4" />
        <div className="text-2xl font-display font-black text-white mb-1 italic">{totalSkuCount}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total de SKUs</div>
      </Card>

      <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
        <Activity className="w-5 h-5 text-emerald-500 mb-4" />
        <div className="text-2xl font-display font-black text-white mb-1 italic">{activeSkuCount}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SKUs em Operação</div>
      </Card>

      <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
        <TrendingUp className="w-5 h-5 text-blue-500 mb-4" />
        <div className="text-2xl font-display font-black text-white mb-1 italic font-mono">{averageMarginVal}%</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Margem Ativa Média</div>
      </Card>

      <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
        <Sparkles className="w-5 h-5 text-amber-500 mb-4" />
        <div className="text-2xl font-display font-black text-white mb-1 italic font-mono">{bestSellerCount}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Produtos Favoritos / BestSellers</div>
      </Card>
    </div>
  );
}
