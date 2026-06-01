import React, { useEffect, useMemo, useState } from "react";
import { Brain, Zap, ShieldCheck } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type SdrCondition = "greater" | "less";

type SdrStageMap = Record<string, string>;

export type NovaRegraIAAutomacaoPayload = {
  name: string;
  scoreThreshold: number;
  condition: SdrCondition;
  targetStageId: string;
};

type NovaRegraIAAutomacaoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NovaRegraIAAutomacaoPayload) => void;
  title?: string;
  submitText?: string;
  initialValue?: Partial<NovaRegraIAAutomacaoPayload> | null;
  sdrStagesMap: SdrStageMap;
};

const inputBaseClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";
const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";

export function NovaRegraIAAutomacaoModal({
  isOpen,
  onClose,
  onSave,
  title = "Nova Regra IA",
  submitText = "Adicionar",
  initialValue,
  sdrStagesMap,
}: NovaRegraIAAutomacaoModalProps) {
  const [name, setName] = useState(initialValue?.name || "");
  const [scoreThreshold, setScoreThreshold] = useState<number>(
    typeof initialValue?.scoreThreshold === "number"
      ? initialValue.scoreThreshold
      : 80
  );
  const [condition, setCondition] = useState<SdrCondition>(
    (initialValue?.condition as SdrCondition) || "greater"
  );
  const [targetStageId, setTargetStageId] = useState<string>(
    initialValue?.targetStageId || Object.keys(sdrStagesMap)[0] || ""
  );

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValue?.name || "");
    setScoreThreshold(
      typeof initialValue?.scoreThreshold === "number"
        ? initialValue.scoreThreshold
        : 80
    );
    setCondition((initialValue?.condition as SdrCondition) || "greater");
    setTargetStageId(
      initialValue?.targetStageId || Object.keys(sdrStagesMap)[0] || ""
    );
    setTouched(false);
    setLoading(false);
  }, [isOpen, initialValue, sdrStagesMap]);

  const scoreOk = useMemo(() => {
    return scoreThreshold >= 0 && scoreThreshold <= 100;
  }, [scoreThreshold]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!scoreOk) return false;
    if (!targetStageId) return false;
    return !loading;
  }, [name, scoreOk, targetStageId, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setLoading(true);
    try {
      onSave({
        name: name.trim(),
        scoreThreshold: Number(scoreThreshold),
        condition,
        targetStageId,
      });
      onClose();
    } finally {
      setLoading(false);
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
            <Brain className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black text-white">{title}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Regra para mover leads automaticamente no funil SDR
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
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="nova-regra-ia-form"
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
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-bold">Como funciona</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Quando o <strong>Lead Score IA</strong> atingir a condição definida, o sistema move o lead automaticamente para a etapa SDR escolhida.
              </p>
            </div>
          </div>
        </div>

        <form id="nova-regra-ia-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="regra-ia-nome" className={labelClass}>
              Nome da Regra
            </label>
            <input
              id="regra-ia-nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBaseClass}
              placeholder="Ex.: Leads altamente qualificados para reunião"
              required
            />
            {touched && !name.trim() && (
              <div className="text-[11px] text-rose-400 font-semibold">
                Informe um nome.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="regra-ia-condicao" className={labelClass}>
                Condição
              </label>
              <select
                id="regra-ia-condicao"
                value={condition}
                onChange={(e) => setCondition(e.target.value as SdrCondition)}
                className={inputBaseClass + " pr-10"}
              >
                <option value="greater">Maior ou Igual</option>
                <option value="less">Menor ou Igual</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="regra-ia-score" className={labelClass}>
                Score Alvo (0-100)
              </label>
              <input
                id="regra-ia-score"
                type="number"
                min={0}
                max={100}
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                className={inputBaseClass}
                placeholder="80"
                required
              />
              {touched && !scoreOk && (
                <div className="text-[11px] text-rose-400 font-semibold">
                  Score deve estar entre 0 e 100.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="regra-ia-etapa" className={labelClass}>
              Mover para etapa SDR
            </label>
            <select
              id="regra-ia-etapa"
              value={targetStageId}
              onChange={(e) => setTargetStageId(e.target.value)}
              className={inputBaseClass + " pr-10"}
              required
            >
              {Object.entries(sdrStagesMap).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#0B1120] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Prévia da regra
            </div>
            <div className="text-sm text-white font-bold">
              Se Lead Score {condition === "greater" ? "≥" : "≤"} {scoreThreshold} →
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Mover para: <span className="text-blue-400 font-black">{sdrStagesMap[targetStageId] || targetStageId}</span>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

