import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { 
  Zap, Brain, Sparkles, TrendingUp, 
  Target, AlertTriangle, Play, Settings,
  Database, Cpu, Network, ShieldCheck,
  ChevronRight, ArrowUpRight, BarChart3,
  Lightbulb, RefreshCw, Layers, Eye
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";

const simulationData = [
  { name: 'Atual', mrr: 12500, cac: 450, ltv: 3200 },
  { name: 'Cenário A', mrr: 15800, cac: 420, ltv: 3400 },
  { name: 'Cenário B', mrr: 18200, cac: 480, ltv: 3100 },
  { name: 'Otimizado IA', mrr: 21500, cac: 380, ltv: 4200 },
];

export default function PerformanceIA() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('Atual');

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <PageContainer 
      title="Cérebro Performance IA" 
      description="Simulações avançadas e auditoria preditiva baseada em redes neurais."
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* AI Engine Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                 <Cpu className="w-16 h-16 text-blue-400" />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Engine v4.2</span>
                 </div>
                 <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">Processamento Ativo</h3>
                 <p className="text-xs text-slate-400 leading-relaxed font-medium">Analizando 4.2M de pontos de dados em tempo real para identificação de gargalos de conversão.</p>
              </div>
           </Card>

           <Card className="p-8 bg-[#111827]/80 border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Health Score IA</h4>
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="py-6 flex items-end gap-3 text-white">
                 <span className="text-5xl font-black font-mono tracking-tighter">94</span>
                 <span className="text-sm font-bold text-slate-500 mb-2">/100</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "94%" }}
                   className="h-full bg-emerald-500" 
                 />
              </div>
           </Card>

           <Card className="p-8 bg-amber-500/10 border-amber-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Anomalias Detectadas</h4>
                 <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="py-6 flex items-end gap-3 text-white">
                 <span className="text-5xl font-black font-mono tracking-tighter">02</span>
                 <ArrowUpRight className="w-6 h-6 text-rose-500 mb-2" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic tracking-tight">Queda inesperada na velocidade de prospecção regional (São Paulo).</p>
           </Card>
        </div>

        {/* What-If Simulator */}
        <div className="grid lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <Play className="w-5 h-5 text-purple-400" /> Simulador 'What-If'
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Modele o crescimento alterando variáveis críticas de aquisição.</p>
                 </div>
                 <Button 
                   onClick={runSimulation}
                   disabled={isSimulating}
                   className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 h-12 text-xs font-black uppercase tracking-widest gap-2"
                 >
                   {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                   {isSimulating ? 'Simulando...' : 'Executar Simulação'}
                 </Button>
              </div>

              <div className="h-[340px] -mx-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={simulationData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                       <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                       <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                         itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                       />
                       <Bar dataKey="mrr" fill="#312e81" radius={[8, 8, 0, 0]} barSize={40} />
                       <Line type="monotone" dataKey="ltv" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                       <Area type="monotone" dataKey="cac" fill="#10b981" stroke="#10b981" fillOpacity={0.1} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 grid md:grid-cols-4 gap-4">
                 {['Investimento em Ads', 'Taxa de Conversão', 'Churn Estimado', 'Ticket Médio'].map(label => (
                    <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                       <p className="text-[9px] text-slate-500 font-black uppercase mb-3">{label}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">+15%</span>
                          <div className="h-1 flex-1 mx-3 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-2/3" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <div className="space-y-6">
              <Card className="p-8 bg-[#111827]/80 border-white/5 h-full flex flex-col">
                 <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                   <Lightbulb className="w-4 h-4 text-amber-500" /> Recomendações MIA
                 </h4>
                 <div className="flex-1 space-y-6">
                    {[
                      { 
                        title: "Ancoragem de Preço", 
                        desc: "Seu cenário 'Optimizado' sugere um aumento de 12% no ticket médio sem impactar o churn.", 
                        impact: "R$ +2.4k MRR",
                        color: "text-blue-400"
                      },
                      { 
                        title: "Realocação de Verba", 
                        desc: "Mover 20% do orçamento de LinkedIn para Instagram Ads pode reduzir o CPL em 18%.", 
                        impact: "ROI +14%",
                        color: "text-emerald-400"
                      },
                      { 
                        title: "Followup Preditivo", 
                        desc: "Focar em leads com score > 85 nas primeiras 2h aumenta a conversão em 3x.", 
                        impact: "Conv. +28%",
                        color: "text-purple-400"
                      },
                    ].map((rec, i) => (
                       <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all">
                          <div className="flex items-center justify-between mb-3">
                             <h5 className="text-[13px] font-black text-white">{rec.title}</h5>
                             <span className={`text-[10px] font-black ${rec.color} bg-white/5 px-2 py-0.5 rounded-full`}>{rec.impact}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{rec.desc}</p>
                       </div>
                    ))}
                 </div>
                 <Button variant="outline" className="w-full mt-8 border-white/5 text-[10px] font-black uppercase tracking-[0.2em] h-12 rounded-2xl hover:bg-white/5">
                    Ver Auditoria Completa
                 </Button>
              </Card>
           </div>
        </div>

        {/* Deep Learning Insights */}
        <div className="grid lg:grid-cols-4 gap-6">
           <Card className="p-6 bg-[#111827]/80 border-white/5 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                 <Network className="w-5 h-5 text-indigo-400" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Correlação de Churn</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Uso de App', val: 92, status: 'Crítico' },
                   { label: 'Suporte SLA', val: 12, status: 'Normal' },
                   { label: 'Ticket Médio', val: 45, status: 'Medio' },
                 ].map((c, i) => (
                    <div key={i}>
                       <div className="flex justify-between mb-1.5 px-0.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{c.label}</span>
                          <span className="text-[9px] font-black text-white">{c.val}%</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full">
                          <div className={`h-full rounded-full ${c.val > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${c.val}%` }} />
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="lg:col-span-3 p-8 bg-gradient-to-br from-[#111827] to-[#0F172A] border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                   <Target className="w-4 h-4 text-emerald-400" /> Heatmap de Conversão Regional
                 </h4>
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Sudeste dominando 62% do volume</span>
                 </div>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                 {[
                   { region: 'Sudeste', conv: '24.5%', leads: 4200, trend: '+12%' },
                   { region: 'Sul', conv: '18.2%', leads: 2100, trend: '+5%' },
                   { region: 'Nordeste', conv: '14.1%', leads: 1800, trend: '-2%' },
                   { region: 'Centro-Oeste', conv: '21.5%', leads: 950, trend: '+8%' },
                 ].map((r, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-emerald-500/20 transition-all cursor-pointer group">
                       <p className="text-[10px] text-slate-500 font-black uppercase mb-4">{r.region}</p>
                       <div className="flex items-end justify-between mb-3">
                          <h5 className="text-2xl font-black text-white font-mono tracking-tighter">{r.conv}</h5>
                          <span className={`text-[10px] font-bold ${r.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{r.trend}</span>
                       </div>
                       <p className="text-[9px] text-slate-600 font-medium">Captação: {r.leads} leads/mês</p>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

      </div>
    </PageContainer>
  );
}
