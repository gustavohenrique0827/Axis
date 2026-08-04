import React from "react";
import { X, PlusCircle } from "lucide-react";

interface AddActivityDialogProps {
  showAddActivityModal: boolean;
  setShowAddActivityModal: (show: boolean) => void;
  matchingLead: any;
  newActivityType: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro';
  setNewActivityType: (type: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro') => void;
  newActivityTitle: string;
  setNewActivityTitle: (val: string) => void;
  newActivityDesc: string;
  setNewActivityDesc: (val: string) => void;
  handleCreateActivity: (matchingLeadId: string) => void;
}

export function AddActivityDialog({
  showAddActivityModal,
  setShowAddActivityModal,
  matchingLead,
  newActivityType,
  setNewActivityType,
  newActivityTitle,
  setNewActivityTitle,
  newActivityDesc,
  setNewActivityDesc,
  handleCreateActivity
}: AddActivityDialogProps) {
  if (!showAddActivityModal || !matchingLead) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setShowAddActivityModal(false)}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/15 rounded-full text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-slate-400" />
            Registrar Atividade no CRM
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Adicione uma nova nota, ligação ou reunião diretamente na jornada linear do lead <strong className="text-white font-medium">{matchingLead.name}</strong>.
          </p>
        </div>

        <div className="space-y-3.5 text-left">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 block">Tipo de Interação</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Reunião', 'Ligação', 'E-mail', 'Outro'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewActivityType(t)}
                  className={`py-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                    newActivityType === t
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-[var(--color-surface)] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t === 'Reunião' && 'Reunião'}
                  {t === 'Ligação' && 'Ligação'}
                  {t === 'E-mail' && 'E-mail'}
                  {t === 'Outro' && 'Nota'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 block">Título / Resumo curto</label>
            <input
              type="text"
              value={newActivityTitle}
              onChange={(e) => setNewActivityTitle(e.target.value)}
              placeholder="Ex: Alinhamento de SLA comercial"
              className="w-full bg-[var(--color-surface)] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 block">Detalhes do Evento</label>
            <textarea
              value={newActivityDesc}
              onChange={(e) => setNewActivityDesc(e.target.value)}
              rows={4}
              placeholder="Escreva anotações detalhadas sobre as decisões tomadas ou a ligação efetuada..."
              className="w-full bg-[var(--color-surface)] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/20 resize-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex justify-end gap-3.5 text-xs">
          <button
            type="button"
            onClick={() => setShowAddActivityModal(false)}
            className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleCreateActivity(matchingLead.id)}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-colors cursor-pointer"
          >
            Salvar Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
