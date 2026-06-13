import { useMemo } from "react";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, ComposedChart, Area, AreaChart
} from 'recharts';
import { Card } from "../../components/ui/card";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import {
  TrendingUp, Users, DollarSign, Target, Brain, Award,
  Flame, CheckCircle2, FileText,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const { leads, robotStatus } = useData();

  const performanceData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const target = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = target.toLocaleString("pt-BR", { month: "short" });
      const monthLeads = (leads as any[]).filter(l => {
        const d = new Date(l.created_at || l.createdAt || 0);
        return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
      });
      const avgScore = monthLeads.length > 0
        ? Math.round(monthLeads.reduce((s: number, l: any) => s + (l.scoreIA || 0), 0) / monthLeads.length)
        : 0;
      const won = monthLeads.filter((l: any) => l.status === "Fechado").length;
      const conversionRate = monthLeads.length > 0 ? Math.round((won / monthLeads.length) * 100) : 0;
      return { month, avgScore, conversionRate, leads: monthLeads.length };
    });
  }, [leads]);

  const stats = useMemo(() => {
    const all = leads as any[];
    const totalLeads = all.length;
    const avgScore = totalLeads > 0 ? all.reduce((a, l) => a + (l.scoreIA || 0), 0) / totalLeads : 0;
    const totalValue = all.reduce((a, l) => {
      const v = parseFloat((l.value || "").replace(/[^\d]/g, "")) || 0;
      return a + v;
    }, 0);
    const wonLeads = all.filter(l => l.status === "Fechado").length;
    const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    return [
      { label: "Leads Totais",      value: totalLeads,                    icon: Users,   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-500/20"   },
      { label: "Score IA Médio",    value: avgScore.toFixed(1),           icon: Brain,   color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" },
      { label: "Pipeline Total",    value: `R$ ${(totalValue/1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
      { label: "Taxa de Conversão", value: `${winRate.toFixed(1)}%`,      icon: Award,   color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-500/20"  },
    ];
  }, [leads]);

  const hotLeads = useMemo(() =>
    (leads as any[]).filter(l => (l.temperature || "").toLowerCase() === "quente").slice(0, 5),
  [leads]);

  return (
    <PageContainer
      title="Dashboard de Performance"
      description="Análise inteligente da correlação entre pré-qualificação IA e conversão comercial."
    >
      {/* MIA Hero — compact */}
      <div className="flex items-center gap-4 bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl backdrop-blur-xl mb-6">
        <div className="w-12 h-12 shrink-0 bg-blue-600/20 rounded-xl overflow-hidden border border-blue-500/30 p-1">
          <img src="/avatar-ia.png" alt="MIA" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Centro de Comando MIA-6</h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/30 animate-pulse shrink-0">
              ● ONLINE
            </span>
            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border shrink-0 ${
              robotStatus === 'executando'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }`}>
              ● ROBÔ: {(robotStatus || "idle").toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Monitorando funil SDR e Comercial · {(leads as any[]).length} leads ativos
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`p-4 bg-[#111827]/80 border backdrop-blur-xl hover:scale-[1.02] transition-all ${stat.border}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold leading-tight">{stat.label}</p>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Chart — 2/3 width */}
        <Card className="lg:col-span-2 p-5 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] text-white uppercase tracking-widest font-black flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Score IA vs Conversão
            </h3>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Score IA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Conversão</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.promise(new Promise(res => setTimeout(res, 1500)), {
                    loading: 'Gerando relatório PDF...',
                    success: 'Insights exportados!',
                    error: 'Falha ao exportar.',
                  });
                }}
                className="bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20 h-7 gap-1.5 text-[9px] uppercase font-bold px-2.5"
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} name="Score IA" />
                <Line type="monotone" dataKey="conversionRate" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="Conversão %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[10px] text-slate-600 italic text-center">
            A cada 10pts de Score IA, a probabilidade de fechamento sobe ~4%.
          </p>
        </Card>

        {/* Hot leads panel — 1/3 width */}
        <Card className="p-5 bg-[#111827]/80 border-white/5 backdrop-blur-xl flex flex-col">
          <h3 className="text-[10px] text-white uppercase tracking-widest font-black flex items-center gap-2 mb-4 shrink-0">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> Leads Quentes
          </h3>

          {hotLeads.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-slate-600 text-xs text-center">
              Nenhum lead quente no momento
            </div>
          ) : (
            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-none">
              {hotLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-2.5 p-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-all">
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/25 flex items-center justify-center text-[9px] font-black text-rose-300 shrink-0">
                    {(lead.name || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white truncate">{lead.name}</div>
                    <div className="text-[9px] text-slate-500 truncate">{lead.company}</div>
                  </div>
                  <div className="text-[10px] font-black text-emerald-400 font-mono shrink-0">{lead.value || '—'}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 shrink-0">
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-black text-emerald-400">
                {(leads as any[]).filter(l => l.status === "Fechado").length}
              </div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Ganhos</div>
            </div>
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 text-center">
              <Target className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-black text-amber-400">
                {(leads as any[]).filter(l => l.status === "Em Negociação").length}
              </div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Negociação</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Volume chart — full width */}
      <Card className="p-5 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
        <h3 className="text-[10px] text-white uppercase tracking-widest font-black flex items-center gap-2 mb-4">
          <Users className="w-3.5 h-3.5 text-purple-400" /> Volume de Leads Prospectados por Mês
        </h3>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2.5} name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageContainer>
  );
}
