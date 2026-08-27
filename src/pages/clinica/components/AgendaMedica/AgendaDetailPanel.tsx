import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../../../components/ui/button";
import { X, Stethoscope, MapPin, Activity, CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  drId: string;
  drName: string;
  status: 'Confirmado' | 'Aguardando' | 'Atrasado' | 'Em Atendimento' | 'Finalizado';
  type: string;
  room: string;
  specialty: string;
}

interface AgendaDetailPanelProps {
  selectedApt: Appointment | undefined;
  onClose: () => void;
}

export function AgendaDetailPanel({ selectedApt, onClose }: AgendaDetailPanelProps) {
  return (
    <AnimatePresence>
      {selectedApt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative h-full w-full max-w-md bg-[var(--color-surface-elevated)] border-l border-[var(--color-border-default)] shadow-2xl p-0 flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-[var(--color-primary-blue)] uppercase tracking-wider">
                  Detalhes do Atendimento
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-blue)]/10 border border-[var(--color-primary-blue)]/20 flex items-center justify-center text-xl font-black text-[var(--color-primary-blue)]">
                  {selectedApt.patient[0]}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate">
                    {selectedApt.patient}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {selectedApt.specialty}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-bold uppercase text-[var(--color-primary-blue)] bg-[var(--color-primary-blue)]/10 px-2 py-0.5 rounded">
                      {selectedApt.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                  <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase mb-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--color-primary-blue)]" /> Horário
                  </p>
                  <p className="text-base font-black text-[var(--color-text-primary)] font-mono">{selectedApt.time}</p>
                </div>
                <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                  <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-500" /> Duração
                  </p>
                  <p className="text-base font-black text-[var(--color-text-primary)] font-mono">30 min</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Informações Clínicas
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[var(--color-primary-blue)]" />
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">Médico</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">{selectedApt.drName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">Consultório / Sala</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">{selectedApt.room}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border-subtle)]">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Ações Rápidas
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button size="sm" className="h-10 text-xs font-bold shadow-xs">
                    Iniciar Atendimento
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 text-xs font-bold">
                    Remarcar Horário
                  </Button>
                  <Button variant="danger" size="sm" className="h-10 text-xs font-bold">
                    Cancelar
                  </Button>
                  <Button variant="subtle" size="sm" className="h-10 text-xs font-bold">
                    Ver Prontuário
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
