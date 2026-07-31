import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Target, Zap, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../../../types";

const WORKLOAD_DATA: any[] = [];

interface WorkloadBentoProps {
  tasks: Task[];
  highPriorityCount: number;
}

export function WorkloadBento({ tasks, highPriorityCount }: WorkloadBentoProps) {
  const activeUrgentTask = tasks.find(t => t.priority === 'Alta' && t.status !== 'Concluída');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Focus Mode Card */}
       <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border-white/5 relative overflow-hidden group bento-card rounded-3xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
             <Target className="w-48 h-48 text-blue-500" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 relative z-10">
             <div className="flex-1 text-left">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Strategic Focus</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Ação prioritária baseada no pipeline</p>
                   </div>
                </div>

                <AnimatePresence mode="wait">
                   {activeUrgentTask ? (
                      <motion.div
                        key={activeUrgentTask.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.08] transition-all cursor-pointer group/task"
                      >
                         <div className="flex justify-between items-start mb-4">
                           <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-black uppercase text-[8px] h-6">Urgente / High Ticket</Badge>
                           <span className="text-[10px] font-mono text-slate-500">{activeUrgentTask.date}</span>
                         </div>
                         <h4 className="text-xl font-black text-white italic tracking-tighter leading-tight mb-4 group-hover/task:text-blue-400 transition-colors">
                            {activeUrgentTask.title}
                         </h4>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-white/10 flex items-center justify-center text-[8px] font-black">AX</div>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{activeUrgentTask.related}</span>
                            </div>
                            <Button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest group-hover/task:translate-x-2 transition-transform">Expand Task</Button>
                         </div>
                      </motion.div>
                   ) : (
                      <div className="p-12 text-center text-slate-600 border border-dashed border-white/5 rounded-[32px]">
                         <CheckCircle2 className="w-8 h-8 mx-auto mb-4 opacity-20" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em]">All high-priority goals completed</p>
                      </div>
                   )}
                </AnimatePresence>
             </div>

             <div className="w-full md:w-64 space-y-4">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center md:text-left">Workload Balance</h5>
                <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={WORKLOAD_DATA} layout="vertical" margin={{ left: -30 }}>
                         <XAxis type="number" hide />
                         <Tooltip cursor={false} content={({payload}) => {
                            if (!payload || !payload.length) return null;
                            return <div className="bg-black/90 border border-white/10 p-2 rounded-xl text-[9px] font-black uppercase text-white">{payload[0].payload.name}: {payload[0].value} Tasks</div>
                         }} />
                         <Bar dataKey="tasks" radius={[0, 4, 4, 0]} barSize={12}>
                            {WORKLOAD_DATA.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex justify-center md:justify-start gap-4">
                   <div className="flex flex-col text-center md:text-left">
                      <span className="text-xl font-black text-white italic tracking-tighter">{tasks.filter(t => t.status !== 'Concluída').length}</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active</span>
                   </div>
                   <div className="flex flex-col text-center md:text-left border-l border-white/10 pl-4">
                      <span className="text-xl font-black text-emerald-400 italic tracking-tighter">{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Concluída').length / tasks.length) * 100) : 0}%</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Velocity</span>
                   </div>
                </div>
             </div>
          </div>
       </Card>

       {/* Quick Action Bento */}
       <Card className="p-8 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border-white/5 relative overflow-hidden flex flex-col justify-between rounded-3xl">
          <div>
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Performance Engine</h4>
             <div className="space-y-6 text-left">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                         <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">Lead Conversion</span>
                   </div>
                   <span className="text-xs font-black text-emerald-400 font-mono">0.0%</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                         <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">Avg Time to Close</span>
                      <span className="text-xs font-black text-blue-400 font-mono">0d</span>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-left">
             <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Integrations</h5>
             <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 uppercase">Google Tasks</div>
                <div className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase">Slack Ops</div>
             </div>
          </div>
       </Card>
    </div>
  );
}
