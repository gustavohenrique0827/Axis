import { useState, useEffect } from "react";
import {
  Brain, Sparkles, RefreshCw, TrendingUp, Target,
  AlertTriangle, MessageSquare, Zap, ChevronDown, ChevronUp,
} from "lucide-react";

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
}

export function LeadCopilot({ leadContext }: LeadCopilotProps) {
  const [analysis, setAnalysis] = useState<LeadCopilotAnalysis | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showObjecoes, setShowObjecoes] = useState(false);

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

  // Auto-analyze on open or when lead changes
  useEffect(() => {
    if (leadContext?.name || leadContext?.company) analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadContext?.name, leadContext?.company]);

  const scoreColor = (s?: number) =>
    !s ? "text-slate-400"
    : s >= 70 ? "text-emerald-400"
    : s >= 40 ? "text-amber-400"
    : "text-rose-400";

  return (
    <div className="flex flex-col gap-3 p-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-black text-white flex items-center gap-1.5">
              Lead Intelligence
              <span className="inline-flex items-center gap-0.5 text-[7px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                <Sparkles className="w-2 h-2" /> IA
              </span>
            </p>
            <p className="text-[9px] text-slate-500 truncate max-w-[150px]">
              {leadContext.company || leadContext.name || "Lead"}
            </p>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          title="Reanalisar"
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Analisando perfil...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <p className="text-[10px] text-rose-400 leading-relaxed">{error}</p>
          <button
            onClick={analyze}
            className="mt-2 text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Analysis */}
      {analysis && !loading && (
        <div className="space-y-2.5">

          {/* Probabilidade de fechamento */}
          {analysis.probabilidade_fechamento !== undefined && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Prob. Fechamento
              </span>
              <span className={`text-xl font-black tabular-nums ${scoreColor(analysis.probabilidade_fechamento)}`}>
                {analysis.probabilidade_fechamento}%
              </span>
            </div>
          )}

          {/* Resumo curto */}
          {analysis.resumo_curto && (
            <div className="px-3 py-2.5 bg-cyan-500/[0.06] border border-cyan-500/15 rounded-xl">
              <p className="text-[10px] text-slate-300 leading-relaxed">{analysis.resumo_curto}</p>
            </div>
          )}

          {/* Próximo passo */}
          {analysis.recomendacao_proximo_passo && (
            <div className="px-3 py-2.5 bg-blue-500/[0.07] border border-blue-500/15 rounded-xl">
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Próximo Passo
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.recomendacao_proximo_passo}</p>
            </div>
          )}

          {/* Abordagem ideal */}
          {analysis.abordagem_ideal && (
            <div className="px-3 py-2.5 bg-violet-500/[0.07] border border-violet-500/15 rounded-xl">
              <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Abordagem Ideal
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.abordagem_ideal}</p>
            </div>
          )}

          {/* Pergunta de abertura */}
          {analysis.pergunta_abertura && (
            <div className="px-3 py-2.5 bg-emerald-500/[0.07] border border-emerald-500/15 rounded-xl">
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Pergunta de Abertura
              </p>
              <p className="text-[11px] text-slate-200 leading-relaxed italic">
                "{analysis.pergunta_abertura}"
              </p>
            </div>
          )}

          {/* Objeções previstas */}
          {analysis.objecoes_previstas && analysis.objecoes_previstas.length > 0 && (
            <div>
              <button
                onClick={() => setShowObjecoes((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 bg-amber-500/[0.07] border border-amber-500/15 rounded-xl"
              >
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Objeções Previstas ({analysis.objecoes_previstas.length})
                </span>
                {showObjecoes
                  ? <ChevronUp className="w-3 h-3 text-amber-400" />
                  : <ChevronDown className="w-3 h-3 text-amber-400" />
                }
              </button>
              {showObjecoes && (
                <div className="space-y-1.5 mt-1.5">
                  {analysis.objecoes_previstas.map((o, i) => (
                    <div key={i} className="flex items-start gap-1.5 px-2.5 py-1.5 bg-amber-500/[0.05] border border-amber-500/10 rounded-lg">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-200 leading-snug">{o}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerta */}
          {analysis.alerta && (
            <div className="px-3 py-2 bg-rose-500/[0.08] border border-rose-500/15 rounded-xl">
              <p className="text-[10px] text-rose-300 leading-relaxed">{analysis.alerta}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !analysis && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Brain className="w-8 h-8 text-slate-700" />
          <p className="text-[10px] text-slate-600">Clique em atualizar para analisar.</p>
        </div>
      )}
    </div>
  );
}
