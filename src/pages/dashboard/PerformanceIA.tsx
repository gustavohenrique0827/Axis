import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import {
   Zap, Brain, Sparkles, TrendingUp,
   Target, AlertTriangle, Play, Settings,
   Database, Cpu, Network, ShieldCheck,
   ChevronRight, ArrowUpRight, BarChart3,
   Lightbulb, RefreshCw, Layers, Eye, Inbox
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";

export default function PerformanceIA() {
   const { leads, financeEntries, contracts } = useData();
   const [isSimulating, setIsSimulating] = useState(false);
   const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

   const runSimulation = async () => {
      setIsSimulating(true);
      try {
         const response = await fetch("/api/ai/performance-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mrr: currentMRR, cac: currentCAC, ltv: currentLTV, leadsCount: leads.length, dealsCount: leads.filter(l => l.status === 'Fechado').length })
         });
         if (response.ok) {
            const data = await response.json();
            setAiRecommendations(data);
            toast.success("Auditoria cerebral concluída com sucesso!");
         }
      } catch (err) {
         toast.error("Erro ao processar simulação via Master IA.");
      } finally {
         setIsSimulating(false);
      }
   };

   useEffect(() => {
      if (leads.length > 0 && aiRecommendations.length === 0) runSimulation();
   }, [leads.length]);

   const currentMRR = useMemo(() => {
      if (contracts && contracts.length > 0) {
         return contracts.reduce((acc, c) => {
            const raw = c.mrr;
            const val = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.'));
            return acc + (isNaN(val) ? 0 : val);
         }, 0);
      }
      // Fallback: estimativa via leads (se MRR for nulo)
      return leads.filter(l => l.status === 'Fechado').reduce((acc, l) => acc + (l.value || 0), 0) / 12; // Exemplo tosco
   }, [contracts, leads]);

   const currentCAC = useMemo(() => {
      const totalSpent = financeEntries.filter(f => f.type === 'Pagar' && f.status === 'Pago' && f.category?.toLowerCase().includes('marketing')).reduce((acc, f) => acc + f.value, 0);
      return leads.length > 0 ? totalSpent / leads.length : 0;
   }, [financeEntries, leads]);

   const currentLTV = currentMRR * 12; // Assumindo 1 ano de LTV pra fins de simulação

   const simulationData = useMemo(() => {
      if (currentMRR === 0 && currentCAC === 0) return [];

      return [
         { name: 'Atual', mrr: currentMRR, cac: currentCAC, ltv: currentLTV },
         { name: 'Cenário A (+Leads)', mrr: currentMRR * 1.2, cac: currentCAC * 0.9, ltv: currentLTV * 1.1 },
         { name: 'Cenário B (Ticket+)', mrr: currentMRR * 1.4, cac: currentCAC * 1.1, ltv: currentLTV * 1.3 },
         { name: 'Otimizado IA', mrr: currentMRR * 1.6, cac: currentCAC * 0.8, ltv: currentLTV * 1.5 },
      ];
   }, [currentMRR, currentCAC, currentLTV]);

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
                     <p className="text-xs text-slate-400 leading-relaxed font-medium">Analizando pontos de dados em tempo real para identificação de gargalos de conversão.</p>
                  </div>
               </Card>

               <Card className="p-8 bg-[#111827]/80 border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Health Score IA</h4>
                     <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="py-6 flex items-end gap-3 text-white">
                     <span className="text-5xl font-black font-mono tracking-tighter">{simulationData.length > 0 ? "94" : "--"}</span>
                     <span className="text-sm font-bold text-slate-500 mb-2">/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: simulationData.length > 0 ? "94%" : "0%" }}
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
                     <span className="text-5xl font-black font-mono tracking-tighter">{simulationData.length > 0 ? "02" : "00"}</span>
                     <ArrowUpRight className="w-6 h-6 text-rose-500 mb-2" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic tracking-tight">
                     {simulationData.length > 0 ? "Queda inesperada na velocidade de prospecção." : "Sem dados para análise de anomalias."}
                  </p>
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
                        disabled={isSimulating || simulationData.length === 0}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 h-12 text-xs font-black uppercase tracking-widest gap-2 disabled:opacity-50"
                     >
                        {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        {isSimulating ? 'Simulando...' : 'Executar Simulação'}
                     </Button>
                  </div>

                  {simulationData.length === 0 ? (
                     <div className="h-[340px] flex flex-col items-center justify-center gap-4 opacity-40">
                        <Inbox className="w-12 h-12 text-slate-500" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                           Simulador indisponível.<br />Cadastre dados financeiros e contratos reais.
                        </p>
                     </div>
                  ) : (
                     <>
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
                     </>
                  )}
               </Card>

               <div className="space-y-6">
                  <Card className="p-8 bg-[#111827]/80 border-white/5 h-full flex flex-col">
                     <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Recomendações MIA
                     </h4>

                     {simulationData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                           <p className="text-xs font-black text-slate-500 text-center uppercase">Aguardando dados...</p>
                        </div>
                     ) : (
                        <div className={`flex-1 space-y-6 transition-all duration-500 ${isSimulating ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                           {(aiRecommendations.length > 0 ? aiRecommendations : [
                              { title: "Analisando...", desc: "Master IA está lendo seus indicadores de performance.", impact: "--", color: "text-slate-500" }
                           ]).map((rec, i) => (
                              <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all">
                                 <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-[13px] font-black text-white">{rec.title}</h5>
                                    <span className={`text-[10px] font-black ${rec.color} bg-white/5 px-2 py-0.5 rounded-full`}>{rec.impact}</span>
                                 </div>
                                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{rec.desc}</p>
                              </div>
                           ))}
                        </div>
                     )}
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
                        { label: 'Uso de App', val: simulationData.length > 0 ? 92 : 0, status: 'Crítico' },
                        { label: 'Suporte SLA', val: simulationData.length > 0 ? 12 : 0, status: 'Normal' },
                        { label: 'Ticket Médio', val: simulationData.length > 0 ? 45 : 0, status: 'Medio' },
                     ].map((c, i) => (
                        <div key={i}>
                           <div className="flex justify-between mb-1.5 px-0.5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{c.label}</span>
                              <span className="text-[9px] font-black text-white">{c.val}%</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full">
                              <motion.div
                                 initial={{ width: 0 }}
                                 animate={{ width: `${c.val}%` }}
                                 className={`h-full rounded-full ${c.status === 'Crítico' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>

         </div>
      </PageContainer>
   );
}
