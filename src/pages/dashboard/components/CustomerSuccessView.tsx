import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, Tooltip, Area, Line } from 'recharts';
import { AlertCircle, Info, ShieldAlert, HeartHandshake, Star, Sparkles, Activity, ArrowUpRight } from 'lucide-react';

export function CustomerSuccessView() {
  return (
    <motion.div
       key="sucesso"
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="grid lg:grid-cols-3 gap-6 text-left"
    >
       <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Alerta de Churn IA
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
               <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
               Crítico
            </div>
          </div>
          <div className="space-y-3">
             {([] as Array<{ name: string; risk: number; reason: string; mrr: string; date: string }>).map((c, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white">{c.name}</span>
                      <span className="text-xs text-rose-400">{c.risk}% Risco</span>
                   </div>
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-500">
                         <Info className="w-3 h-3" />
                         <p className="text-xs italic truncate w-32">{c.reason}</p>
                      </div>
                      <span className="text-xs text-slate-400">{c.mrr}</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.risk}%` }}
                        transition={{ delay: i * 0.2, duration: 1 }}
                        className="h-full bg-rose-500 rounded-full"
                      />
                   </div>
                   <div className="mt-2 flex justify-end">
                      <span className="text-xs text-slate-600">{c.date}</span>
                   </div>
                </div>
             ))}
          </div>
          <Button className="w-full mt-6 bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs h-10 rounded-xl hover:bg-rose-600/30 transition-colors gap-2">
             <ShieldAlert className="w-4 h-4" /> Abrir Protocolo CS
          </Button>
       </Card>

       <Card className="lg:col-span-2 p-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h3 className="text-sm text-slate-400 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4" /> Saúde &amp; Retenção Global
                </h3>
                <p className="text-xs text-slate-500 mt-1">Evolução do score de saúde da base de clientes ativos.</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-xs text-slate-500">Sentimento Geral</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="flex -space-x-1">
                        {[1,2,3,4].map(s => <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />)}
                        <Star className="w-3 h-3 text-slate-700" />
                     </div>
                     <span className="text-xs text-amber-500">4.2/5</span>
                  </div>
               </div>
               <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
                {['Dia', 'Semana', 'Mês'].map(p => (
                  <button key={p} className={`px-3 py-1.5 text-xs rounded-lg border-none bg-transparent cursor-pointer transition-colors ${p === 'Semana' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
                    {p}
                  </button>
                ))}
               </div>
            </div>
          </div>
          <div className="h-[280px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
               ]}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Area type="step" dataKey="health" stroke="#94a3b8" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2} />
                  <Line type="basis" dataKey="retention" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-500 block mb-2">Retenção Líquida</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-white">104%</span>
                  <div className="flex items-center gap-0.5 text-emerald-400 mb-1">
                     <ArrowUpRight className="w-3.5 h-3.5" />
                     <span className="text-xs">+4.2%</span>
                  </div>
                </div>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-500 block mb-2">Score de Saúde Médio</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-white">88.5</span>
                  <Sparkles className="w-4 h-4 mb-1.5 text-slate-500" />
                </div>
             </div>
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-500 block mb-2">Engajamento Digital</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-white">76%</span>
                  <Activity className="w-4 h-4 mb-1.5 text-slate-500" />
                </div>
             </div>
          </div>
       </Card>
    </motion.div>
  );
}
