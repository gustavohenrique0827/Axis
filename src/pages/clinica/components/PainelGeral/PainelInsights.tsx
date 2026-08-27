import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Zap, ShieldCheck, Inbox, MoreVertical } from "lucide-react";

interface Appointment {
  id: string;
  patient: string;
  drName: string;
  time: string;
  status: string;
}

interface PainelInsightsProps {
  totalAppointments: number;
  confirmed: number;
  late: number;
  activeToday: Appointment[];
  onNewBooking: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Finalizado': 'bg-emerald-500', 'Em Atendimento': 'bg-blue-500',
  'Confirmado': 'bg-cyan-500', 'Aguardando': 'bg-amber-500',
  'Atrasado': 'bg-rose-500', 'Cancelado': 'bg-slate-500',
};
const STATUS_TEXT: Record<string, string> = {
  'Finalizado': 'text-emerald-500', 'Em Atendimento': 'text-blue-500',
  'Confirmado': 'text-cyan-400', 'Aguardando': 'text-amber-500',
  'Atrasado': 'text-rose-500', 'Cancelado': 'text-slate-500',
};

export function PainelInsights({ totalAppointments, confirmed, late, activeToday, onNewBooking }: PainelInsightsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-8 bg-gradient-to-br from-emerald-500/10 to-[var(--color-surface-elevated)] border border-emerald-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.08] group-hover:rotate-12 transition-transform">
          <ShieldCheck className="w-20 h-20 text-emerald-400" />
        </div>
        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Inteligência Operacional
        </h4>
        <div className="space-y-4">
          {late > 0 && (
            <div className="p-5 bg-[var(--color-surface-sunken)] border border-rose-500/20 rounded-3xl">
              <h5 className="text-[13px] font-black text-[var(--color-text-primary)] mb-1">⚠️ Atrasos Detectados</h5>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium leading-relaxed mb-4">{late} paciente(s) em atraso. Considere enviar lembrete via WhatsApp.</p>
              <Button className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black px-4 rounded-xl">WhatsApp Reminder</Button>
            </div>
          )}
          {totalAppointments === 0 && (
            <div className="p-5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-3xl">
              <h5 className="text-[13px] font-black text-[var(--color-text-primary)] mb-1">📅 Agenda Vazia</h5>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium leading-relaxed mb-4">Nenhum agendamento cadastrado. Crie o primeiro agendamento para ver insights operacionais.</p>
              <Button onClick={onNewBooking} className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black px-4 rounded-xl">Novo Agendamento</Button>
            </div>
          )}
          {totalAppointments > 0 && late === 0 && (
            <div className="p-5 bg-[var(--color-surface-sunken)] border border-emerald-500/20 rounded-3xl">
              <h5 className="text-[13px] font-black text-[var(--color-text-primary)] mb-1">✅ Operação Normal</h5>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium leading-relaxed">{totalAppointments} agendamentos, {confirmed} confirmados, sem atrasos detectados.</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Jornada do Paciente (Live)</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] text-[var(--color-text-muted)] font-black uppercase">Hoje</span>
          </div>
        </div>
        {activeToday.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
            <Inbox className="w-8 h-8 text-[var(--color-text-faint)]" />
            <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-center">Nenhum paciente agendado para hoje.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeToday.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-[var(--color-surface-sunken)] rounded-2xl border border-[var(--color-border-default)] hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-10 rounded-full ${STATUS_COLORS[p.status] || 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm font-black text-[var(--color-text-primary)]">{p.patient}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase flex items-center gap-2">
                      {p.drName} <span className="w-1 h-1 rounded-full bg-[var(--color-border-default)]" /> {p.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${STATUS_TEXT[p.status] || 'text-[var(--color-text-muted)]'}`}>{p.status}</p>
                  <MoreVertical className="w-4 h-4 text-[var(--color-text-faint)] mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
