import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Line } from 'recharts';
import { BarChart3, RefreshCw, Target, Trophy, Layers, Zap, Briefcase } from 'lucide-react';

interface Squad {
  nome: string;
  meta?: number;
  faturamentoAlcancado?: number;
}

interface Contract {
  mrr: string | number;
  status: string;
}

interface StrategicalViewProps {
  comparisonPeriod: 'month' | 'year';
  setComparisonPeriod: (p: 'month' | 'year') => void;
  performanceData: any[];
  squads?: Squad[];
  contracts?: Contract[];
}

export function StrategicalView({
  comparisonPeriod,
  setComparisonPeriod,
  performanceData,
  squads = [],
  contracts = [],
}: StrategicalViewProps) {
  // Compute Goal Meter from real squads
  const totalMeta = squads.reduce((s, sq) => s + sq.meta, 0);
  const totalAlcancado = squads.reduce((s, sq) => s + sq.faturamentoAlcancado, 0);
  const goalPct = totalMeta > 0 ? Math.min(100, Math.round((totalAlcancado / totalMeta) * 100)) : 0;

  // Compute real MRR from contracts
  const activeMRR = contracts
    .filter(c => c.status === 'Ativo')
    .reduce((sum, c) => {
      try {
        const raw = c.mrr;
        const cleaned = typeof raw === 'number' ? String(raw) : raw;
        const numeric = typeof cleaned === 'number'
          ? cleaned
          : parseFloat(String(cleaned).replace(/[^0-9.,]/g, '').replace(',', '.'));
        return sum + (isNaN(numeric) ? 0 : numeric);
      } catch { return sum; }
    }, 0);

  const hasSquads = squads.length > 0;
  const hasContracts = contracts.length > 0;

  return (
    <motion.div
      key="executivo"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 text-left"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Fluxo de Performance
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Correlação entre volume de leads prospectados e faturamento recorrente.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                {(['MRR', 'Retenção'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setComparisonPeriod(type === 'MRR' ? 'month' : 'year')}
                    className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all border-none bg-transparent cursor-pointer ${comparisonPeriod === (type === 'MRR' ? 'month' : 'year') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-500'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="h-10 border-white/5 text-[10px] font-black uppercase tracking-widest gap-2 bg-transparent">
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest text-shadow-glow">Real</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-50" />
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Previsão</span>
            </div>
          </div>
          <div className="h-[380px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
        </Card>

        <div className="space-y-6">
          <Card className="p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden h-full flex flex-col rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Medidor de Meta
              </h3>
              <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              {!hasSquads ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                  <Target className="w-8 h-8 text-slate-500" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Crie squads para ver o Medidor de Meta</p>
                </div>
              ) : (
                <>
                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="45"
                        fill="none" stroke="#10b981" strokeWidth="8"
                        strokeDasharray="282.7"
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{ strokeDashoffset: 282.7 * (1 - goalPct / 100) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white font-mono">{goalPct}%</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase">Batido</span>
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Realizado</span>
                      </div>
                      <span className="text-xs font-black text-white">R$ {totalAlcancado.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Meta</span>
                      </div>
                      <span className="text-xs font-black text-slate-500">R$ {totalMeta.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-[#111827]/80 border-white/5 flex flex-col rounded-3xl">
          <h3 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" /> Insights Inteligentes
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

        <Card className="lg:col-span-3 p-8 bg-[#111827]/80 border-white/5 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-purple-400" /> Snapshot Financeiro
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-black uppercase">Retenção Líquida de Receita</span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">106.4%</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {!hasContracts ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                <Briefcase className="w-8 h-8 text-slate-500" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Cadastre contratos para ver o snapshot financeiro</p>
              </div>
            ) : (
              [
                { label: "MRR Ativo", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeMRR), desc: "Contratos ativos", color: "text-emerald-400" },
                { label: "Contratos Ativos", value: contracts.filter(c => c.status === 'Ativo').length.toString(), desc: "Total de clientes", color: "text-blue-400" },
                { label: "Ticket Médio", value: contracts.filter(c => c.status === 'Ativo').length > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeMRR / contracts.filter(c => c.status === 'Ativo').length) : 'R$ 0', desc: "Receita por cliente", color: "text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="space-y-2 border-r border-white/5 last:border-0 pr-8 last:pr-0">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</p>
                  <h4 className={`text-xl font-black ${item.color} font-mono tracking-tighter`}>{item.value}</h4>
                  <p className="text-[9px] text-slate-600 font-medium">{item.desc}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
