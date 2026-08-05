import type { ComponentType } from 'react';
import { Calendar, Users, TrendingUp, Star, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { BookingModal } from "./components/BookingModal";
import { PainelKPIs } from "./components/PainelGeral/PainelKPIs";
import { PainelCharts } from "./components/PainelGeral/PainelCharts";
import { PainelRanking } from "./components/PainelGeral/PainelRanking";
import { PainelInsights } from "./components/PainelGeral/PainelInsights";
import { Plus } from 'lucide-react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type Stat = {
  label: string; value: string; trend: string | null;
  icon: ComponentType<{ className?: string }>; color: string; bg: string;
};

export default function ClinicasDashboard() {
  const { leads, addTask, appointments } = useData();
  const [view, setView] = useState<'geral' | 'unidades' | 'operacional'>('geral');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const totalAppointments = appointments.length;
  const confirmed = appointments.filter(a => a.status === 'Confirmado' || a.status === 'Em Atendimento').length;
  const finalized = appointments.filter(a => a.status === 'Finalizado').length;
  const late = appointments.filter(a => a.status === 'Atrasado').length;
  const occupancyPct = totalAppointments > 0 ? Math.min(100, Math.round((confirmed / totalAppointments) * 100)) : 0;

  const clinicData = useMemo(() => WEEKDAYS.map(day => {
    const dayApts = appointments.filter(a => {
      try { const d = new Date(a.date); return !isNaN(d.getTime()) && WEEKDAYS[d.getDay()] === day; }
      catch { return false; }
    });
    return { name: day, consultas: dayApts.length, noShow: dayApts.filter(a => a.status === 'Atrasado').length };
  }), [appointments]);

  const doctorRanking = useMemo(() => {
    const byDr: Record<string, { name: string; patients: number }> = {};
    appointments.forEach(a => {
      const dr = a.drName || 'Sem especialista';
      if (!byDr[dr]) byDr[dr] = { name: dr, patients: 0 };
      byDr[dr].patients++;
    });
    return Object.values(byDr).sort((a, b) => b.patients - a.patients).slice(0, 3);
  }, [appointments]);

  const today = new Date().toISOString().split('T')[0];
  const activeToday = appointments.filter(a => a.date === today).slice(0, 4);

  const stats: Stat[] = [
    { label: "Agendamentos (Total)", value: totalAppointments.toString(), trend: null, icon: Calendar, color: "text-slate-400", bg: "bg-white/5" },
    { label: "Confirmados / Ativos", value: confirmed.toString(), trend: null, icon: TrendingUp, color: "text-slate-400", bg: "bg-white/5" },
    { label: "Finalizados", value: finalized.toString(), trend: null, icon: Users, color: "text-slate-400", bg: "bg-white/5" },
    { label: "Atrasados / Em Fila", value: late.toString(), trend: null, icon: Star, color: "text-slate-400", bg: "bg-white/5" },
  ];

  return (
    <PageContainer
      title="Gestão de Clínicas Axis"
      description="Monitoramento clínico, eficiência operacional e jornada do paciente em tempo real."
      actions={
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsBookingOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
          <div className="flex bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl p-1 gap-1">
            {(['geral', 'unidades', 'operacional'] as const).map(t => (
              <button key={t} onClick={() => setView(t)} className={`px-4 py-2 text-xs rounded-xl capitalize transition-all ${view === t ? 'bg-blue-600 text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <PainelKPIs stats={stats} />
        <PainelCharts clinicData={clinicData} totalAppointments={totalAppointments} confirmed={confirmed} finalized={finalized} late={late} occupancyPct={occupancyPct} />

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-2xl transition-colors text-left"
        >
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
            {showDetails ? "Ver menos" : "Ver mais detalhes"}
            {!showDetails && <span className="text-[var(--color-text-faint)]">— ranking de médicos e jornada do paciente</span>}
          </span>
          <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>

        {showDetails && (
          <>
            <PainelRanking doctorRanking={doctorRanking} totalAppointments={totalAppointments} finalized={finalized} />
            <PainelInsights totalAppointments={totalAppointments} confirmed={confirmed} late={late} activeToday={activeToday} onNewBooking={() => setIsBookingOpen(true)} />
          </>
        )}
      </div>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} leads={leads} addTask={addTask} />
    </PageContainer>
  );
}
