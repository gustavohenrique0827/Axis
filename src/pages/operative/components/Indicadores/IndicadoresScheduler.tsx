import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Settings2, Send, Mail, Clock, Calendar, Trash2, CheckCircle } from "lucide-react";

interface Schedule {
  id: string;
  email: string;
  weekday: string;
  time: string;
  active: boolean;
}

interface IndicadoresSchedulerProps {
  schedules: Schedule[];
  newEmail: string;
  onEmailChange: (v: string) => void;
  newWeekday: string;
  onWeekdayChange: (v: string) => void;
  newTime: string;
  onTimeChange: (v: string) => void;
  onCreateSchedule: (e: { preventDefault(): void }) => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onSimulateRun: () => void;
}

export function IndicadoresScheduler({
  schedules, newEmail, onEmailChange, newWeekday, onWeekdayChange,
  newTime, onTimeChange, onCreateSchedule, onToggleSchedule, onDeleteSchedule, onSimulateRun,
}: IndicadoresSchedulerProps) {
  return (
    <Card className="p-8 border border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 className="text-blue-400 w-5 h-5 animate-pulse" /> Exportação Agendada de Performance (CSV)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure o envio automático de planilhas de performance comercial diretamente para os e-mails dos gestores e diretores.
          </p>
        </div>
        <Button type="button" onClick={onSimulateRun} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 h-9 px-4 rounded-lg">
          <Send className="w-4 h-4" /> Simular Disparo (Segunda-feira)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={onCreateSchedule} className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Mail className="w-3.5 h-3.5 text-blue-400" /> Novo Destinatário
          </h3>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase block">E-mail do Gestor</label>
            <input type="text" placeholder="exemplo@axis.com.br" value={newEmail} onChange={(e) => onEmailChange(e.target.value)}
              className="w-full bg-[var(--color-surface)] text-sm text-white placeholder-slate-600 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase block">Frequência</label>
              <select value={newWeekday} onChange={(e) => onWeekdayChange(e.target.value)}
                className="w-full bg-[var(--color-surface)] text-xs text-white border border-white/10 rounded-xl px-3.5 py-3 outline-none font-bold"
              >
                <option value="Segunda-feira">Toda Segunda (Recomendado)</option>
                <option value="Terça-feira">Toda Terça</option>
                <option value="Quarta-feira">Toda Quarta</option>
                <option value="Quinta-feira">Toda Quinta</option>
                <option value="Sexta-feira">Toda Sexta</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase block">Horário Disparo</label>
              <input type="time" value={newTime} onChange={(e) => onTimeChange(e.target.value)}
                className="w-full bg-[var(--color-surface)] text-xs font-bold text-white border border-white/10 rounded-xl px-4 py-3 outline-none font-mono text-center"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 border-0">
            <Calendar className="w-4 h-4" /> Adicionar Agendamento
          </button>
        </form>

        <div className="lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-3.5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Lista de Envio Ativa
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {schedules.length > 0 ? schedules.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${item.active ? "bg-[var(--color-surface)]/60 border-blue-500/10 hover:border-blue-500/20" : "bg-slate-900/20 border-white/5 opacity-50"}`}>
                  <div className="flex items-center gap-3.5 truncate text-left">
                    <div className={`p-2 rounded-lg ${item.active ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-slate-400"}`}><Mail className="w-4 h-4" /></div>
                    <div className="truncate">
                      <span className="text-white text-xs font-black block truncate">{item.email}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">Agenda: Toda {item.weekday} às {item.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => onToggleSchedule(item.id)}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer border ${item.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-white/5"}`}
                    >
                      {item.active ? "Ativo" : "Pausado"}
                    </button>
                    <button type="button" onClick={() => onDeleteSchedule(item.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 bg-[var(--color-surface)]/20 rounded-xl border border-dashed border-white/5">
                  <Mail className="w-8 h-8 text-slate-600" />
                  <span className="text-xs font-bold text-slate-300">Sem agendamentos activos</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[var(--color-surface)]/60 p-3.5 rounded-xl border border-white/5 flex items-start gap-2.5 mt-4 text-left">
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>Dispensadores automáticos:</strong> Os relatórios são disparados através de rotinas CRON agendadas. Você também pode baixar o arquivo CSV compilado imediatamente pressionando a opção <strong>"Simular Disparo"</strong> acima.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
