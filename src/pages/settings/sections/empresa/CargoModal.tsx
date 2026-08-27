import React, { useState } from "react";
import { Briefcase, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface CargoFormData { nome: string; nivel: string; descricao: string }

interface CargoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (d: CargoFormData) => void;
  editing: any | null;
}

const inputClass = "w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all";
const labelClass = "text-xs font-bold text-[var(--color-text-muted)] mb-1 block";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">{editing ? "Editar Cargo" : "Novo Cargo"}</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Estrutura organizacional</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome do Cargo *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Ex: SDR, Closer, Gerente Comercial..." />
          </div>
          <div>
            <label className={labelClass}>Nível Hierárquico</label>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputClass}>
              <option value="Operacional">Operacional</option>
              <option value="Tático">Tático</option>
              <option value="Estratégico">Estratégico</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Descrição / Responsabilidades</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Descreva as atribuições principais deste cargo..." />
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border-subtle)] flex justify-end gap-2 bg-[var(--color-surface-sunken)]">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => { if (nome.trim()) { onSave({ nome: nome.trim(), nivel, descricao: descricao.trim() }); onClose(); } }}
            className="h-9 px-5 text-xs font-bold shadow-xs"
          >
            {editing ? "Salvar Alterações" : "Cadastrar Cargo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
