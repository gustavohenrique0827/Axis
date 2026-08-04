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
       <Card className="p-8 bg-gradient-to-br from-rose-950/20 to-black/40 border-rose-500/10 backdrop-blur-xl relative overflow-hidden rounded-3xl">
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

       <Card className="lg:col-span-2 p-10 bg-[var(--color-surface-elevated)]/80 border-white/5 space-y-10 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <HeartHandshake className="w-5 h-5 text-emerald-400" /> Saúde & Retenção Global
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">Evolução do score de saúde da base de clientes ativos.</p>
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
                {['Dia', 'Semana', 'Mês'].map(p => (
                  <button key={p} className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl border transition-all border-none bg-transparent cursor-pointer ${p === 'Semana' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="step" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={4} />
                  <Line type="basis" dataKey="retention" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-[#06B6D4]/20 transition-all group">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-[#06B6D4] transition-colors">Retenção Líquida</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-white font-mono tracking-tighter">104%</span>
                  <div className="flex items-center gap-0.5 text-emerald-400 font-black mb-1.5">
                     <ArrowUpRight className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-mono">+4.2%</span>
                  </div>
                </div>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-[#06B6D4]/20 transition-all group">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-[#06B6D4] transition-colors">Score de Saúde Médio</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-white font-mono tracking-tighter">88.5</span>
                  <Sparkles className="w-5 h-5 mb-2.5 opacity-50 text-[#06B6D4]" />
                </div>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-[#06B6D4]/20 transition-all group">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3 group-hover:text-[#06B6D4] transition-colors">Engajamento Digital</span>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-white font-mono tracking-tighter">76%</span>
                  <Activity className="w-5 h-5 mb-2.5 opacity-50 text-[#06B6D4]" />
                </div>
             </div>
          </div>
       </Card>
    </motion.div>
  );
}
