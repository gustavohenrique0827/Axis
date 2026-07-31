import React, { useState } from "react";
import { Briefcase } from "lucide-react";

interface CargoFormData { nome: string; nivel: string; descricao: string }

interface CargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: CargoFormData) => void;
  editing: any | null;
}

const inputClass = "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all";

export function CargoModal({ isOpen, onClose, onSave, editing }: CargoModalProps) {
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("Operacional");
  const [descricao, setDescricao] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    setNome(editing?.nome ?? "");
    setNivel(editing?.nivel ?? "Operacional");
    setDescricao(editing?.descricao ?? "");
  }, [isOpen, editing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-8 pt-8 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-base font-black text-white">{editing ? "Editar Cargo" : "Novo Cargo"}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cadastro de cargo</div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Cargo</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Ex.: Vendedor, Gerente..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nível</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputClass}>
              <option value="Operacional">Operacional</option>
              <option value="Tático">Tático</option>
              <option value="Estratégico">Estratégico</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} placeholder="Opcional..." />
          </div>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (nome.trim()) { onSave({ nome: nome.trim(), nivel, descricao: descricao.trim() }); onClose(); } }}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20"
          >
            {editing ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
