import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line, PieChart, Pie,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Users, DollarSign, Activity, TrendingUp,
  ArrowUpRight, ArrowDownRight, Target, Zap,
  TrendingDown, ShieldAlert,
  History, AlertCircle,
  Trophy, Star, Sparkles,
  Calendar, RotateCcw, Sun,
  LayoutDashboard, Magnet, HeartHandshake, Eye,
  BarChart3, RefreshCw, Layers, Gauge,
  Briefcase, MessageSquare, Info, Filter,
  Megaphone, Globe, MousePointer2, Share2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";

const performanceData = [
  { name: 'Jan', vendas: 4000, leads: 2400, retention: 95 },
  { name: 'Fev', vendas: 3000, leads: 1398, retention: 94 },
  { name: 'Mar', vendas: 2000, leads: 9800, retention: 96 },
  { name: 'Abr', vendas: 2780, leads: 3908, retention: 92 },
  { name: 'Mai', vendas: 1890, leads: 4800, retention: 93 },
  { name: 'Jun', vendas: 2390, leads: 3800, retention: 95 },
  { name: 'Jul', vendas: 3490, leads: 4300, retention: 97 },
];

export default function Dashboard() {
  const { leads, contracts, squads } = useData();
  const { isModuleEnabled, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'executivo' | 'comercial' | 'sucesso' | 'marketing'>('executivo');
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'year'>('month');

  // Goal Alerts
  const goalAlerts = useMemo(() => {
    return squads.filter(sq => (sq.faturamentoAlcancado / sq.meta) >= 0.9);
  }, [squads]);
  
  // Stats Calculations
  const totalRevenue = useMemo(() => contracts.reduce((acc, curr) => {
    try {
      const val = parseFloat(curr.mrr.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
      return acc + (isNaN(val) ? 0 : val);
    } catch(e) { return acc; }
  }, 0), [contracts]);
  
  const closedWonLeads = leads.filter(l => l.status === 'Fechado').length;
  const conversionRate = leads.length > 0 ? ((closedWonLeads / leads.length) * 100).toFixed(1) : "0";
  
  const stats = useMemo(() => {
    const niche = user?.tenantNiche || "Master";
    
    if (niche === "Tecnologia") {
      return [
        { label: "Hardware & Upgrades", value: "R$ 78.400", trend: "+15.2%", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: DollarSign, forecast: "R$ 90.0k" },
        { label: "Aparelhos Trade-In", value: "48 Unid.", trend: "+12.1%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Users, forecast: "60" },
        { label: "Ativação SDR", value: "91.5%", trend: "+3.2%", color: "text-purple-400", bg: "bg-purple-500/10", icon: Target, forecast: "94.0%" },
        { label: "Foco Conversão", value: "85.8%", trend: "-1.5%", color: "text-rose-400", bg: "bg-rose-500/10", icon: TrendingDown, forecast: "88.0%" },
      ];
    } else if (niche === "Solar") {
      return [
        { label: "Potência Total", value: "180 kWp", trend: "+24.5%", color: "text-amber-400", bg: "bg-amber-500/10", icon: Sun, forecast: "240 kWp" },
        { label: "Projetos em Homologação", value: "5 Ativos", trend: "+15.2%", color: "text-amber-500", bg: "bg-amber-500/10", icon: Users, forecast: "8" },
        { label: "Viabilidade Concluída", value: "11 Estudos", trend: "+8.9%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Target, forecast: "15" },
        { label: "ROI Médio Projetos", value: "3.2 Anos", trend: "-0.8%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "2.8 Anos" },
      ];
    } else if (niche === "Clínica") {
      return [
        { label: "Faturamento Clínico", value: "R$ 34.800", trend: "+10.4%", color: "text-rose-400", bg: "bg-rose-500/10", icon: DollarSign, forecast: "R$ 45.0k" },
        { label: "Consultas Agendadas", value: "14 Sessões", trend: "+18.2%", color: "text-pink-400", bg: "bg-pink-500/10", icon: Users, forecast: "20" },
        { label: "Tele consultas Ativas", value: "3 Salas", trend: "+50.0%", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Target, forecast: "5 Salas" },
        { label: "Taxa Churn Pacientes", value: "1.8%", trend: "-0.5%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "1.2%" },
      ];
    } else if (niche === "Imobiliária") {
      return [
        { label: "VGV Estimado", value: "R$ 7.8M", trend: "+30.1%", color: "text-blue-500", bg: "bg-blue-500/10", icon: DollarSign, forecast: "R$ 10.0M" },
        { label: "Visitas Incorporador", value: "6 Visitas", trend: "+12.0%", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: Users, forecast: "10" },
        { label: "Crédito Pré-Aprovado", value: "88.2%", trend: "+5.1%", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Target, forecast: "92%" },
        { label: "Tempo de Campanha", value: "14 Dias", trend: "-4.2%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "10 Dias" },
      ];
    }
    
    // Default fallback
    return [
      { label: "Receita (MRR)", value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, trend: "+12.5%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: DollarSign, forecast: "R$ 6.8k" },
      { label: "Leads Ativos", value: leads.length.toString(), trend: "+5.2%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Users, forecast: "12" },
      { label: "Conversão", value: `${conversionRate}%`, trend: "+2.4%", color: "text-purple-400", bg: "bg-purple-500/10", icon: Target, forecast: "24.5%" },
      { label: "Churn Rate", value: "3.2%", trend: "-0.4%", color: "text-rose-400", bg: "bg-rose-500/10", icon: TrendingDown, forecast: "2.9%" },
    ];
  }, [user, totalRevenue, leads, conversionRate]);

  const salesRanking = [
    { name: "Carlos Eduardo", value: 145000, rate: 92, avatar: "🥇", trend: "+12%", ticket: "R$ 12.5k", deals: 12, badge: "Master Closer" },
    { name: "Ana Silva", value: 112000, rate: 85, avatar: "🥈", trend: "+8%", ticket: "R$ 10.2k", deals: 11, badge: "Efficiency Star" },
    { name: "Roberto Ramos", value: 94000, rate: 78, avatar: "🥉", trend: "+5%", ticket: "R$ 8.5k", deals: 11, badge: "Rising Talent" },
  ];

  return (
    <PageContainer 
      title="Inteligência Axis" 
      description="Painel de comando estratégico para decisões baseadas em dados."
      actions={
        <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1 w-fit gap-1 shadow-2xl backdrop-blur-xl">
           {[ 
             { id: 'executivo', label: 'Estratégico', icon: Gauge },
             { id: 'comercial', label: 'Comercial', icon: Zap },
             { id: 'marketing', label: 'Marketing', icon: Megaphone },
             { id: 'sucesso', label: 'Retenção', icon: HeartHandshake }
           ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
           ))}
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Goal Alerts Banner */}
        <AnimatePresence>
          {goalAlerts.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Performace de Elite Detectada</h4>
                    <p className="text-xs text-emerald-400/80 font-medium">
                      {goalAlerts.map(sq => `${sq.nome}`).join(", ")} {goalAlerts.length > 1 ? 'atingiram' : 'atingiu'} 90%+ da meta mensal!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    Meta Próxima
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key="stats-grid"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-[#1E293B]/40 to-[#0F172A]/80 border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                      <div className={`p-3 rounded-2xl ${stat.bg} shadow-inner`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-end gap-0.5 bg-white/5 px-2 py-1 rounded-full border border-white/5`}>
                          {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 relative z-10">
                      <h2 className="text-3xl font-black text-white font-mono tracking-tighter">{stat.value}</h2>
                      <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                          <span className="text-[9px] text-slate-400 font-medium">Proj: {stat.forecast}</span>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 rotate-12 group-hover:rotate-0">
                        <stat.icon className="w-32 h-32 text-white" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'executivo' && (
            <motion.div 
              key="executivo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* ... executivo content ... */}

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                     <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                          <BarChart3 className="w-5 h-5 text-blue-400" /> Fluxo de Performance
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Correlação entre volume de leads prospectados e faturamento recorrente.</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                          {['MRR', 'Retention'].map(type => (
                            <button 
                              key={type}
                              onClick={() => setComparisonPeriod(type === 'MRR' ? 'month' : 'year')}
                              className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${comparisonPeriod === (type === 'MRR' ? 'month' : 'year') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-500'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <Button variant="outline" className="h-10 border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
                           <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                        </Button>
                     </div>
                  </div>
                  <div className="h-[380px] -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} strokeLinecap="round" />
                        <Area type="monotone" dataKey="leads" stroke="#22d3ee" fillOpacity={0} strokeWidth={3} strokeDasharray="6 6" name="Projeção IA" />
                        <Line type="stepAfter" dataKey="retention" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Health Index" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute top-8 right-8 flex items-center gap-3">
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest text-shadow-glow">Actual</span>
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-50" />
                        <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Forecast</span>
                     </div>
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" /> Goal Meter
                      </h3>
                      <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center py-6">
                       <div className="relative w-48 h-48 mb-8">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
                             <motion.circle 
                               cx="50" cy="50" r="45" 
                               fill="none" stroke="#10b981" strokeWidth="8" 
                               strokeDasharray="282.7" 
                               initial={{ strokeDashoffset: 282.7 }}
                               animate={{ strokeDashoffset: 282.7 * (1 - 0.72) }}
                               transition={{ duration: 2, ease: "easeOut" }}
                               strokeLinecap="round"
                               transform="rotate(-90 50 50)"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-4xl font-black text-white font-mono">72%</span>
                             <span className="text-[10px] text-slate-500 font-black uppercase">Batido</span>
                          </div>
                       </div>
                       <div className="w-full space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Realizado</span>
                             </div>
                             <span className="text-xs font-black text-white">R$ 4.5k</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Target</span>
                             </div>
                             <span className="text-xs font-black text-slate-500">R$ 6.2k</span>
                          </div>
                       </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                 <Card className="p-6 bg-[#111827]/80 border-white/5 flex flex-col">
                    <h3 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" /> Smart Insights
                    </h3>
                    <div className="space-y-6">
                       <div className="group cursor-help">
                          <p className="text-xs font-bold text-white mb-2 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                            <Zap className="w-3 h-3 text-amber-400" /> Velocidade de Vendas
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">Seu ciclo médio caiu 14% este mês. Recomendamos duplicar investimento em AdWords.</p>
                       </div>
                       <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                          <p className="text-[11px] font-black text-emerald-400 mb-1 uppercase tracking-widest">Oportunidade</p>
                          <p className="text-[10px] text-slate-400">Há 42 leads 'Mornos' com score &gt; 80 aguardando followup.</p>
                       </div>
                    </div>
                 </Card>

                 <Card className="lg:col-span-3 p-8 bg-[#111827]/80 border-white/5">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-purple-400" /> Snapshot Financeiro
                       </h3>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-black uppercase">Net Revenue Retention</span>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">106.4%</span>
                       </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                       {[
                         { label: "Churn MRR", value: "R$ 420,00", desc: "Média móvel 3 meses", color: "text-rose-400" },
                         { label: "Expansion MRR", value: "R$ 1.840,00", desc: "Up-selling & Cross-selling", color: "text-emerald-400" },
                         { label: "LTV (Média)", value: "R$ 14.200,00", desc: "Lifetime Value estimado", color: "text-blue-400" },
                       ].map((item, i) => (
                         <div key={i} className="space-y-2 border-r border-white/5 last:border-0 pr-8 last:pr-0">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</p>
                            <h4 className={`text-xl font-black ${item.color} font-mono tracking-tighter`}>{item.value}</h4>
                            <p className="text-[9px] text-slate-600 font-medium">{item.desc}</p>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'comercial' && (
            <motion.div 
              key="comercial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-10 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/80 to-[#111827] border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-12">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-amber-500" /> Hall da Fama
                      </h3>
                      <div className="flex gap-2">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">Q2 2026</span>
                      </div>
                  </div>

                  <div className="flex items-end justify-center gap-6 mb-12 h-56">
                      {/* 2nd Place */}
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "75%", opacity: 1 }} 
                        transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                        className="flex-1 max-w-[130px] flex flex-col items-center gap-4 group/p"
                      >
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-slate-700/50 border border-slate-400/50 backdrop-blur-xl flex items-center justify-center text-2xl shadow-2xl group-hover/p:-translate-y-1 transition-transform">🥈</div>
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-400 text-slate-900 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">2º</div>
                        </div>
                        <div className="w-full h-full bg-slate-400/5 border-x border-t border-white/10 rounded-t-[2rem] p-5 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[11px] font-black text-white text-center truncate w-full mb-1">{salesRanking[1].name}</p>
                            <p className="text-xs font-black text-slate-400 font-mono">R$ 112k</p>
                        </div>
                      </motion.div>

                      {/* 1st Place */}
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "100%", opacity: 1 }} 
                        transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
                        className="flex-1 max-w-[150px] flex flex-col items-center gap-5 group/p"
                      >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/20 group-hover/p:-translate-y-2 transition-transform">🥇</div>
                            <motion.div 
                              animate={{ scale: [1, 1.1, 1] }} 
                              transition={{ duration: 4, repeat: Infinity }}
                              className="absolute -inset-3 border-2 border-dashed border-amber-500/20 rounded-3xl" 
                            />
                        </div>
                        <div className="w-full h-full bg-amber-500/10 border-x border-t border-amber-500/30 rounded-t-[2.5rem] p-6 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[13px] font-black text-white text-center truncate w-full mb-1">{salesRanking[0].name}</p>
                            <p className="text-lg font-black text-amber-400 font-mono tracking-tighter">R$ 145k</p>
                            <div className="mt-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(245,158,11,0.4)]">Master Closer</div>
                        </div>
                      </motion.div>

                      {/* 3rd Place */}
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "60%", opacity: 1 }} 
                        transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
                        className="flex-1 max-w-[110px] flex flex-col items-center gap-4 group/p"
                      >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-orange-700/50 border border-orange-700/50 backdrop-blur-xl flex items-center justify-center text-xl shadow-2xl group-hover/p:-translate-y-1 transition-transform">🥉</div>
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-700 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">3º</div>
                        </div>
                        <div className="w-full h-full bg-orange-700/5 border-x border-t border-white/10 rounded-t-[1.5rem] p-4 flex flex-col items-center justify-center shadow-inner">
                            <p className="text-[10px] font-black text-white text-center truncate w-full mb-1">{salesRanking[2].name}</p>
                            <p className="text-[11px] font-black text-orange-400 font-mono">R$ 94k</p>
                        </div>
                      </motion.div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                      {salesRanking.map((s, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xl group-hover:bg-white/10 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Conversão</p>
                              <span className="text-xs font-black text-blue-400">{s.rate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.rate}%` }}
                                transition={{ delay: 1, duration: 1.5 }}
                                className="h-full bg-blue-600 rounded-full" 
                              />
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 font-bold uppercase">Deals Fechados</span>
                              <span className="text-xs font-black text-white">{s.deals}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card className="p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden">
                    <h3 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-2">
                       <Filter className="w-4 h-4 text-emerald-400" /> Funil de Conversão
                    </h3>
                    <div className="space-y-4">
                       {[
                         { label: 'Prospecção', value: 840, drop: 0, color: 'bg-emerald-500' },
                         { label: 'Qualificação', value: 520, drop: 38, color: 'bg-emerald-400' },
                         { label: 'Apresentação', value: 210, drop: 60, color: 'bg-emerald-300' },
                         { label: 'Negociação', value: 85, drop: 59, color: 'bg-emerald-200' },
                         { label: 'Fechamento', value: 42, drop: 50, color: 'bg-emerald-100' },
                       ].map((step, i) => (
                         <div key={i} className="relative">
                            <div className="flex items-center justify-between mb-1.5 px-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{step.label}</p>
                               <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-white">{step.value}</span>
                                  {step.drop > 0 && <span className="text-[9px] font-black text-rose-500">-{step.drop}%</span>}
                               </div>
                            </div>
                            <div className="w-full h-8 bg-white/5 rounded-lg overflow-hidden relative border border-white/5">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(step.value / 840) * 100}%` }}
                                 transition={{ delay: i * 0.1, duration: 1 }}
                                 className={`h-full ${step.color} opacity-40`} 
                               />
                               <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                                  <div className="flex-1" />
                                  <div className="w-[1px] h-4 bg-white/10" />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12">
                        <MessageSquare className="w-16 h-16 text-blue-400" />
                     </div>
                     <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Dica do Especialista</h4>
                     <p className="text-[11px] text-slate-300 leading-relaxed font-medium">Sua etapa de **Negociação** está com perda acima da média regional. Revise os argumentos de ancoragem de preço.</p>
                  </Card>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-8 bg-[#111827]/80 border-white/5 lg:col-span-1">
                   <h3 className="text-xs font-black text-slate-400 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Eye className="w-4 h-4 text-purple-400" /> Radar de Atributos
                   </h3>
                   <div className="h-[280px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                         { subject: 'Velocidade', A: 120, B: 110, fullMark: 150 },
                         { subject: 'Ticket Médio', A: 98, B: 130, fullMark: 150 },
                         { subject: 'Volume', A: 86, B: 130, fullMark: 150 },
                         { subject: 'Qualidade', A: 99, B: 100, fullMark: 150 },
                         { subject: 'CRM Health', A: 85, B: 90, fullMark: 150 },
                       ]}>
                         <PolarGrid stroke="#64748b20" />
                         <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontStyle="bold" />
                         <Radar name="Time" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                         <Radar name="Top Closers" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                       </RadarChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="mt-6 flex flex-wrap justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Benchmarks Top 1%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50" />
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Média da Organização</span>
                      </div>
                   </div>
                </Card>

                <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
                   <div className="flex items-center justify-between mb-10">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Magnet className="w-4 h-4 text-emerald-400" /> Atividades Comportamentais
                     </h3>
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] text-emerald-400 font-black uppercase">Live Intelligence</span>
                        </div>
                     </div>
                   </div>
                   <div className="space-y-4">
                      {[
                        { icon: Users, title: "Prospecção Avançada", desc: "Carlos Eduardo qualificou 18 novos leads estratégicos via LinkedIn no PR.", time: "há 8m", color: "text-blue-400", bg: "bg-blue-400/10" },
                        { icon: Zap, title: "Fechamento Expresso", desc: "Ana Silva converteu 'Clinic Systems' com 0% de desconto negocial.", time: "há 45m", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                        { icon: AlertCircle, title: "Anomalia de Pipeline", desc: "MIA-6 reportou atrasos em followup no Lead 'InterFoods' (Ticket: R$ 8.5k).", time: "há 2h", color: "text-amber-400", bg: "bg-amber-400/10" },
                        { icon: Target, title: "Meta Batida Individual", desc: "Roberto Ramos atingiu 100% do target trimestral antecipadamente.", time: "há 4h", color: "text-purple-400", bg: "bg-purple-500/10" },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                           <div className={`p-3 rounded-2xl ${activity.bg} ${activity.color} shrink-0 shadow-lg`}>
                             <activity.icon className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-[13px] font-black text-white group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{activity.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{activity.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div 
              key="marketing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-10">
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                           <Globe className="w-5 h-5 text-blue-400" /> Origem de Leads (Attribution)
                         </h3>
                         <p className="text-xs text-slate-500 mt-2 font-medium">Modelagem multicanal de primeira interação e conversão final.</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 italic">MIA Dynamic Attribution</span>
                      </div>
                   </div>
                   <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={[
                           { name: 'Google Ads', direct: 420, organic: 120, social: 45 },
                           { name: 'Organic Search', direct: 180, organic: 290, social: 30 },
                           { name: 'Social Media', direct: 95, organic: 80, social: 310 },
                           { name: 'Referral', direct: 60, organic: 45, social: 25 },
                           { name: 'Direct', direct: 210, organic: 30, social: 15 },
                         ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              cursor={{fill: '#ffffff05'}}
                              contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                              itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="direct" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="organic" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="social" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-[9px] text-slate-500 font-black uppercase mb-1">CPL Médio</p>
                         <p className="text-lg font-black text-white font-mono tracking-tighter">R$ 14,80 <span className="text-[10px] text-emerald-400 font-bold ml-1">-12%</span></p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-[9px] text-slate-500 font-black uppercase mb-1">ROAS Global</p>
                         <p className="text-lg font-black text-white font-mono tracking-tighter">4.2x <span className="text-[10px] text-emerald-400 font-bold ml-1">+0.5</span></p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                         <p className="text-[9px] text-slate-500 font-black uppercase mb-1">CAC Payback</p>
                         <p className="text-lg font-black text-white font-mono tracking-tighter">4.5 Meses</p>
                      </div>
                   </div>
                </Card>

                <div className="space-y-6">
                   <Card className="p-8 bg-[#111827]/80 border-white/5">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-purple-400" /> Share of Voice
                      </h4>
                      <div className="h-[200px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie
                                 data={[
                                   { name: 'Sua Marca', value: 45, fill: '#3b82f6' },
                                   { name: 'Concorrente A', value: 25, fill: '#64748b' },
                                   { name: 'Concorrente B', value: 20, fill: '#334155' },
                                   { name: 'Outros', value: 10, fill: '#1e293b' },
                                 ]}
                                 cx="50%" cy="50%"
                                 innerRadius={60}
                                 outerRadius={80}
                                 paddingAngle={5}
                                 dataKey="value"
                               >
                               </Pie>
                               <Tooltip />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 mt-6">
                         {[
                           { label: 'Sua Marca', value: '45%', color: 'bg-blue-500' },
                           { label: 'Market Avg', value: '22%', color: 'bg-slate-500' },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</span>
                              </div>
                              <span className="text-xs font-black text-white">{item.value}</span>
                           </div>
                         ))}
                      </div>
                   </Card>

                   <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                         <Sparkles className="w-16 h-16 text-white" />
                      </div>
                      <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Insight de Campanha</h5>
                      <p className="text-[11px] text-slate-200 leading-relaxed font-medium">Seus anúncios fixos em 'Gestão Financeira' estão saturando. Recomendamos rotacionar criativos para evitar blindness.</p>
                   </Card>
                </div>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                 {[
                   { icon: MousePointer2, label: "CTR Médio", value: "3.24%", trend: "+0.4%", color: "text-blue-400", bg: "bg-blue-500/10" },
                   { icon: Layers, label: "LPs Conversion", value: "18.5%", trend: "-1.2%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                   { icon: Users, label: "Marketing Leads", value: "1,240", trend: "+15%", color: "text-purple-400", bg: "bg-purple-500/10" },
                   { icon: DollarSign, label: "Total Investido", value: "R$ 18.5k", trend: "0%", color: "text-amber-400", bg: "bg-amber-500/10" },
                 ].map((metric, i) => (
                    <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 group hover:border-white/10 transition-all">
                       <div className="flex items-center gap-4 mb-4">
                          <div className={`p-2.5 rounded-xl ${metric.bg} ${metric.color}`}>
                             <metric.icon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{metric.label}</p>
                       </div>
                       <div className="flex items-end justify-between">
                          <h4 className="text-2xl font-black text-white font-mono tracking-tighter">{metric.value}</h4>
                          <span className={`text-[10px] font-bold ${metric.trend.startsWith('+') ? 'text-emerald-400' : metric.trend === '0%' ? 'text-slate-500' : 'text-rose-400'}`}>
                             {metric.trend}
                          </span>
                       </div>
                    </Card>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'sucesso' && (
            <motion.div 
               key="sucesso"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid lg:grid-cols-3 gap-6"
            >
               <Card className="p-8 bg-gradient-to-br from-rose-950/20 to-black/40 border-rose-500/10 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-500/20 text-rose-500 rounded-2xl shadow-lg shadow-rose-900/20"><AlertCircle className="w-5 h-5" /></div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Alerta de Churn IA</h4>
                    </div>
                    <div className="px-2 py-1 bg-rose-500/20 rounded-lg flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                       <span className="text-[9px] text-rose-400 font-black uppercase">Crítico</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                     {[
                       { name: 'Clínica Vida', risk: 88, mrr: 'R$ 550', reason: 'Engajamento -40%', date: '21 Mai' },
                       { name: 'InterFoods S.A.', risk: 74, mrr: 'R$ 8.9k', reason: 'Faturas Vencidas (3)', date: '18 Mai' },
                       { name: 'Construtora RS', risk: 61, mrr: 'R$ 1.2k', reason: 'SLA Técnico Crítico', date: 'Vencendo hoje' },
                     ].map((c, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-black text-white">{c.name}</span>
                              <span className="text-[10px] font-black text-rose-500 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">{c.risk}% Risco</span>
                           </div>
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-slate-500">
                                 <Info className="w-3 h-3" />
                                 <p className="text-[10px] italic font-medium truncate w-32">{c.reason}</p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-black">{c.mrr}</span>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${c.risk}%` }}
                                transition={{ delay: i * 0.2, duration: 1 }}
                                className="h-full bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" 
                              />
                           </div>
                           <div className="mt-2 flex justify-end">
                              <span className="text-[8px] text-slate-600 font-black uppercase">{c.date}</span>
                           </div>
                        </div>
                     ))}
                  </div>
                  <Button className="w-full mt-8 bg-rose-600/30 text-rose-400 border border-rose-500/30 text-[10px] font-black h-12 rounded-2xl hover:bg-rose-600/40 transition-all uppercase tracking-[0.2em] gap-3">
                     <ShieldAlert className="w-4 h-4" /> Abrir Protocolo CS
                  </Button>
               </Card>

               <Card className="lg:col-span-2 p-10 bg-[#111827]/80 border-white/5 space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                          <HeartHandshake className="w-5 h-5 text-emerald-400" /> Saúde & Retenção Global
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Evolution health score over active customer base.</p>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sentimento Geral</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="flex -space-x-1">
                                {[1,2,3,4].map(s => <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />)}
                                <Star className="w-3 h-3 text-slate-700" />
                             </div>
                             <span className="text-xs font-black text-amber-500">4.2/5</span>
                          </div>
                       </div>
                       <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl gap-1">
                        {['Day', 'Week', 'Month'].map(p => (
                          <button key={p} className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${p === 'Week' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-transparent text-slate-500 hover:text-white'}`}>
                            {p}
                          </button>
                        ))}
                       </div>
                    </div>
                  </div>
                  <div className="h-[280px] -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                         { name: 'Sem 1', health: 85, retention: 94 },
                         { name: 'Sem 2', health: 82, retention: 93 },
                         { name: 'Sem 3', health: 88, retention: 95 },
                         { name: 'Sem 4', health: 91, retention: 97 },
                       ]}>
                          <defs>
                            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Area type="step" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={4} />
                          <Line type="basis" dataKey="retention" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                       </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-emerald-400 transition-colors">Net Retention</span>
                        <div className="flex items-end gap-3">
                          <span className="text-3xl font-black text-white font-mono tracking-tighter">104%</span>
                          <div className="flex items-center gap-0.5 text-emerald-400 font-black mb-1.5">
                             <ArrowUpRight className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-mono">+4.2%</span>
                          </div>
                        </div>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-emerald-400 transition-colors">Avg Health Score</span>
                        <div className="flex items-end gap-3 text-emerald-400">
                          <span className="text-3xl font-black font-mono tracking-tighter">88.5</span>
                          <Sparkles className="w-5 h-5 mb-2.5 opacity-50" />
                        </div>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-emerald-400 transition-colors">Digital Engagement</span>
                        <div className="flex items-end gap-3 text-purple-400">
                          <span className="text-3xl font-black font-mono tracking-tighter">76%</span>
                          <Activity className="w-5 h-5 mb-2.5 opacity-50" />
                        </div>
                     </div>
                  </div>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageContainer>
  );
}
