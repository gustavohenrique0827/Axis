import { useState, useEffect } from "react";
import {
  Brain, Sparkles, RefreshCw, X, Zap, AlertTriangle,
  MessageSquare, ChevronDown, ChevronUp, Copy, Lightbulb,
  TrendingUp, Thermometer, Target, Package,
} from "lucide-react";
import { toast } from "sonner";

interface LeadCopilotContext {
  name?: string;
  company?: string;
  iaSummary?: string;
  scoreIA?: number;
  temperature?: string;
  lead_interesse?: string;
  stage?: string;
  lastContact?: string;
  product?: string;
}

interface LeadCopilotAnalysis {
  recomendacao_proximo_passo?: string;
  abordagem_ideal?: string;
  objecoes_previstas?: string[];
  pergunta_abertura?: string;
  probabilidade_fechamento?: number;
  alerta?: string;
  resumo_curto?: string;
}

interface LeadCopilotProps {
  leadContext: LeadCopilotContext;
  onClose?: () => void;
}

const TEMP_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "Quente":  { label: "Quente",  color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20"    },
  "Morno":   { label: "Morno",   color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  "Frio":    { label: "Frio",    color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  "Gelado":  { label: "Gelado",  color: "text-sky-300",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
};

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Brain; label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="flex items-center gap-2 text-[11px] text-slate-400">
        <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        {label}
      </span>
      <span className={`text-[11px] font-semibold ${value ? "text-slate-200" : "text-slate-600"}`}>
        {value ?? "Não coletado"}
      </span>
    </div>
  );
}

export function LeadCopilot({ leadContext, onClose }: LeadCopilotProps) {
  const [analysis, setAnalysis] = useState<LeadCopilotAnalysis | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showRecomendacoes, setShowRecomendacoes] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/lead-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadContext }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Erro desconhecido");
      setAnalysis(data.analysis ?? null);
    } catch (err: any) {
      setError(err.message ?? "Falha ao carregar inteligência do lead.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadContext?.name || leadContext?.company) analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadContext?.name, leadContext?.company]);

  const tempCfg = TEMP_CFG[leadContext.temperature ?? ""] ?? null;

  const prob = analysis?.probabilidade_fechamento;
  const probColor =
    prob === undefined ? "text-slate-400"
    : prob >= 70 ? "text-emerald-400"
    : prob >= 40 ? "text-amber-400"
    : "text-rose-400";

  const scoreBarWidth = prob !== undefined ? `${Math.min(prob, 100)}%` : "0%";
  const scoreBarColor =
    prob === undefined ? "bg-slate-700"
    : prob >= 70 ? "bg-emerald-500"
    : prob >= 40 ? "bg-amber-500"
    : "bg-rose-500";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copiado!"));
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white flex items-center gap-1.5">
              Lead Copilot
              <span className="inline-flex items-center gap-0.5 text-[7px] font-black bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                <Sparkles className="w-2 h-2" /> IA
              </span>
            </p>
            <p className="text-[9px] text-slate-500 truncate max-w-[160px]">
              {leadContext.company || leadContext.name || "Lead"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={analyze}
            disabled={loading}
            title="Reanalisar"
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-violet-400 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Body (scrollable) ── */}
      <div className="flex-1 overflow-y-auto space-y-0">

        {/* ── Analisar button ── */}
        <div className="px-4 pt-4 pb-3">
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-widest transition-all"
          >
            {loading
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Zap className="w-3.5 h-3.5" />
            }
            {loading ? "Analisando..." : "Analisar Lead"}
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="w-7 h-7 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Processando perfil...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="mx-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-[10px] text-rose-400 leading-relaxed">{error}</p>
            <button onClick={analyze} className="mt-2 text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest">
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── QUALIFICAÇÃO DO LEAD section ── */}
        {!loading && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Qualificação do Lead</p>
              {tempCfg && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${tempCfg.color} ${tempCfg.bg} ${tempCfg.border}`}>
                  {tempCfg.label}
                </span>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3">
              <ProfileRow icon={Thermometer} label="Temperatura"  value={leadContext.temperature} />
              <ProfileRow icon={Target}      label="Interesse"    value={leadContext.lead_interesse} />
              <ProfileRow icon={TrendingUp}  label="Score IA"     value={leadContext.scoreIA !== undefined ? `${leadContext.scoreIA}/10` : undefined} />
              <ProfileRow icon={Package}     label="Produto"      value={leadContext.product} />
            </div>

            {/* Probabilidade de fechamento */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Prob. Fechamento</span>
                <span className={`text-sm font-black tabular-nums ${probColor}`}>
                  {prob !== undefined ? `${prob}%` : "—"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreBarColor}`}
                  style={{ width: scoreBarWidth }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Analysis content ── */}
        {analysis && !loading && (
          <>
            {/* Resumo */}
            {analysis.resumo_curto && (
              <div className="mx-4 mb-4 px-3 py-2.5 bg-violet-500/[0.07] border border-violet-500/15 rounded-xl">
                <p className="text-[10px] text-slate-300 leading-relaxed">{analysis.resumo_curto}</p>
              </div>
            )}

            {/* PERGUNTAS SUGERIDAS */}
            {(analysis.pergunta_abertura || (analysis.objecoes_previstas?.length ?? 0) > 0) && (
              <div className="px-4 pb-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3" /> Perguntas Sugeridas
                </p>
                <div className="space-y-2">
                  {analysis.pergunta_abertura && (
                    <button
                      onClick={() => copyToClipboard(analysis.pergunta_abertura!)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/[0.07] rounded-xl text-left hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
                    >
                      <p className="text-[10px] text-slate-300 leading-snug flex-1">{analysis.pergunta_abertura}</p>
                      <Copy className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                    </button>
                  )}
                  {analysis.objecoes_previstas?.slice(0, 2).map((objecao, i) => (
                    <button
                      key={i}
                      onClick={() => copyToClipboard(`Como você prefere lidar com: "${objecao}"?`)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/[0.07] rounded-xl text-left hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
                    >
                      <p className="text-[10px] text-amber-300/80 leading-snug flex-1 italic">"{objecao}"</p>
                      <Copy className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMENDAÇÕES (colapsível) */}
            {(analysis.recomendacao_proximo_passo || analysis.abordagem_ideal || analysis.alerta) && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowRecomendacoes((v) => !v)}
                  className="w-full flex items-center justify-between py-2 border-t border-white/[0.05]"
                >
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Recomendações
                  </p>
                  {showRecomendacoes
                    ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                    : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  }
                </button>

                {showRecomendacoes && (
                  <div className="space-y-2 mt-2">
                    {analysis.recomendacao_proximo_passo && (
                      <div className="px-3 py-2.5 bg-blue-500/[0.07] border border-blue-500/15 rounded-xl">
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Próximo Passo</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.recomendacao_proximo_passo}</p>
                      </div>
                    )}
                    {analysis.abordagem_ideal && (
                      <div className="px-3 py-2.5 bg-emerald-500/[0.07] border border-emerald-500/15 rounded-xl">
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Abordagem Ideal</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.abordagem_ideal}</p>
                      </div>
                    )}
                    {analysis.alerta && (
                      <div className="px-3 py-2 bg-rose-500/[0.08] border border-rose-500/15 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-rose-300 leading-relaxed">{analysis.alerta}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && !analysis && (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
            <Brain className="w-8 h-8 text-slate-700" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Clique em <strong className="text-slate-500">Analisar Lead</strong> para gerar inteligência sobre este contato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
