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
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Global SaaS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-[#06B6D4]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-12 h-12 text-[#06B6D4]" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Total de Empresas</span>
          <h3 className="text-3xl font-extrabold text-white">0</h3>
        </Card>

        <Card className="p-5 border-[#2563EB]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-12 h-12 text-[#2563EB]" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-2">MRR Global (SaaS)</span>
          <h3 className="text-3xl font-extrabold text-[#2563EB]">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(globalMrr)}
          </h3>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12 text-emerald-400" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Usuários Ativos (MAU)</span>
          <h3 className="text-3xl font-extrabold text-emerald-400">0</h3>
        </Card>

        <Card className="p-5 border-purple-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <HardDrive className="w-12 h-12 text-purple-400" />
          </div>
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Storage System</span>
          <h3 className="text-3xl font-extrabold text-purple-400">0 GB</h3>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#06B6D4]" /> Evolução de MRR Global
            </h3>
          </div>
          {revenueData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4 min-h-[250px]">
              <Inbox className="w-12 h-12 text-slate-500" />
              <span className="text-xs uppercase font-black tracking-widest text-slate-500">Sem histórico financeiro</span>
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
                  <Area type="monotone" dataKey="mrr" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 bg-[#111827]/80 border-white/10 flex flex-col" style={{ height: "calc(50% - 12px)" }}>
            <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-400" /> Distribuição de Planos
            </h4>
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4 min-h-[140px]">
              <PieChartIcon className="w-10 h-10 text-slate-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nenhum plano ativo</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#111827]/80 border-white/10 overflow-hidden relative" style={{ height: "calc(50% - 12px)" }}>
            <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Instâncias Core
            </h4>
            <div className="space-y-3 relative z-10 opacity-50">
              {[
                { label: "API Gateway", load: "0%", status: "Idle" },
                { label: "PostgreSQL Master", load: "0%", status: "Idle" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white font-medium">{item.label}</p>
                    <p className="text-[10px] text-slate-500">Load: {item.load}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B1120]/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-[#06B6D4]" /> Tenants Recentes
          </h3>
        </div>
        <div className="p-10 flex flex-col items-center justify-center gap-4 opacity-40">
          <Building2 className="w-12 h-12 text-slate-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Base de Tenants em construção</span>
        </div>
      </Card>
    </div>
  );
}
