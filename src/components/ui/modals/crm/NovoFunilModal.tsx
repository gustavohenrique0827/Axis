import React, { useEffect, useMemo, useState } from "react";
import { Building2, ListTodo, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type NovoFunilPayload = {
  nome: string;
  etapas: string[];
};

type NovoFunilModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NovoFunilPayload) => void;
  title?: string;
  submitText?: string;
  initialValue?: Partial<NovoFunilPayload> | null;
};

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

function normalizeStages(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function NovoFunilModal({
  isOpen,
  onClose,
  onSave,
  title = "Novo Funil",
  submitText = "Criar Funil",
  initialValue,
}: NovoFunilModalProps) {
  const [nome, setNome] = useState(initialValue?.nome || "");
  const [etapasText, setEtapasText] = useState(
    (initialValue?.etapas || []).join("\n")
  );
  const [touched, setTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNome(initialValue?.nome || "");
    setEtapasText((initialValue?.etapas || []).join("\n"));
    setTouched(false);
    setIsSubmitting(false);
  }, [isOpen, initialValue]);

  const etapas = useMemo(() => normalizeStages(etapasText), [etapasText]);

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!nome.trim()) return false;
    if (etapas.length < 1) return false;
    return true;
  }, [isSubmitting, nome, etapas.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      onSave({
        nome: nome.trim(),
        etapas,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mt-0.5">
            <ListTodo className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black text-white">{title}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Etapas e regras do pipeline
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="novo-funil-form"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Criando..." : submitText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-[#0B1120]/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-bold">Como funciona</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Informe o nome do funil e as etapas (1 por linha). Você pode ajustar depois.
              </p>
            </div>
          </div>
        </div>

        <form id="novo-funil-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="funil-nome" className={labelClass}>
              Nome do Funil
            </label>
            <input
              id="funil-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputBaseClass}
              placeholder="Ex.: Funil Comercial"
              required
            />
            {touched && !nome.trim() && (
              <div className="text-[11px] text-rose-400 font-semibold">
                Informe um nome para o funil.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="funil-etapas" className={labelClass}>
              Etapas (1 por linha)
            </label>
            <textarea
              id="funil-etapas"
              value={etapasText}
              onChange={(e) => setEtapasText(e.target.value)}
              rows={6}
              className={inputBaseClass}
              placeholder={`Qualificação\nReunião\nProposta\nNegociação\nGanho`}
              required
            />

            {touched && etapas.length === 0 && (
              <div className="text-[11px] text-rose-400 font-semibold">
                Informe ao menos 1 etapa.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-3 text-slate-400 hover:text-white border border-white/10 bg-white/5"
                onClick={() =>
                  setEtapasText((prev) =>
                    prev.trim().length
                      ? prev
                      : `Qualificação\nReunião\nProposta\nNegociação\nGanho`
                  )
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Preset
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {etapas.length} etapa(s)
              </div>
            </div>
          </div>

          <div className="bg-[#0B1120] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Prévia das etapas
            </div>
            <div className="space-y-2">
              {etapas.length > 0 ? (
                etapas.map((s, idx) => (
                  <div
                    key={`${s}-${idx}`}
                    className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm font-bold text-white truncate">{s}</span>
                    <span className="text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-sm">Nenhuma etapa definida.</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

