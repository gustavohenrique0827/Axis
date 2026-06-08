import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TrendingUp, AlertCircle, Download, Wallet, ArrowUpRight, ArrowDownRight, Printer, Globe, Clock, Sparkles } from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  Cell, PieChart, Pie
} from 'recharts';
import { useData } from "../../contexts/DataContext";
import { useMemo } from "react";
import { motion } from "motion/react";

import { PageContainer } from "../../components/PageContainer";


export default function FinanceiroVisaoGeral() {
  const { financeEntries, contracts, squads } = useData();

  const { receita, despesa, mrr, inadimplencia } = useMemo(() => {
    const receita = financeEntries
      .filter(f => f.type === 'Receber' && f.status === 'Pago')
      .reduce((sum, f) => sum + f.value, 0);
    
    const despesa = financeEntries
      .filter(f => f.type === 'Pagar' && f.status === 'Pago')
      .reduce((sum, f) => sum + f.value, 0);

    const mrr = contracts
      .filter(c => c.status === 'Ativo')
      .reduce((sum, c) => {
        const raw = c.mrr;
        const valStr = typeof raw === 'number' ? String(raw) : (raw ?? '0');
        const val = parseFloat(String(valStr).replace(/[^\d]/g, '') || "0") / 100;
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

    const entriesPagar = financeEntries.filter(f => f.type === 'Pagar');
    const totalPagar = entriesPagar.length;
    const atrasadoPagar = entriesPagar.filter(f => f.status === 'Atrasado').length;
    const inadimplencia = totalPagar > 0 ? (atrasadoPagar / totalPagar) * 100 : 0;

    return { receita, despesa, mrr, inadimplencia };
  }, [financeEntries, contracts]);

  const upcomingEntries = useMemo(() => {
    return financeEntries
      .filter(f => f.status === 'A Vencer')
      .slice(0, 4)
      .map(f => ({
        label: f.description,
        date: f.date,
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(f.value),
        type: f.type.toLowerCase() as 'pagar' | 'receber'
      }));
  }, [financeEntries]);

  // Chart data: group financeEntries by month (last 6 months)
  const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthEntries = financeEntries.filter(f => {
        try {
          const parts = f.date?.split('/');
          if (!parts || parts.length < 3) return false;
          const fd = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          return fd.getFullYear() === y && fd.getMonth() === m;
        } catch { return false; }
      });
      const rec = monthEntries.filter(f => f.type === 'Receber' && f.status === 'Pago').reduce((s, f) => s + f.value, 0);
      const des = monthEntries.filter(f => f.type === 'Pagar' && f.status === 'Pago').reduce((s, f) => s + f.value, 0);
      return { name: MONTH_NAMES[m], receita: rec, despesa: des, projection: Math.round(rec * 1.1) };
    });
  }, [financeEntries]);

  // Stability score: ratio of revenue vs total flow
  const stabilityScore = receita + despesa > 0 ? Math.round((receita / (receita + despesa)) * 100) : 0;

  return (
    <PageContainer
      title="Painel Financeiro"
      description="Monitoramento avançado de fluxo, MRR, inadimplência e projeção de caixa em tempo real."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex print:hidden h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10 text-white">
            Q2 - 2026 <ArrowDownRight className="w-3 h-3 ml-2 opacity-50" />
          </Button>
          <Button onClick={() => window.print()} className="print:hidden h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-white/5 border-white/10 text-white hover:bg-white/10">
             <Printer className="w-4 h-4 mr-2" />
          </Button>
          <Button className="print:hidden h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#2563EB] hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita (Real)", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(receita), trend: "--", positive: true, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Custo Operacional", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(despesa), trend: "--", positive: true, icon: Wallet, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "MRR Global", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(mrr), trend: "--", positive: true, icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Índice de Churn", value: `${inadimplencia.toFixed(1)}%`, trend: "--", positive: false, icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((kpi, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${kpi.bg} border border-white/5`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${kpi.positive ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-400 border-rose-500/20 bg-rose-500/5'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                <h3 className="text-2xl font-black text-white italic tracking-tighter">{kpi.value}</h3>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0">
                  <kpi.icon className="w-full h-full" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Main Chart Section */}
        <Card className="lg:col-span-8 p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden bento-card">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="font-black text-lg text-white uppercase italic tracking-tighter flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" /> Motor de Performance Financeira
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Comparativo de fluxo de caixa vs projeção inteligente</p>
              </div>
              
              <div className="flex flex-wrap gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                {[
                  { label: "Receita", color: "bg-[#2563EB]" },
                  { label: "Projeção", color: "bg-[#2563EB]/40" },
                  { label: "Despesa", color: "bg-rose-500" }
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2 px-2">
                      <div className={`w-2 h-2 rounded-full ${l.color}`}></div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{l.label}</span>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 900}}
                    dy={15}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 900}}
                    tickFormatter={(val) => `R$ ${val/1000}k`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    labelStyle={{ fontSize: '12px', fontWeight: 900, marginBottom: '12px', color: '#60a5fa', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="projection" stroke="#2563EB" strokeWidth={1} fill="transparent" strokeDasharray="10 5" opacity={0.3} />
                <Area type="monotone" dataKey="receita" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="despesa" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </Card>

        {/* Financial Stability Gauge */}
        <Card className="lg:col-span-4 p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col items-center justify-center text-center">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Score de Estabilidade</h4>
           
           <div className="relative w-full aspect-square max-w-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Stability', value: stabilityScore, fill: '#2563EB' },
                      { name: 'Remaining', value: 100 - stabilityScore, fill: 'rgba(255,255,255,0.05)' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius="80%"
                    outerRadius="100%"
                    startAngle={220}
                    endAngle={-40}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#2563EB" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-black text-white italic tracking-tighter">{stabilityScore}</span>
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">Saúde Global</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full mt-10">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Liquidez</p>
                 <span className="text-white font-black font-mono">--</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Burn Rate</p>
                 <span className="text-rose-400 font-black font-mono">--</span>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Entries with Refined Style */}
        <Card className="p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl">
            <h3 className="font-black flex items-center gap-3 mb-8 uppercase text-[10px] tracking-[0.2em] text-slate-300">
                <Clock className="w-4 h-4 text-blue-500" /> Agenda de Lançamentos
            </h3>
            <div className="space-y-3">
                {upcomingEntries.length === 0 ? (
                  <div className="py-16 text-center italic text-slate-600 text-[10px] font-black uppercase tracking-widest bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                    Nenhum pendente.
                  </div>
                ) : (
                  upcomingEntries.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group cursor-pointer"
                      >
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 ${item.type === 'receber' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                  {item.type === 'receber' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                              </div>
                              <div>
                                  <p className="text-xs font-black text-white uppercase tracking-tight leading-none mb-1">{item.label}</p>
                                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{item.date}</p>
                              </div>
                          </div>
                          <p className={`text-sm font-mono font-black ${item.type === 'receber' ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {item.value}
                          </p>
                      </motion.div>
                  ))
                )}
            </div>
            <Button variant="ghost" className="w-full mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-400 hover:bg-blue-600/5 h-14 rounded-2xl transition-all border border-transparent hover:border-blue-500/20">Fluxo Completo</Button>
        </Card>

        {/* Quick Insights Card (New) */}
        <Card className="lg:col-span-2 p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <h3 className="font-black flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Inteligência Operacional
              </h3>
              <Badge className="bg-white/5 border-white/10 text-slate-500 text-[8px] font-black uppercase h-6">Projeções ML em Tempo Real</Badge>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 {[
                   { label: "Custo por Lead (CPL)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                   { label: "LTV Projetado (12m)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                   { label: "Margem Ebitda", value: "0%", trend: "0%", status: "Estável" }
                 ].map((insight, idx) => (
                   <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{insight.label}</p>
                         <h5 className="text-lg font-black text-white italic tracking-tighter">{insight.value}</h5>
                      </div>
                      <div className="text-right">
                         <span className={`text-[9px] font-black uppercase block mb-1 ${insight.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{insight.trend}</span>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                           insight.status === 'Seguro' ? 'bg-emerald-500/10 text-emerald-400' :
                           insight.status === 'Atenção' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-500'
                         }`}>{insight.status}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 flex flex-col justify-center">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">Consultoria IA</h4>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recomendação Automatizada</p>
                    </div>
                 </div>
                 <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                   Sem dados suficientes para geração de insights automáticos no momento.
                 </p>
                 <Button className="mt-6 h-11 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest">Executar Estratégia</Button>
              </div>
           </div>
        </Card>
      </div>

      {/* Squad Goals and OTE Commissions Tracking Section */}
      <div className="flex items-center justify-between mt-10 mb-4 px-1">
        <h3 className="font-black text-sm text-white uppercase tracking-[0.15em] flex items-center gap-2">
          🎯 Campanha de Metas & Comissionamento
        </h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full animate-pulse">Monitoramento ao Vivo</span>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Progress Tracker Card */}
        <Card className="xl:col-span-2 p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Evolução de Metas por Squad</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Atingimento de faturamento e status da comissão OTE</p>
              </div>
              <div className="bg-blue-500/10 text-blue-400 border border-blue-500/15 font-black uppercase tracking-widest text-[8px] px-3 py-1.5 rounded-lg shadow-inner">
                Extração de Dados ao Vivo
              </div>
            </div>

          {squads.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <span className="text-3xl">🎯</span>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum squad cadastrado ainda.<br/>Crie squads para ver a evolução de metas.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {squads.map((sq, idx) => {
                const faturado = sq.faturamentoAlcancado ?? 0;
                const meta = sq.meta ?? 0;
                const percent = meta > 0 ? Math.min(100, Math.round((faturado / meta) * 100)) : 0;
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-orange-500'];
                return (
                  <div key={sq.id || idx} className="space-y-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{sq.nome}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block mt-0.5 opacity-60">Foco: {sq.focoComercial}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-mono font-black text-white">{percent}</span>
                        <span className="text-[9px] font-black text-slate-600">%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-1000`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
                      <span>R$ {faturado.toLocaleString("pt-BR")}</span>
                      <span className="opacity-40">META: R$ {meta.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
          
          <div className="pt-6 border-t border-white/5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Taxa de aceitação SDR ➔ Closer: Estabelecida 90%
            </span>
            <span className="text-emerald-400 font-black px-3 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">Assertividade atual: 92.4%</span>
          </div>
        </Card>

        {/* Commissions Breakdown Box */}
          <Card className="p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between rounded-[32px] bento-card">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Resumo por Tipo</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">Entradas vs Saídas do período</p>

            <div className="space-y-4">
              {[
                { title: "Total a Receber", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeEntries.filter(f => f.type === 'Receber').reduce((s, f) => s + f.value, 0)), subtitle: `${financeEntries.filter(f => f.type === 'Receber').length} lançamentos`, status: "Receita", type: "success" },
                { title: "Total a Pagar", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeEntries.filter(f => f.type === 'Pagar').reduce((s, f) => s + f.value, 0)), subtitle: `${financeEntries.filter(f => f.type === 'Pagar').length} lançamentos`, status: "Despesa", type: "warning" },
                { title: "Saldo Líquido", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita - despesa), subtitle: "Pago vs recebido", status: receita >= despesa ? "Positivo" : "Negativo", type: receita >= despesa ? "success" : "error" },
              ].map((fee, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{fee.title}</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{fee.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-tight block">{fee.subtitle}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                      fee.type === 'success' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                      fee.type === 'warning' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
                      'text-rose-500 border-rose-500/20 bg-rose-500/5'
                    }`}>{fee.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-8">
            <div className="p-5 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl text-center group transition-all">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] block mb-2">Total Provisionado</span>
              <span className="text-2xl font-mono font-black text-white block italic tracking-tighter">R$ 0,00</span>
            </div>
          </div>
        </Card>

      </div>
    </PageContainer>
  );
}

