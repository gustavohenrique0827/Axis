import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Line } from 'recharts';
import { BarChart3, RefreshCw, Target, Trophy, Layers, Zap, Briefcase, ChevronDown } from 'lucide-react';

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
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      key="executivo"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 text-left"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h3 className="text-sm text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Fluxo de Performance
              </h3>
              <p className="text-xs text-slate-500 mt-1">Correlação entre volume de leads prospectados e faturamento recorrente.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                {(['MRR', 'Retenção'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setComparisonPeriod(type === 'MRR' ? 'month' : 'year')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border-none bg-transparent cursor-pointer ${comparisonPeriod === (type === 'MRR' ? 'month' : 'year') ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="h-9 text-xs gap-2 bg-transparent">
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-400">Real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-500">Previsão</span>
            </div>
          </div>
          <div className="h-[380px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#94a3b8" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} strokeLinecap="round" />
                <Area type="monotone" dataKey="leads" stroke="#64748b" fillOpacity={0} strokeWidth={1.5} strokeDasharray="6 6" name="Projeção IA" />
                <Line type="stepAfter" dataKey="retention" stroke="#475569" strokeWidth={1.5} dot={false} name="Health Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" /> Medidor de Meta
              </h3>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center py-6">
              {!hasSquads ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <Target className="w-8 h-8 text-slate-500" />
                  <p className="text-sm text-slate-500">Crie squads para ver o Medidor de Meta</p>
                </div>
              ) : (
                <>
                  <div className="relative w-48 h-48 mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="45"
                        fill="none" stroke="#94a3b8" strokeWidth="8"
                        strokeDasharray="282.7"
                        initial={{ strokeDashoffset: 282.7 }}
                        animate={{ strokeDashoffset: 282.7 * (1 - goalPct / 100) }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-semibold text-white">{goalPct}%</span>
                      <span className="text-xs text-slate-500">Batido</span>
                    </div>
                  </div>
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-400">Realizado</span>
                      </div>
                      <span className="text-xs text-white">R$ {totalAlcancado.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span className="text-xs text-slate-400">Meta</span>
                      </div>
                      <span className="text-xs text-slate-500">R$ {totalMeta.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-surface-elevated)]/60 border border-white/5 rounded-xl transition-colors text-left"
        >
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            {showDetails ? "Ver menos" : "Ver mais detalhes"}
            {!showDetails && (
              <span className="text-slate-600">
                — insights inteligentes e snapshot financeiro
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>

        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="p-6 flex flex-col">
              <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Insights Inteligentes
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white mb-1 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-slate-400" /> Velocidade de Vendas
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">Seu ciclo médio caiu 14% este mês. Recomendamos duplicar investimento em AdWords.</p>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <p className="text-xs text-emerald-400 mb-1">Oportunidade</p>
                  <p className="text-xs text-slate-400">Há 42 leads 'Mornos' com score &gt; 80 aguardando followup.</p>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-3 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm text-slate-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Snapshot Financeiro
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Retenção Líquida de Receita</span>
                  <span className="text-emerald-400">106.4%</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {!hasContracts ? (
                  <div className="col-span-3 flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <Briefcase className="w-8 h-8 text-slate-500" />
                    <p className="text-sm text-slate-500">Cadastre contratos para ver o snapshot financeiro</p>
                  </div>
                ) : (
                  [
                    { label: "MRR Ativo", value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeMRR), desc: "Contratos ativos" },
                    { label: "Contratos Ativos", value: contracts.filter(c => c.status === 'Ativo').length.toString(), desc: "Total de clientes" },
                    { label: "Ticket Médio", value: contracts.filter(c => c.status === 'Ativo').length > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(activeMRR / contracts.filter(c => c.status === 'Ativo').length) : 'R$ 0', desc: "Receita por cliente" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1 border-r border-white/5 last:border-0 pr-8 last:pr-0">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <h4 className="text-xl font-semibold text-white">{item.value}</h4>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
}
