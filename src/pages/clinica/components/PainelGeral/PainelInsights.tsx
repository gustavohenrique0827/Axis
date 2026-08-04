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
  'Finalizado': 'bg-emerald-500', 'Em Atendimento': 'bg-slate-400',
  'Confirmado': 'bg-emerald-500', 'Aguardando': 'bg-amber-500',
  'Atrasado': 'bg-red-500', 'Cancelado': 'bg-slate-500',
};
const STATUS_TEXT: Record<string, string> = {
  'Finalizado': 'text-emerald-400', 'Em Atendimento': 'text-slate-400',
  'Confirmado': 'text-emerald-400', 'Aguardando': 'text-amber-400',
  'Atrasado': 'text-red-400', 'Cancelado': 'text-slate-500',
};

export function PainelInsights({ totalAppointments, confirmed, late, activeToday, onNewBooking }: PainelInsightsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h4 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Inteligência Operacional
        </h4>
        <div className="space-y-4">
          {late > 0 && (
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <h5 className="text-sm text-white mb-1 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Atrasos Detectados</h5>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{late} paciente(s) em atraso. Considere enviar lembrete via WhatsApp.</p>
              <Button size="sm" variant="danger">WhatsApp Reminder</Button>
            </div>
          )}
          {totalAppointments === 0 && (
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <h5 className="text-sm text-white mb-1">Agenda Vazia</h5>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">Nenhum agendamento cadastrado. Crie o primeiro agendamento para ver insights operacionais.</p>
              <Button size="sm" onClick={onNewBooking}>Novo Agendamento</Button>
            </div>
          )}
          {totalAppointments > 0 && late === 0 && (
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <h5 className="text-sm text-white mb-1 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operação Normal</h5>
              <p className="text-xs text-slate-500 leading-relaxed">{totalAppointments} agendamentos, {confirmed} confirmados, sem atrasos detectados.</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm text-slate-400">Jornada do Paciente (Live)</h4>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Hoje</span>
          </div>
        </div>
        {activeToday.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
            <Inbox className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-500 text-center">Nenhum paciente agendado para hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeToday.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-10 rounded-full ${STATUS_COLORS[p.status] || 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm text-white">{p.patient}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      {p.drName} <span className="w-1 h-1 rounded-full bg-white/10" /> {p.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${STATUS_TEXT[p.status] || 'text-slate-400'}`}>{p.status}</p>
                  <MoreVertical className="w-4 h-4 text-slate-600 mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
