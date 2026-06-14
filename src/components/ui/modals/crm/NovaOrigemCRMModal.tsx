import React, { useEffect, useMemo, useState } from "react";
import { Building2, Target, Plus } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";

type NovaOrigemPayload = {
  nome: string;
};

type NovaOrigemCRMModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NovaOrigemPayload) => void;
  title?: string;
  submitText?: string;
  initialValue?: Partial<NovaOrigemPayload> | null;
};

const labelClass = "text-xs font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

export function NovaOrigemCRMModal({
  isOpen,
  onClose,
  onSave,
  title = "Nova Origem",
  submitText = "Cadastrar Origem",
  initialValue,
}: NovaOrigemCRMModalProps) {
  const [nome, setNome] = useState(initialValue?.nome || "");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNome(initialValue?.nome || "");
    setTouched(false);
    setLoading(false);
  }, [isOpen, initialValue]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    return Boolean(nome.trim());
  }, [loading, nome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setLoading(true);
    try {
      onSave({ nome: nome.trim() });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mt-0.5">
            <Target className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black text-white">{title}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Origem de lead para o CRM
            </div>
          </div>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="nova-origem-crm-form"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6"
            disabled={!canSubmit}
          >
            {loading ? "Salvando..." : submitText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-[#0B1120]/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-bold">Como funciona</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Cadastre a origem usada no funil para classificar de onde vêm seus leads.
              </p>
            </div>
          </div>
        </div>

        <form
          id="nova-origem-crm-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="origem-nome" className={labelClass}>
              Nome da Origem
            </label>
            <input
              id="origem-nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputBaseClass}
              placeholder="Ex.: Indicação, Tráfego Pago, Orgânico"
              required
            />
            {touched && !nome.trim() && (
              <div className="text-[11px] text-rose-400 font-semibold">
                Informe o nome da origem.
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}

