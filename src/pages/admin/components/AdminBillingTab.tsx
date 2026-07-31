import { Card } from "../../../components/ui/card";
import { DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";

interface AdminBillingTabProps {
  revenueData: { name: string; mrr: number }[];
  CustomTooltip: React.ComponentType<any>;
}

export function AdminBillingTab({ revenueData, CustomTooltip }: AdminBillingTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
        <Card className="p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">ARPU (Ticket Médio)</p>
          <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
        </Card>
        <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Churn Rate</p>
          <h3 className="text-2xl font-bold text-white">0%</h3>
        </Card>
        <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">LTV Estimado</p>
          <h3 className="text-2xl font-bold text-blue-400">R$ 0,00</h3>
        </Card>
      </div>

      <Card className="p-5 bg-[var(--color-surface-elevated)]/80 border-white/10">
        <h3 className="font-semibold text-lg mb-6">Receita vs Churn</h3>
        {revenueData.length === 0 ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center gap-4 opacity-40">
            <DollarSign className="w-12 h-12 text-slate-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Sem dados para projeção</span>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                <Bar dataKey="mrr" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
