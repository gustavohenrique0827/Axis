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
              <Button onClick={onNewBooking} className="h-8 bg-emerald-600 text-[9px] font-black px-4 rounded-xl">Novo Agendamento</Button>
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
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum paciente agendado para hoje.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeToday.map((p) => (
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
  );
}
