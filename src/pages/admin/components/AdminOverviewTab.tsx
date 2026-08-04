import { Card } from "../../../components/ui/card";
import {
  Building2, DollarSign, Users, HardDrive, BarChart3,
  Activity, PieChart as PieChartIcon, Server, Inbox,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";

interface AdminOverviewTabProps {
  globalMrr: number;
  revenueData: { name: string; mrr: number }[];
  CustomTooltip: React.ComponentType<any>;
}

export function AdminOverviewTab({ globalMrr, revenueData, CustomTooltip }: AdminOverviewTabProps) {
  const metricItems = [
    { label: "Total de Empresas", value: "0", icon: Building2 },
    {
      label: "MRR Global (SaaS)",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(globalMrr),
      icon: DollarSign,
    },
    { label: "Usuários Ativos (MAU)", value: "0", icon: Users },
    { label: "Storage System", value: "0 GB", icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      {/* Global SaaS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricItems.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Evolução de MRR Global
            </h3>
          </div>
          {revenueData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[250px]">
              <Inbox className="w-8 h-8 text-slate-500" />
              <span className="text-sm text-slate-500">Sem histórico financeiro</span>
            </div>
          ) : (
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(v) => `R$${v / 1000}k`} />
                  <CartesianGrid vertical={false} stroke="#1e293b" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mrr" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 flex flex-col" style={{ height: "calc(50% - 12px)" }}>
            <h4 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Distribuição de Planos
            </h4>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[140px]">
              <PieChartIcon className="w-8 h-8 text-slate-500" />
              <span className="text-sm text-slate-500">Nenhum plano ativo</span>
            </div>
          </Card>

          <Card className="p-5" style={{ height: "calc(50% - 12px)" }}>
            <h4 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Instâncias Core
            </h4>
            <div className="space-y-3">
              {[
                { label: "API Gateway", load: "0%", status: "Idle" },
                { label: "PostgreSQL Master", load: "0%", status: "Idle" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">Load: {item.load}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" /> Tenants Recentes
          </h3>
        </div>
        <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Building2 className="w-8 h-8 text-slate-500" />
          <span className="text-sm text-slate-500">Base de Tenants em construção</span>
        </div>
      </Card>
    </div>
  );
}
