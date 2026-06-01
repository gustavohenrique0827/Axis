import React, { useEffect, useMemo, useState } from "react";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type PerfilPermissaoPayload = {
  nome: string;
  modulos: string[];
};

type NovoPerfilPermissaoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: PerfilPermissaoPayload) => void;
  title?: string;
  submitText?: string;
  initialValue?: Partial<PerfilPermissaoPayload> | null;
};

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

function normalizeModulesCSV(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function NovoPerfilPermissaoModal({
  isOpen,
  onClose,
  onSave,
  initialValue,
  title = "Novo Perfil",
  submitText = "Cadastrar Perfil",
}: NovoPerfilPermissaoModalProps) {
  const [nome, setNome] = useState(initialValue?.nome || "");
  const [modulesCsv, setModulesCsv] = useState(
    (initialValue?.modulos || []).join(", ")
  );
  const [touched, setTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNome(initialValue?.nome || "");
    setModulesCsv((initialValue?.modulos || []).join(", "));
    setTouched(false);
    setIsSubmitting(false);
  }, [isOpen, initialValue]);

  const modules = useMemo(() => normalizeModulesCSV(modulesCsv), [modulesCsv]);

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!nome.trim()) return false;
    if (modules.length === 0) return false;
    return true;
  }, [isSubmitting, nome, modules.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      onSave({
        nome: nome.trim(),
        modulos: modules,
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
            <Building2 className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black text-white">{title}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Permissões e módulos de acesso
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
            form="novo-perfil-permissoes-form"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Salvando..." : submitText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-[#0B1120]/40 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-bold">Como funciona</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Defina um nome e uma lista de módulos separados por vírgula. O sistema usará essa lista para controlar o acesso.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Ex.: crm, financeiro, engajamento
              </div>
            </div>
          </div>
        </div>

        <form
          id="novo-perfil-permissoes-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="perfil-nome" className={labelClass}>
                Nome do Perfil
              </label>
              <input
                id="perfil-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputBaseClass}
                placeholder="Ex.: Admin Master"
                required
              />
              {touched && !nome.trim() && (
                <div className="text-[11px] text-rose-400 font-semibold">Informe um nome.</div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="perfil-modulos" className={labelClass}>
                Módulos de Acesso (CSV)
              </label>
              <input
                id="perfil-modulos"
                value={modulesCsv}
                onChange={(e) => setModulesCsv(e.target.value)}
                className={inputBaseClass}
                placeholder="crm, financeiro, engajamento"
                required
              />
              {touched && modules.length === 0 && (
                <div className="text-[11px] text-rose-400 font-semibold">
                  Informe ao menos 1 módulo (separado por vírgula).
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0B1120] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Prévia dos módulos
            </div>
            <div className="flex flex-wrap gap-2">
              {modules.length > 0 ? (
                modules.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-200 text-[11px] font-bold"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[11px]">Nenhum módulo informado.</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

