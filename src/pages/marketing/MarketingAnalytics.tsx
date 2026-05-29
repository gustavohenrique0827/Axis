import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { BarChart2, TrendingUp, Users, Target, Activity, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const performanceData = [
  { name: 'Jan', cac: 150, ltv: 1200, roi: 800, revenue: 45000 },
  { name: 'Fev', cac: 140, ltv: 1300, roi: 928, revenue: 52000 },
  { name: 'Mar', cac: 130, ltv: 1400, roi: 1076, revenue: 68000 },
  { name: 'Abr', cac: 145, ltv: 1350, roi: 931, revenue: 61000 },
  { name: 'Mai', cac: 120, ltv: 1500, roi: 1250, revenue: 75000 },
  { name: 'Jun', cac: 115, ltv: 1600, roi: 1391, revenue: 89000 },
];

const sourceData = [
  { name: 'Meta Ads', value: 400, revenue: 125000, color: '#3b82f6' },
  { name: 'Google Ads', value: 300, revenue: 98000, color: '#f43f5e' },
  { name: 'Orgânico', value: 200, revenue: 45000, color: '#10b981' },
  { name: 'Email', value: 100, revenue: 32000, color: '#8b5cf6' },
];

export default function MarketingAnalytics() {
  return (
    <PageContainer
      title="Métricas de Marketing Avançadas"
      subtitle="Analise CAC, LTV, ROI e performance geral dos seus canais."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+4.2%</span>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Receita Mkt</h4>
          <p className="text-3xl font-black text-white">R$ 300<span className="text-sm text-slate-500">k</span></p>
        </Card>
        
        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
               <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12.5%</span>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Custo Aquisição (CAC)</h4>
          <p className="text-3xl font-black text-white">R$ 115<span className="text-sm text-slate-500">,00</span></p>
        </Card>

        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <Target className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Valor Médio Deal</h4>
          <p className="text-3xl font-black text-white">R$ 2.450</p>
        </Card>

        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
               <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Retorno (ROI)</h4>
          <p className="text-3xl font-black text-white">12,5<span className="text-sm text-slate-500">x</span></p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-[#111827] border-white/5 lg:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" /> Receita Marketing vs Investimento (CAC)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
                <Area type="monotone" dataKey="cac" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCac)" name="CAC" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-[#111827] border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Receita p/ Canais
          </h3>
          <div className="h-72 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {sourceData.map(source => (
                <div key={source.name} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }}></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{source.name}</span>
                  </div>
                  <span className="text-xs font-black text-white ml-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(source.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
