import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus, 
  Search,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Stethoscope,
  MapPin,
  X,
  Check,
  Zap,
  LayoutGrid,
  Heart,
  Activity,
  RefreshCw,
  CalendarDays
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { getAccessToken } from "../../lib/google-auth";
import { toast } from "sonner";

const hourlySlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

type Appointment = {
  id: string;
  time: string;
  patient: string;
  drId: string;
  drName: string;
  status: 'Confirmado' | 'Aguardando' | 'Atrasado' | 'Em Atendimento' | 'Finalizado';
  type: string;
  room: string;
  specialty: string;
};

export default function AgendaClinica() {
  const { appointments, addAppointment, squads } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const doctors = useMemo(() => {
    if (!squads || squads.length === 0) return [];
    const allMembers = squads.flatMap(s => s.membros || []);
    const unique = Array.from(new Set(allMembers));
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    return unique.map((name: string, i) => ({
      id: `dr-${i}`,
      name: name.includes('(') ? name.split(' (')[0] : name,
      esp: name.includes('(') ? name.split('(')[1].replace(')', '') : 'Geral',
      color: colors[i % colors.length]
    }));
  }, [squads]);

  const [selectedDrs, setSelectedDrs] = useState<string[]>([]);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-select all doctors when the list loads for the first time
  useEffect(() => {
    if (doctors.length > 0 && selectedDrs.length === 0) {
      setSelectedDrs(doctors.map(d => d.id));
    }
  }, [doctors]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => selectedDrs.includes(apt.drId));
  }, [selectedDrs, appointments]);

  const selectedApt = appointments.find(a => a.id === selectedAptId);

  const handleSyncCalendar = async () => {
    const token = await getAccessToken();
    if (!token) {
      toast.error("Por favor, conecte sua conta Google na página de Telemedicina antes de sincronizar.");
      return;
    }

    setIsSyncing(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${todayStart.toISOString()}&timeMax=${todayEnd.toISOString()}&singleEvents=true`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error("Falha ao buscar eventos do Google Calendar");

      const data = await response.json();
      const events = data.items || [];

      let importedCount = 0;
      events.forEach((event: any) => {
        const start = event.start.dateTime || event.start.date;
        const startTime = new Date(start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Check if we already have an appointment at this time
        const exists = appointments.some(a => a.time === startTime && a.room === 'Google Calendar');
        
        if (!exists) {
          addAppointment({
            time: startTime,
            patient: event.summary || "Bloco Google Calendar",
            drId: '4', // Default to Dr. Roberto for demo syncs
            drName: 'Dr. Roberto Vilela',
            status: 'Confirmado',
            type: 'Consulta',
            room: 'Google Calendar',
            specialty: 'Sincronizado',
            date: new Date().toISOString().split('T')[0]
          });
          importedCount++;
        }
      });

      if (importedCount > 0) {
        toast.success(`${importedCount} eventos importados do Google Calendar!`);
      } else {
        toast.info("Sincronização concluída. Nenhum novo evento pendente.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao sincronizar com Google Calendar.");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDr = (id: string) => {
    setSelectedDrs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'Finalizado': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Em Atendimento': return 'bg-blue-500/10 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/50 animate-pulse';
      case 'Atrasado': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Aguardando': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <PageContainer 
      title="Agenda Médica" 
      description="Sincronização de horários, gestão de salas e fluxo de pacientes por unidade."
      actions={
        <div className="flex items-center gap-4">
           <Button 
             onClick={handleSyncCalendar}
             disabled={isSyncing}
             variant="outline" 
             className="border-white/10 bg-[#0B1120] text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white/5 active:scale-95 transition-all"
           >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <CalendarDays className="w-4 h-4 text-blue-400" />}
              Sincronizar Google Calendar
           </Button>
           <div className="flex bg-[#0B1120] border border-white/5 p-1 rounded-2xl shadow-inner h-11">
              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white/5"><ChevronLeft className="w-5 h-5 text-slate-400" /></Button>
              <div className="px-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white min-w-[150px] justify-center">28 Maio, 2026</div>
              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-white/5"><ChevronRight className="w-5 h-5 text-slate-400" /></Button>
           </div>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-emerald-900/30 group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Novo Agendamento
           </Button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-4 gap-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Sidebar Controls */}
        <div className="space-y-6">
           {/* Dr Filter */}
           <Card className="p-8 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Painel de Médicos</h3>
                 <button onClick={() => setSelectedDrs(doctors.map(d => d.id))} className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Marcar Todos</button>
              </div>
              <div className="space-y-3">
                 {doctors.length === 0 ? (
                   <div className="py-6 flex flex-col items-center justify-center opacity-40">
                      <User className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 text-center">Nenhum médico cadastrado (Squads)</span>
                   </div>
                 ) : doctors.map((dr) => (
                   <button 
                     key={dr.id} 
                     onClick={() => toggleDr(dr.id)}
                     className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                       selectedDrs.includes(dr.id) 
                       ? 'bg-white/5 border-white/10 ring-1 ring-white/10' 
                       : 'bg-transparent border-dashed border-white/5 opacity-40 grayscale'
                     }`}
                   >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dr.color }} />
                      <div className="text-left flex-1">
                         <p className="text-xs font-black text-white">{dr.name}</p>
                         <p className="text-[9px] text-slate-500 font-bold uppercase">{dr.esp}</p>
                      </div>
                      {selectedDrs.includes(dr.id) && <Check className="w-3 h-3 text-emerald-400" />}
                   </button>
                 ))}
              </div>
           </Card>

           {/* Efficiency Overview */}
           <Card className="p-8 bg-gradient-to-br from-[#10b981]/10 to-transparent border-emerald-500/10 group">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Eficiência Global
                 </h4>
                 <div className="w-8 h-8 rounded-full border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400">82%</div>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                       <span>Taxa de Espera</span>
                       <span className="text-emerald-400">12min</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[45%]" />
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                       "Previsão de **pico de fluxo** às 15:30 devido a 4 retornos simultâneos. Sala 02 disponível para triagem extra."
                    </p>
                 </div>
              </div>
           </Card>

           {/* Legend */}
           <Card className="p-6 bg-[#111827]/80 border-white/5">
              <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Legenda de Status</h4>
              <div className="grid grid-cols-2 gap-3">
                 {['Aguardando', 'Em Atendimento', 'Atrasado', 'Confirmado'].map(s => (
                   <div key={s} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(s as any).split(' ')[1]}`} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{s}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Main Agenda Grid */}
        <div className="lg:col-span-3 space-y-6">
           <Card className="bg-[#111827]/80 border-white/5 overflow-hidden shadow-2xl">
              {/* Table Header */}
              <div className="flex items-center p-6 border-b border-white/5 bg-[#0B1120]/50">
                 <div className="w-24 shrink-0 text-[10px] font-black text-slate-600 uppercase tracking-widest">Hora</div>
                 <div className="flex-1 text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4">Paciente & Especialista</div>
                 <div className="hidden md:block w-32 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Sala</div>
                 <div className="hidden md:block w-40 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</div>
                 <div className="w-12"></div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-white/5 overflow-y-auto max-h-[800px] no-scrollbar">
                 {hourlySlots.map((slot, i) => {
                   const apts = filteredAppointments.filter(a => a.time === slot);
                   return (
                     <div key={i} className={`flex group min-h-[90px] relative transition-colors ${apts.length > 0 ? '' : 'hover:bg-white/[0.01]'}`}>
                        <div className={`w-24 p-6 border-r border-white/5 flex flex-col items-center justify-center bg-[#0B1120]/30 shrink-0 ${apts.length > 0 ? 'border-l-4 border-l-emerald-500/40' : ''}`}>
                           <span className="text-base font-black text-white font-mono tracking-tighter">{slot}</span>
                           <span className="text-[9px] text-slate-600 font-bold uppercase mt-1">30min</span>
                        </div>
                        
                        <div className="flex-1 p-3 space-y-2">
                           <AnimatePresence>
                              {apts.length > 0 ? (
                                apts.map(apt => (
                                  <motion.button 
                                    key={apt.id}
                                    onClick={() => setSelectedAptId(apt.id)}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left shadow-lg group/apt ${getStatusStyle(apt.status)}`}
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs">
                                           {apt.patient[0]}
                                        </div>
                                        <div>
                                           <h4 className="text-sm font-black text-white group-hover/apt:underline">{apt.patient}</h4>
                                           <div className="flex items-center gap-2 mt-1">
                                              <span className="text-[10px] font-bold opacity-70 flex items-center gap-1 uppercase tracking-widest">
                                                 <Stethoscope className="w-3 h-3" /> {apt.drName}
                                              </span>
                                              <span className="w-1 h-1 rounded-full bg-white/10" />
                                              <span className="text-[10px] font-medium opacity-60 italic">{apt.type}</span>
                                           </div>
                                        </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-10">
                                        <div className="hidden md:flex flex-col items-center gap-1">
                                           <MapPin className="w-3 h-3 opacity-40" />
                                           <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{apt.room}</span>
                                        </div>
                                        <div className="hidden md:flex items-center gap-3 w-32 justify-end">
                                           {apt.status === 'Confirmado' && <CheckCircle2 className="w-4 h-4" />}
                                           {apt.status === 'Atrasado' && <AlertCircle className="w-4 h-4 animate-pulse text-rose-500" />}
                                           {apt.status === 'Em Atendimento' && <Activity className="w-4 h-4 animate-pulse text-blue-500" />}
                                           <span className="text-[10px] font-black uppercase tracking-widest">{apt.status}</span>
                                        </div>
                                        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                           <MoreVertical className="w-4 h-4 opacity-40 group-hover/apt:opacity-100" />
                                        </button>
                                     </div>
                                  </motion.button>
                                ))
                              ) : (
                                <button className="w-full h-full border border-dashed border-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/5 hover:border-white/10 active:scale-[0.99]">
                                   <Plus className="w-3.5 h-3.5" /> Agendar Horário vago
                                </button>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </Card>
        </div>

      </div>

      {/* Quick Details Sidebar/Modal */}
      <AnimatePresence>
         {selectedAptId && selectedApt && (
           <div className="fixed inset-0 z-[100] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAptId(null)}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="relative h-full w-full max-w-md bg-[#0B1120] border-l border-white/10 shadow-2xl p-0 flex flex-col"
              >
                 <div className="p-8 border-b border-white/5 bg-gradient-to-br from-emerald-600/5 to-transparent">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Detalhes da Consulta</h3>
                       <button onClick={() => setSelectedAptId(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl font-black text-emerald-500">
                          {selectedApt.patient[0]}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-white italic tracking-tighter">{selectedApt.patient}</h2>
                          <p className="text-sm font-bold text-slate-500 mt-1">ID: #CXT-294-26</p>
                          <div className="flex items-center gap-2 mt-4">
                             <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Premium axis</span>
                             <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">Plano Unimed</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Horário Agendado</p>
                          <p className="text-xl font-black text-white font-mono">{selectedApt.time}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Duração Est.</p>
                          <p className="text-xl font-black text-white font-mono">30 min</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Informações Clínicas</h4>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-3">
                                <Stethoscope className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white">Especialista</span>
                             </div>
                             <span className="text-xs font-bold text-slate-400">{selectedApt.drName}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white">Local / Sala</span>
                             </div>
                             <span className="text-xs font-bold text-slate-400">{selectedApt.room}</span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-[9px] text-slate-500 font-black uppercase mb-2">Motivo da Consulta</p>
                             <p className="text-xs font-medium text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/40 pl-3">
                                "Paciente relata desconforto torácico leve ao realizar exercícios de alta intensidade. Histórico familiar de hipertensão."
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-6">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Ações do Sistema</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <Button className="h-12 rounded-2xl bg-emerald-600 text-[10px] font-black uppercase gap-2">Iniciar Atendimento</Button>
                          <Button variant="outline" className="h-12 rounded-2xl border-white/10 text-[10px] font-black uppercase">Remarcar</Button>
                          <Button variant="outline" className="h-12 rounded-2xl border-white/10 text-[10px] font-black uppercase text-rose-400 border-rose-500/10">Cancelar</Button>
                          <Button variant="outline" className="h-12 rounded-2xl border-white/10 text-[10px] font-black uppercase">Ver Prontuário</Button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </PageContainer>
  );
}
