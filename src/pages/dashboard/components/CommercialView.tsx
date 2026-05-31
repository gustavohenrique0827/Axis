import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Trophy, Filter, MessageSquare, Eye, Users, Zap, AlertCircle, Target, TrendingUp } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  'Ligação': Users,
  'Reunião': Zap,
  'E-mail': MessageSquare,
  'Visita': Target,
  'Nota': AlertCircle,
};

interface FunnelStep {
  label: string;
  value: number;
  drop: number;
  color: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  seller?: string;
}

interface SalesEntry {
  name: string;
  total: number;
  deals: number;
  rate: number;
}

interface CommercialViewProps {
  salesRanking: SalesEntry[];
  funnelData: FunnelStep[];
  recentActivities: Activity[];
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">{message}</p>
    </div>
  );
}

export function CommercialView({ salesRanking, funnelData, recentActivities }: CommercialViewProps) {
  const top3 = salesRanking.slice(0, 3);
  const hasSales = top3.length > 0;
  const hasActivities = recentActivities.length > 0;
  const hasFunnel = funnelData.some(s => s.value > 0);
  const maxFunnelValue = funnelData[0]?.value || 1;

  return (
    <motion.div 
      key="comercial"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6 text-left"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-10 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/80 to-[#111827] border-white/5 relative overflow-hidden group rounded-3xl">
          <div className="flex items-center justify-between mb-12">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" /> Hall da Fama
              </h3>
              <div className="flex gap-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                   {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
                 </span>
              </div>
          </div>

          {!hasSales ? (
            <EmptyState icon={Trophy} message="Nenhum deal fechado ainda. Feche o primeiro negócio para ver o ranking!" />
          ) : (
            <>
              <div className="flex items-end justify-center gap-6 mb-12 h-56">
                  {/* 2nd Place */}
                  {top3[1] ? (
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
                          <p className="text-[11px] font-black text-white text-center truncate w-full mb-1">{top3[1].name}</p>
                          <p className="text-xs font-black text-slate-400 font-mono">R$ {top3[1].total.toLocaleString('pt-BR')}</p>
                      </div>
                    </motion.div>
                  ) : <div className="flex-1 max-w-[130px]" />}

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
                        <p className="text-[13px] font-black text-white text-center truncate w-full mb-1">{top3[0].name}</p>
                        <p className="text-lg font-black text-amber-400 font-mono tracking-tighter">R$ {top3[0].total.toLocaleString('pt-BR')}</p>
                        <div className="mt-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(245,158,11,0.4)]">Master Closer</div>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  {top3[2] ? (
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
                          <p className="text-[10px] font-black text-white text-center truncate w-full mb-1">{top3[2].name}</p>
                          <p className="text-[11px] font-black text-orange-400 font-mono">R$ {top3[2].total.toLocaleString('pt-BR')}</p>
                      </div>
                    </motion.div>
                  ) : <div className="flex-1 max-w-[110px]" />}
              </div>

              <div className="grid grid-cols-3 gap-4">
                  {top3.map((s, idx) => (
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
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden rounded-3xl">
            <h3 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-2">
               <Filter className="w-4 h-4 text-emerald-400" /> Funil de Conversão
            </h3>
            {!hasFunnel ? (
              <EmptyState icon={Filter} message="Nenhum lead cadastrado ainda. Adicione leads para ver o funil." />
            ) : (
              <div className="space-y-4">
                 {funnelData.map((step, i) => (
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
                           animate={{ width: `${(step.value / maxFunnelValue) * 100}%` }}
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
            )}
          </Card>

          <Card className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12">
                <TrendingUp className="w-16 h-16 text-blue-400" />
             </div>
             <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Performance do Pipeline</h4>
             <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
               {hasFunnel
                 ? `${funnelData[0].value} leads na prospecção. Taxa de conversão atual: ${salesRanking.length > 0 ? salesRanking[0].rate : 0}%.`
                 : 'Cadastre leads e contratos para ver insights de performance do seu pipeline.'}
             </p>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-8 bg-[#111827]/80 border-white/5 lg:col-span-1 rounded-3xl">
           <h3 className="text-xs font-black text-slate-400 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
             <Eye className="w-4 h-4 text-purple-400" /> Radar de Atributos
           </h3>
           <div className="h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                 { subject: 'Velocidade', A: salesRanking.length > 0 ? Math.min(150, salesRanking[0].rate * 1.5) : 0, fullMark: 150 },
                 { subject: 'Ticket Médio', A: salesRanking.length > 0 ? Math.min(150, (salesRanking[0].total / Math.max(salesRanking[0].deals, 1)) / 1000) : 0, fullMark: 150 },
                 { subject: 'Volume', A: salesRanking.length > 0 ? Math.min(150, salesRanking[0].deals * 10) : 0, fullMark: 150 },
                 { subject: 'Qualidade', A: salesRanking.length > 0 ? Math.min(150, salesRanking[0].rate) : 0, fullMark: 150 },
                 { subject: 'CRM Health', A: funnelData.length > 0 ? Math.min(150, (funnelData[0]?.value || 0) * 5) : 0, fullMark: 150 },
               ]}>
                 <PolarGrid stroke="#64748b20" />
                 <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontStyle="bold" />
                 <Radar name="Top Closers" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-6 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Seu Time</span>
              </div>
           </div>
        </Card>

        <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 rounded-3xl">
           <div className="flex items-center justify-between mb-10">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Atividades Recentes
             </h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] text-emerald-400 font-black uppercase">Live</span>
                </div>
             </div>
           </div>
           {!hasActivities ? (
             <EmptyState icon={Zap} message="Nenhuma atividade registrada ainda. Registre ligações, reuniões e e-mails nos leads." />
           ) : (
             <div className="space-y-4">
                {recentActivities.map((activity, i) => {
                  const Icon = ACTIVITY_ICONS[activity.type] || Zap;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                       <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 shrink-0 shadow-lg">
                         <Icon className="w-4 h-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-[13px] font-black text-white group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{activity.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{activity.description}</p>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </Card>
      </div>
    </motion.div>
  );
}
