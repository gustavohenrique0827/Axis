import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../../../components/ui/button";
import { X, Stethoscope, MapPin, Activity, CheckCircle2, AlertCircle } from "lucide-react";

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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="relative h-full w-full max-w-md bg-[#0B1120] border-l border-white/10 shadow-2xl p-0 flex flex-col"
          >
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-emerald-600/5 to-transparent">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Detalhes da Consulta</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
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
  );
}
