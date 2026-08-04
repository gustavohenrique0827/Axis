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
  const metricItems = [
    { label: "ARPU (Ticket Médio)", value: "R$ 0,00" },
    { label: "Churn Rate", value: "0%" },
    { label: "LTV Estimado", value: "R$ 0,00" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricItems.map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-slate-400 mb-2">{label}</p>
            <h3 className="text-2xl font-semibold text-white">{value}</h3>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-sm text-slate-400 mb-6">Receita vs Churn</h3>
        {revenueData.length === 0 ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center gap-3 text-center">
            <DollarSign className="w-8 h-8 text-slate-500" />
            <span className="text-sm text-slate-500">Sem dados para projeção</span>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
                <Bar dataKey="mrr" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
