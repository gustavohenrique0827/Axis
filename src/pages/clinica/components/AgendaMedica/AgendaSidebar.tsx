import { Card } from "../../../../components/ui/card";
import { User, Check, Zap } from "lucide-react";

interface Doctor { id: string; name: string; esp: string; color: string; }

interface AgendaSidebarProps {
  doctors: Doctor[];
  selectedDrs: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  getStatusStyle: (status: string) => string;
  appointments?: Array<{ status: string }>;
}

export function AgendaSidebar({ doctors, selectedDrs, onToggle, onSelectAll, getStatusStyle, appointments = [] }: AgendaSidebarProps) {
  const total = appointments.length;
  const finalizadosOuEmDia = appointments.filter(a => a.status === 'Finalizado' || a.status === 'Em Atendimento' || a.status === 'Confirmado').length;
  const eficienciaPct = total > 0 ? Math.round((finalizadosOuEmDia / total) * 100) : 0;
  const atrasados = appointments.filter(a => a.status === 'Atrasado').length;
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">
            Médicos & Especialistas
          </h3>
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[10px] font-bold text-[var(--color-primary-blue)] hover:underline cursor-pointer border-none bg-transparent"
          >
            Marcar Todos
          </button>
        </div>
        <div className="space-y-2">
          {doctors.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center opacity-50">
              <User className="w-6 h-6 text-[var(--color-text-faint)] mb-2" />
              <span className="text-xs font-bold text-[var(--color-text-muted)] text-center">Nenhum médico cadastrado</span>
            </div>
          ) : doctors.map((dr) => (
            <button
              key={dr.id}
              type="button"
              onClick={() => onToggle(dr.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-control)] border transition-all cursor-pointer ${
                selectedDrs.includes(dr.id)
                  ? 'bg-[var(--color-primary-blue)]/5 border-[var(--color-primary-blue)]/30'
                  : 'bg-[var(--color-surface-sunken)] border-[var(--color-border-subtle)] opacity-50'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dr.color }} />
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{dr.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium">{dr.esp}</p>
              </div>
              {selectedDrs.includes(dr.id) && <Check className="w-3.5 h-3.5 text-[var(--color-primary-blue)] shrink-0" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border-subtle)]">
          <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Eficiência do Dia
          </h4>
          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{eficienciaPct}%</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
              <span>Atendimentos em Dia</span>
              <span className="text-emerald-500">{finalizadosOuEmDia}/{total}</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--color-surface-sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${eficienciaPct}%` }} />
            </div>
          </div>
          {atrasados > 0 && (
            <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                {atrasados} {atrasados === 1 ? "atendimento atrasado" : "atendimentos atrasados"} na agenda de hoje.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h4 className="text-[10px] font-black text-[var(--color-text-faint)] uppercase tracking-wider mb-3">Legenda de Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {['Aguardando', 'Em Atendimento', 'Atrasado', 'Confirmado'].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getStatusStyle(s).split(' ')[1] || 'bg-slate-400'}`} />
              <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{s}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
