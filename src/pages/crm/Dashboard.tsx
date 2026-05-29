import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area, AreaChart
} from 'recharts';
import { Card } from "../../components/ui/card";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { TrendingUp, Users, DollarSign, Target, Brain, Award, FileText, Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const { leads, robotStatus } = useData();

  const performanceData = useMemo(() => {
    // Grouping by month (mocking conversion rate for simplicity based on provided data)
    // In a real scenario, we'd have historical data. 
    // Here we'll generate data based on current state of leads.
    
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai"];
    return months.map((month, idx) => {
      // Simulate historical growth
      const avgScore = 60 + (idx * 5) + (Math.random() * 10);
      const conversionRate = (avgScore * 0.4) + (Math.random() * 5);
      
      return {
        month,
        avgScore: parseFloat(avgScore.toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        leads: 10 + (idx * 15)
      };
    });
  }, [leads]);

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const avgScore = leads.reduce((acc, l) => acc + (l.scoreIA || 0), 0) / (totalLeads || 1);
    const totalValue = leads.reduce((acc, l) => {
       const val = parseFloat((l.value || "").replace(/[^\d]/g, "")) || 0;
       return acc + val;
    }, 0);
    const wonLeads = leads.filter(l => l.status === "Fechado").length;
    const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return [
      { label: "Leads Totais", value: totalLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "Score IA Médio", value: `${avgScore.toFixed(1)}%`, icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
      { label: "Pipeline Total", value: `R$ ${(totalValue/1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { label: "Taxa de Conversão", value: `${winRate.toFixed(1)}%`, icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" },
    ];
  }, [leads]);

  return (
    <PageContainer 
      title="Dashboard de Performance" 
      description="Análise inteligente da correlação entre pré-qualificação IA e conversão comercial."
    >
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl backdrop-blur-xl">
        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-blue-600/20 rounded-2xl overflow-hidden border border-blue-500/30 p-2">
          <img src="/avatar-ia.png" alt="SDR IA Mascot" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-tight flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            Centro de Comando MIA-6
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/30 animate-pulse">
              ● SISTEMA ONLINE
            </span>
            <span className={`px-2 py-0.5 ${robotStatus === 'executando' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} text-[10px] font-black rounded-full border`}>
              ● ROBÔ: {robotStatus.toUpperCase()}
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Olá! Sou a sua IA de performance comercial. Estou monitorando todas as etapas do funil SDR e Comercial para otimizar suas conversões baseadas em comportamento preditivo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Correlação: Score IA vs Conversão
             </h3>
             <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Score IA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Conversão %</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    toast.promise(new Promise(res => setTimeout(res, 1500)), {
                      loading: 'Gerando relatório PDF...',
                      success: 'Insights exportados com sucesso!',
                      error: 'Falha ao exportar insights.',
                    });
                  }}
                  className="bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 h-8 gap-2 text-[10px] font-bold uppercase"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar Insights</span>
                </Button>
             </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="conversionRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-6 text-[11px] text-slate-500 italic text-center">
            A análise indica que a cada 10 pontos de Score IA, a probabilidade de fechamento aumenta em média 4%.
          </p>
        </Card>

        <Card className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
           <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-8">
              <Target className="w-4 h-4 text-purple-400" /> Volume de Leads Prospectados
           </h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex gap-2">
             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Crescimento WoW</p>
                <p className="text-lg font-black text-emerald-400">+12%</p>
             </div>
             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">CAC Médio</p>
                <p className="text-lg font-black text-blue-400">R$ 142</p>
             </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
