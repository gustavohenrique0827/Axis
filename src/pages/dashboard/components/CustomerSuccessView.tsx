import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, Tooltip, Area, Line } from 'recharts';
import { AlertCircle, ShieldAlert, HeartHandshake, Star, Sparkles, Activity, ArrowUpRight } from 'lucide-react';

const mockHealthData = [
  { name: "Seg", health: 85, retention: 90 },
  { name: "Ter", health: 87, retention: 91 },
  { name: "Qua", health: 86, retention: 92 },
  { name: "Qui", health: 89, retention: 93 },
  { name: "Sex", health: 91, retention: 94 },
  { name: "Sab", health: 90, retention: 94 },
  { name: "Dom", health: 92, retention: 95 },
];

export function CustomerSuccessView() {
  return (
    <motion.div 
      key="sucesso"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid lg:grid-cols-3 gap-6 text-left"
    >
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] relative overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">
                Monitor de Churn IA
              </h4>
            </div>
            <Badge variant="destructive" dot dotPulse>
              Crítico
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Conta Alfa Logística</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded-full">
                  78% Risco
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mb-2">Queda de 40% no uso nos últimos 15 dias</p>
              <div className="w-full h-1.5 bg-[var(--color-border-default)] rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Beta Distribuidora</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                  54% Risco
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mb-2">Atraso na validação do onboarding</p>
              <div className="w-full h-1.5 bg-[var(--color-border-default)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-6 text-xs font-bold gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" /> Abrir Protocolo CS
        </Button>
      </Card>

      <Card className="lg:col-span-2 p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-500" /> Saúde & Retenção da Base
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
              Evolução do score de saúde e retenção de contratos ativos.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-text-faint)] font-bold uppercase tracking-wider">Satisfação Geral</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex -space-x-0.5">
                  {[1, 2, 3, 4].map(s => <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />)}
                  <Star className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                </div>
                <span className="text-xs font-black text-amber-500">4.2/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[240px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockHealthData}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-faint)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-panel)',
                  fontSize: '11px',
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              <Area type="step" dataKey="health" stroke="#10B981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={3} name="Saúde" />
              <Line type="basis" dataKey="retention" stroke="#2563EB" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Retenção" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
            <span className="text-[10px] text-[var(--color-text-faint)] font-bold uppercase tracking-wider block mb-1">
              Retenção Líquida (NRR)
            </span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-[var(--color-text-primary)] font-mono">104%</span>
              <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="text-xs font-mono">+4.2%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
            <span className="text-[10px] text-[var(--color-text-faint)] font-bold uppercase tracking-wider block mb-1">
              Score Médio de Saúde
            </span>
            <div className="flex items-end gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="text-2xl font-black font-mono">88.5</span>
              <Sparkles className="w-4 h-4 mb-1" />
            </div>
          </div>

          <div className="p-4 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
            <span className="text-[10px] text-[var(--color-text-faint)] font-bold uppercase tracking-wider block mb-1">
              Engajamento Digital
            </span>
            <div className="flex items-end gap-2 text-purple-600 dark:text-purple-400">
              <span className="text-2xl font-black font-mono">76%</span>
              <Activity className="w-4 h-4 mb-1" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
