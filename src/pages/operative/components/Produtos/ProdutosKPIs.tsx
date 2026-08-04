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
      <Card className="bg-[var(--color-surface-elevated)]/60 border-[var(--color-border-subtle)] p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--color-text-muted)] font-extrabold uppercase tracking-wide">Total de SKUs</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)]">{totalSkuCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
          <Package className="w-5 h-5" />
        </div>
      </Card>

      <Card className="bg-[var(--color-surface-elevated)]/60 border-[var(--color-border-subtle)] p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--color-text-muted)] font-extrabold uppercase tracking-wide">SKUs em Operação</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)]">{activeSkuCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
          <Activity className="w-5 h-5" />
        </div>
      </Card>

      <Card className="bg-[var(--color-surface-elevated)]/60 border-[var(--color-border-subtle)] p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--color-text-muted)] font-extrabold uppercase tracking-wide">Margem Ativa Média</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)] font-mono">{averageMarginVal}%</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
          <TrendingUp className="w-5 h-5" />
        </div>
      </Card>

      <Card className="bg-[var(--color-surface-elevated)]/60 border-[var(--color-border-subtle)] p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--color-text-muted)] font-extrabold uppercase tracking-wide">Produtos Favoritos / BestSellers</span>
          <p className="text-2xl font-black text-[var(--color-text-primary)] font-mono">{bestSellerCount}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
          <Sparkles className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
}
