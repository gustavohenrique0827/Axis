import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  Calendar, Users, Clock, 
  TrendingUp, Star, Heart, Activity,
  Zap, MoreVertical, Plus, ShieldCheck, Inbox
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { BookingModal } from "./components/BookingModal";

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ClinicasDashboard() {
  const { leads, addTask, appointments } = useData();
  const [view, setView] = useState<'geral' | 'unidades' | 'operacional'>('geral');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Compute KPIs from real appointments
  const totalAppointments = appointments.length;
  const confirmed = appointments.filter(a => a.status === 'Confirmado' || a.status === 'Em Atendimento').length;
  const finalized = appointments.filter(a => a.status === 'Finalizado').length;
  const late = appointments.filter(a => a.status === 'Atrasado').length;

  // Group appointments by weekday for chart
  const clinicData = useMemo(() => {
    return WEEKDAYS.map(day => {
      const dayApts = appointments.filter(a => {
        try {
          const d = new Date(a.date);
          return !isNaN(d.getTime()) && WEEKDAYS[d.getDay()] === day;
        } catch { return false; }
      });
      const noShow = dayApts.filter(a => a.status === 'Atrasado').length;
      return { name: day, consultas: dayApts.length, noShow };
    });
  }, [appointments]);

  // Group appointments by doctor for ranking
  const doctorRanking = useMemo(() => {
    const byDr: Record<string, { name: string; patients: number }> = {};
    appointments.forEach(a => {
      const dr = a.drName || 'Sem especialista';
      if (!byDr[dr]) byDr[dr] = { name: dr, patients: 0 };
      byDr[dr].patients++;
    });
    return Object.values(byDr).sort((a, b) => b.patients - a.patients).slice(0, 3);
  }, [appointments]);

  // Live patient journey: last 4 appointments active today
  const today = new Date().toISOString().split('T')[0];
  const activeToday = appointments.filter(a => a.date === today).slice(0, 4);

  const occupancyPct = totalAppointments > 0 ? Math.min(100, Math.round((confirmed / totalAppointments) * 100)) : 0;

  const stats = [
    { label: "Agendamentos (Total)", value: totalAppointments.toString(), trend: null, icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Confirmados / Ativos", value: confirmed.toString(), trend: null, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Finalizados", value: finalized.toString(), trend: null, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Atrasados / Em Fila", value: late.toString(), trend: null, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const STATUS_COLORS: Record<string, string> = {
    'Finalizado': 'bg-emerald-500',
    'Em Atendimento': 'bg-blue-500',
    'Confirmado': 'bg-cyan-500',
    'Aguardando': 'bg-amber-500',
    'Atrasado': 'bg-rose-500',
    'Cancelado': 'bg-slate-500',
  };
  const STATUS_TEXT: Record<string, string> = {
    'Finalizado': 'text-emerald-500',
    'Em Atendimento': 'text-blue-500',
    'Confirmado': 'text-cyan-400',
    'Aguardando': 'text-amber-500',
    'Atrasado': 'text-rose-500',
    'Cancelado': 'text-slate-500',
  };

  return (
    <PageContainer 
      title="Gestão de Clínicas Axis" 
      description="Monitoramento clínico, eficiência operacional e jornada do paciente em tempo real."
      actions={
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
          <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1 gap-1">
             {['geral', 'unidades', 'operacional'].map(t => (
               <button 
                 key={t}
                 onClick={() => setView(t as any)}
                 className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                   view === t ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Vital Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {stats.map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl group overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                   <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   {stat.trend && (
                     <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} bg-white/5 px-2 py-1 rounded-full`}>
                       {stat.trend}
                     </span>
                   )}
                </div>
                <div className="mt-6 relative z-10">
                   <h3 className="text-3xl font-black text-white font-mono tracking-tighter italic">{stat.value}</h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <stat.icon className="w-24 h-24 text-white" />
                </div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Agenda Analytics */}
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-400" /> Fluxo de Atendimento
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Volume de atendimentos por dia da semana.</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[9px] text-slate-400 font-bold uppercase">Compareceu</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-rose-500" />
                       <span className="text-[9px] text-slate-400 font-bold uppercase">Atrasado/Cancelado</span>
                    </div>
                 </div>
              </div>
              {totalAppointments === 0 ? (
                <div className="h-[320px] flex flex-col items-center justify-center gap-4 opacity-40">
                  <Inbox className="w-10 h-10 text-slate-500" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum agendamento cadastrado ainda.<br/>Crie agendamentos para ver o fluxo.
                  </p>
                </div>
              ) : (
                <div className="h-[320px] -mx-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={clinicData}>
                        <defs>
                           <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="consultas" stroke="#10b981" fillOpacity={1} fill="url(#colorConsultas)" strokeWidth={4} />
                        <Area type="step" dataKey="noShow" stroke="#f43f5e" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" fill="#f43f5e" />
                     </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
           </Card>

           {/* Live Capacity */}
           <Card className="p-8 bg-[#111827]/80 border-white/5 flex flex-col items-center justify-center">
              <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2 w-full">
                 <Zap className="w-4 h-4 text-amber-400" /> Ocupação Hoje
              </h3>
              <div className="relative w-40 h-40 mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="#10b981" strokeWidth="8" 
                    strokeDasharray="282.7" 
                    strokeDashoffset={282.7 * (1 - occupancyPct / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-mono">{occupancyPct}<span className="text-sm text-slate-600">%</span></span>
                  <span className="text-[9px] text-slate-500 font-black uppercase">Confirmados</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { label: 'Total', value: totalAppointments, color: 'text-white' },
                  { label: 'Ativos', value: confirmed, color: 'text-emerald-400' },
                  { label: 'Finalizados', value: finalized, color: 'text-blue-400' },
                  { label: 'Atrasados', value: late, color: 'text-rose-400' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{s.label}</p>
                    <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
           {/* Top Doctors */}
           <Card className="lg:col-span-3 p-8 bg-[#111827]/80 border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Ranking de Performance Clínica
                 </h3>
                 <span className="text-[10px] text-slate-500 font-black uppercase italic">Por agendamentos</span>
              </div>
              {doctorRanking.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
                  <Users className="w-8 h-8 text-slate-500" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum médico cadastrado ainda.<br/>Crie agendamentos para ver o ranking.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                   {doctorRanking.map((dr, i) => (
                      <div key={i} className="grid grid-cols-4 items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                         <div className="col-span-2 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-emerald-400 transition-colors">
                               {dr.name[0]}
                            </div>
                            <div>
                               <p className="text-sm font-black text-white">{dr.name}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase italic">Especialista</p>
                            </div>
                         </div>
                         <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Pacientes</p>
                            <p className="text-sm font-black text-white font-mono">{dr.patients}</p>
                         </div>
                         <div className="text-right px-4">
                            <div className="flex items-center justify-end gap-2 mb-1">
                               <span className="text-[9px] font-black text-white">{Math.round((dr.patients / Math.max(totalAppointments,1)) * 100)}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500" style={{ width: `${Math.round((dr.patients / Math.max(totalAppointments,1)) * 100)}%` }} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </Card>

           {/* Retention */}
           <Card className="p-8 bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                 <Heart className="w-20 h-20 text-purple-400" />
              </div>
              <div>
                 <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em] mb-6">Índice de Retorno</h3>
                 <div className="text-5xl font-black text-white font-mono italic tracking-tighter">
                   {totalAppointments > 0 ? `${Math.round((finalized / totalAppointments) * 100)}` : '0'}<span className="text-xl text-slate-600">%</span>
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 leading-relaxed">Consultas finalizadas sobre total agendado.</p>
              </div>
              <Button variant="outline" className="w-full border-purple-500/20 text-[10px] font-black h-12 rounded-2xl hover:bg-purple-500/10 mt-10">
                 Gerenciar Recalls ↗
              </Button>
           </Card>
        </div>

        {/* AI Insights & Live Journey */}
        <div className="grid lg:grid-cols-2 gap-6">
           <Card className="p-8 bg-gradient-to-br from-[#10b981]/10 to-transparent border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform">
                 <ShieldCheck className="w-20 h-20 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> Inteligência Operacional
              </h4>
              <div className="space-y-4">
                 {late > 0 && (
                   <div className="p-5 bg-white/5 border border-rose-500/20 rounded-3xl">
                     <h5 className="text-[13px] font-black text-white mb-1">⚠️ Atrasos Detectados</h5>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{late} paciente(s) em atraso. Considere enviar lembrete via WhatsApp.</p>
                     <Button className="h-8 bg-rose-600 text-[9px] font-black px-4 rounded-xl">WhatsApp Reminder</Button>
                   </div>
                 )}
                 {totalAppointments === 0 && (
                   <div className="p-5 bg-white/5 border border-white/5 rounded-3xl">
                     <h5 className="text-[13px] font-black text-white mb-1">📅 Agenda Vazia</h5>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">Nenhum agendamento cadastrado. Crie o primeiro agendamento para ver insights operacionais.</p>
                     <Button onClick={() => setIsBookingOpen(true)} className="h-8 bg-emerald-600 text-[9px] font-black px-4 rounded-xl">Novo Agendamento</Button>
                   </div>
                 )}
                 {totalAppointments > 0 && late === 0 && (
                   <div className="p-5 bg-white/5 border border-emerald-500/20 rounded-3xl">
                     <h5 className="text-[13px] font-black text-white mb-1">✅ Operação Normal</h5>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{totalAppointments} agendamentos, {confirmed} confirmados, sem atrasos detectados.</p>
                   </div>
                 )}
              </div>
           </Card>

           <Card className="p-8 bg-[#111827]/80 border-white/5 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Jornada do Paciente (Live)</h4>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-black uppercase">Hoje</span>
                 </div>
              </div>
              {activeToday.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
                  <Inbox className="w-8 h-8 text-slate-500" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum paciente agendado para hoje.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                   {activeToday.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className={`w-1 h-10 rounded-full ${STATUS_COLORS[p.status] || 'bg-slate-500'}`} />
                            <div>
                               <p className="text-sm font-black text-white">{p.patient}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                                  {p.drName} <span className="w-1 h-1 rounded-full bg-white/10" /> {p.time}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className={`text-[10px] font-black uppercase tracking-tighter ${STATUS_TEXT[p.status] || 'text-slate-400'}`}>{p.status}</p>
                            <MoreVertical className="w-4 h-4 text-slate-600 mt-1 ml-auto" />
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </Card>
        </div>

      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        leads={leads} 
        addTask={addTask} 
      />
    </PageContainer>
  );
}
