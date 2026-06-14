import React, { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { ModulesCombobox, ALL_MODULES } from "./ModulesCombobox";

interface PermissaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cargoId: string, modulos: string[]) => void;
  editing: any | null;
  cargos: any[];
}

const MODULE_LABELS: Record<string, string> = {
  crm: "CRM & Pipeline", financeiro: "Financeiro", engajamento: "Engajamento",
  marketing: "Marketing", educacao: "Educação", clinica: "Clínica",
  rh: "RH", bi: "BI", produtividade: "Tarefas", catalogo: "Catálogo", dev: "Dev",
};

const selectClass = "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none transition-all";

export function PermissaoModal({ isOpen, onClose, onSave, editing, cargos }: PermissaoModalProps) {
  const [cargoId, setCargoId] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);

  React.useEffect(() => {
    if (!isOpen) return;
    setCargoId(editing?.id ?? "");
    setModulos(editing?.modulos ?? []);
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const disponíveis = editing ? cargos : cargos.filter((c) => !c.modulos || c.modulos.length === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0B1120] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-base font-black text-white">{editing ? "Editar Permissões" : "Nova Permissão"}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Módulos de acesso por cargo</div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cargo</label>
            {editing ? (
              <div className={`${selectClass} opacity-60 cursor-not-allowed`}>{editing.nome}</div>
            ) : (
              <select value={cargoId} onChange={(e) => setCargoId(e.target.value)} className={selectClass}>
                <option value="">Selecione um cargo...</option>
                {disponíveis.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
            {!editing && disponíveis.length === 0 && (
              <p className="text-[11px] text-amber-400 font-semibold">Todos os cargos já têm permissões configuradas.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Módulos de Acesso</label>
            <ModulesCombobox selected={modulos} onChange={setModulos} />
          </div>

          {modulos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modulos.map((id) => (
                <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-600/10 text-blue-300 text-[10px] font-bold">
                  {MODULE_LABELS[id] ?? id}
                  <button type="button" onClick={() => setModulos((prev) => prev.filter((x) => x !== id))} className="text-blue-500 hover:text-white leading-none ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">Cancelar</button>
          <button
            onClick={() => { const id = editing?.id ?? cargoId; if (id && modulos.length > 0) { onSave(id, modulos); onClose(); } }}
            className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/20"
          >
            {editing ? "Salvar" : "Criar Permissão"}
          </button>
        </div>
      </div>
    </div>
  );
}
