export interface StageConfig {
  nome: string;
  cor: string;
  iniciarMinimizado: boolean;
}

export interface Funil {
  id: string;
  nome: string;
  tipo: "sdr_ia" | "comercial";
  etapas: string[];
  etapasConfig?: StageConfig[];
  ativo: boolean;
  clientIds?: string[];
  sdrEtapaEntrada: string;
  sdrEtapaHandoff: string;
  sdrScoreMinimo: number;
  sdrDelayResposta: number;
  sdrMsgBoasVindas: string;
  sdrCriterioDesqualificacao: string;
}

export const FUNIS_DEFAULT: Funil[] = [
  {
    id: "funil-comercial-default",
    nome: "Funil Comercial Principal",
    tipo: "comercial",
    etapas: ["Prospecção", "Qualificação", "Apresentação", "Negociação", "Fechamento"],
    ativo: true,
    sdrEtapaEntrada: "",
    sdrEtapaHandoff: "",
    sdrScoreMinimo: 65,
    sdrDelayResposta: 2,
    sdrMsgBoasVindas: "",
    sdrCriterioDesqualificacao: "sem_interesse",
  },
  {
    id: "funil-sdr-ia-default",
    nome: "Funil SDR IA — MIA-6",
    tipo: "sdr_ia",
    etapas: ["Triagem SDR", "Contato Efetuado", "Qualificação SDR", "Reunião Agendada", "Promovido Closer"],
    ativo: true,
    sdrEtapaEntrada: "Triagem SDR",
    sdrEtapaHandoff: "Promovido Closer",
    sdrScoreMinimo: 65,
    sdrDelayResposta: 2,
    sdrMsgBoasVindas: "Olá! Sou a MIA, assistente comercial da Axis. Poderia me contar um pouco sobre o seu desafio atual?",
    sdrCriterioDesqualificacao: "sem_interesse",
  },
];

export const CORES_LISTA = ["blue", "orange", "cyan", "emerald", "purple", "rose", "amber", "indigo", "pink", "slate"];

export const ETAPA_CORES: Record<string, { dot: string; top: string }> = {
  slate:   { dot: "#64748b", top: "#334155" },
  blue:    { dot: "#3b82f6", top: "#2563eb" },
  orange:  { dot: "#f97316", top: "#ea580c" },
  cyan:    { dot: "#06b6d4", top: "#0891b2" },
  emerald: { dot: "#10b981", top: "#059669" },
  purple:  { dot: "#a855f7", top: "#9333ea" },
  rose:    { dot: "#f43f5e", top: "#e11d48" },
  amber:   { dot: "#f59e0b", top: "#d97706" },
  indigo:  { dot: "#6366f1", top: "#4f46e5" },
  pink:    { dot: "#ec4899", top: "#db2777" },
};

export function initStageConfigs(etapas: string[], existing?: StageConfig[]): StageConfig[] {
  return etapas.map((nome, i) => {
    const ex = existing?.find(e => e.nome === nome);
    return ex ?? { nome, cor: CORES_LISTA[i % CORES_LISTA.length], iniciarMinimizado: false };
  });
}

const SDR_DEFAULT = FUNIS_DEFAULT.find(f => f.id === "funil-sdr-ia-default")!;
const COMERCIAL_DEFAULT = FUNIS_DEFAULT.find(f => f.id === "funil-comercial-default")!;

export function migrateFunis(saved: Funil[]): Funil[] {
  let changed = false;
  const out = saved.map(f => {
    if (f.id === "funil-sdr-ia-default") {
      const expected = SDR_DEFAULT.etapas;
      const isCurrent = JSON.stringify(f.etapas) === JSON.stringify(expected);
      if (!isCurrent) { changed = true; return { ...SDR_DEFAULT, ativo: f.ativo }; }
    }
    return f;
  });
  const hasSdr = out.some(f => f.id === "funil-sdr-ia-default");
  const hasComercial = out.some(f => f.id === "funil-comercial-default");
  if (!hasSdr) { out.unshift(SDR_DEFAULT); changed = true; }
  if (!hasComercial) { out.unshift(COMERCIAL_DEFAULT); changed = true; }
  if (changed) localStorage.setItem("axis_funis_config", JSON.stringify(out));
  return out;
}
