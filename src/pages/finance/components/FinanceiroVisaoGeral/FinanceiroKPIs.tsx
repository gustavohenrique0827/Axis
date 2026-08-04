import { Card } from "../../../../components/ui/card";
import { TrendingUp, AlertCircle, Wallet, Globe } from "lucide-react";
import { motion } from "motion/react";

interface FinanceiroKPIsProps {
  receita: number;
  despesa: number;
  mrr: number;
  inadimplencia: number;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function FinanceiroKPIs({ receita, despesa, mrr, inadimplencia }: FinanceiroKPIsProps) {
  const kpis = [
    { label: "Receita (Real)",      value: fmt(receita),               trend: "--", positive: true,  icon: TrendingUp,  color: "text-[#06B6D4]",   bg: "bg-[#06B6D4]/10"   },
    { label: "Custo Operacional",   value: fmt(despesa),               trend: "--", positive: true,  icon: Wallet,      color: "text-[#06B6D4]",   bg: "bg-[#06B6D4]/10"   },
    { label: "MRR Global",          value: fmt(mrr),                   trend: "--", positive: true,  icon: Globe,       color: "text-[#06B6D4]",bg: "bg-[#06B6D4]/10"},
    { label: "Índice de Churn",     value: `${inadimplencia.toFixed(1)}%`, trend: "--", positive: false, icon: AlertCircle, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl relative overflow-hidden group h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${kpi.bg} border border-white/5`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${kpi.positive ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5"}`}>
                {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
              <h3 className="text-2xl font-black text-white italic tracking-tighter">{kpi.value}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0">
              <kpi.icon className="w-full h-full" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
