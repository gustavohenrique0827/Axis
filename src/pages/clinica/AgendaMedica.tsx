import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Stethoscope, MapPin, CheckCircle2, AlertCircle, Activity, MoreVertical, RefreshCw, CalendarDays } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { getAccessToken } from "../../lib/google-auth";
import { toast } from "sonner";
import { AgendaSidebar } from "./components/AgendaMedica/AgendaSidebar";
import { AgendaDetailPanel } from "./components/AgendaMedica/AgendaDetailPanel";

const hourlySlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

type Appointment = {
  id: string; time: string; patient: string; drId: string; drName: string;
  status: 'Confirmado' | 'Aguardando' | 'Atrasado' | 'Em Atendimento' | 'Finalizado';
  type: string; room: string; specialty: string;
};

export default function AgendaClinica() {
  const { appointments, addAppointment, squads } = useData();

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

  useEffect(() => {
    if (doctors.length > 0 && selectedDrs.length === 0) setSelectedDrs(doctors.map(d => d.id));
  }, [doctors]);

  const filteredAppointments = useMemo(() => appointments.filter(apt => selectedDrs.includes(apt.drId)), [selectedDrs, appointments]);
  const selectedApt = appointments.find(a => a.id === selectedAptId);

  const handleSyncCalendar = async () => {
    const token = await getAccessToken();
    if (!token) { toast.error("Por favor, conecte sua conta Google na página de Telemedicina antes de sincronizar."); return; }
    setIsSyncing(true);
    try {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${todayStart.toISOString()}&timeMax=${todayEnd.toISOString()}&singleEvents=true`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Falha ao buscar eventos do Google Calendar");
      const data = await response.json();
      let importedCount = 0;
      (data.items || []).forEach((event: any) => {
        const start = event.start.dateTime || event.start.date;
        const startTime = new Date(start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (!appointments.some(a => a.time === startTime && a.room === 'Google Calendar')) {
          addAppointment({ time: startTime, patient: event.summary || "Bloco Google Calendar", drId: '4', drName: 'Dr. Roberto Vilela', status: 'Confirmado', type: 'Consulta', room: 'Google Calendar', specialty: 'Sincronizado', date: new Date().toISOString().split('T')[0] });
          importedCount++;
        }
      });
      if (importedCount > 0) toast.success(`${importedCount} eventos importados do Google Calendar!`);
      else toast.info("Sincronização concluída. Nenhum novo evento pendente.");
    } catch (error) {
      toast.error("Erro ao sincronizar com Google Calendar.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusStyle = (status: Appointment['status'] | string) => {
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
          <Button onClick={handleSyncCalendar} disabled={isSyncing} variant="outline" className="border-white/10 bg-[#0B1120] text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white/5 active:scale-95 transition-all">
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
        <AgendaSidebar
          doctors={doctors}
          selectedDrs={selectedDrs}
          onToggle={(id) => setSelectedDrs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          onSelectAll={() => setSelectedDrs(doctors.map(d => d.id))}
          getStatusStyle={getStatusStyle}
        />

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-[#111827]/80 border-white/5 overflow-hidden shadow-2xl">
            <div className="flex items-center p-6 border-b border-white/5 bg-[#0B1120]/50">
              <div className="w-24 shrink-0 text-[10px] font-black text-slate-600 uppercase tracking-widest">Hora</div>
              <div className="flex-1 text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4">Paciente & Especialista</div>
              <div className="hidden md:block w-32 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Sala</div>
              <div className="hidden md:block w-40 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</div>
              <div className="w-12" />
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
                        {apts.length > 0 ? apts.map(apt => (
                          <motion.button key={apt.id} onClick={() => setSelectedAptId(apt.id)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left shadow-lg group/apt ${getStatusStyle(apt.status)}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs">{apt.patient[0]}</div>
                              <div>
                                <h4 className="text-sm font-black text-white group-hover/apt:underline">{apt.patient}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-bold opacity-70 flex items-center gap-1 uppercase tracking-widest"><Stethoscope className="w-3 h-3" /> {apt.drName}</span>
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
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors"><MoreVertical className="w-4 h-4 opacity-40 group-hover/apt:opacity-100" /></button>
                            </div>
                          </motion.button>
                        )) : (
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

      <AgendaDetailPanel selectedApt={selectedApt as Appointment | undefined} onClose={() => setSelectedAptId(null)} />
    </PageContainer>
  );
}
