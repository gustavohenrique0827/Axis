import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, RefreshCw, Brain, Zap, AlertTriangle, CheckCircle2, HelpCircle, Clock } from "lucide-react";
import { apiFetch } from "../../lib/apiClient";

type CopilotState = "idle" | "listening" | "analyzing" | "done" | "error";

export interface LeadContext {
  name?: string;
  company?: string;
  iaSummary?: string;
  scoreIA?: number;
  temperature?: string;
  lead_interesse?: string;
  pauta?: string;
}

interface IACopilotProps {
  leadName?: string;
  companyName?: string;
  leadContext?: LeadContext;
  onTranscriptChange?: (t: string) => void;
}

interface BantItem {
  status: "identificado" | "parcial" | "nao_identificado";
  nota: string;
}

interface CopilotAnalysis {
  bant?: {
    budget?: BantItem;
    authority?: BantItem;
    need?: BantItem;
    timeline?: BantItem;
  };
  score_fechamento?: number;
  objecoes_detectadas?: string[];
  proxima_acao?: string;
  pergunta_poderosa?: string;
  alerta?: string;
}

const STATUS_ICON: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  identificado:      { icon: CheckCircle2, color: "text-emerald-400", label: "Confirmado" },
  parcial:           { icon: HelpCircle,   color: "text-amber-400",   label: "Parcial" },
  nao_identificado:  { icon: AlertTriangle, color: "text-rose-400",   label: "Pendente" },
};

export function IACopilot({ leadName, companyName, leadContext, onTranscriptChange }: IACopilotProps) {
  const [state, setState] = useState<CopilotState>("idle");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<CopilotAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef<any>(null);

  const ctx: LeadContext = leadContext ?? { name: leadName, company: companyName };

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Reconhecimento de voz não suportado. Use Chrome.");
      setState("error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
      const t = full.trim();
      setTranscript(t);
      onTranscriptChange?.(t);
    };
    recognition.onerror = () => setState("idle");
    recognition.onend = () => { if (state === "listening") setState("idle"); };
    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
    setAnalysis(null);
    setTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState("idle");
  };

  const toggleListening = () => (state === "listening" ? stopListening() : startListening());

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setState("analyzing");
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/ai/reuniao-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, leadContext: ctx }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setAnalysis(data.analysis ?? null);
      setState("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha ao analisar");
      setState("error");
    }
  };

  const reset = () => {
    stopListening();
    setTranscript("");
    setAnalysis(null);
    setState("idle");
    setErrorMsg("");
    onTranscriptChange?.("");
  };

  const scoreColor = (s?: number) =>
    !s ? "text-slate-400" : s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="flex flex-col gap-3 p-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Copilot IA</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate max-w-[130px]">
              {ctx.name || "Lead"}
            </p>
          </div>
        </div>
        {(state === "done" || state === "error") && (
          <button onClick={reset} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mic toggle */}
      <button
        onClick={toggleListening}
        disabled={state === "analyzing"}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
          state === "listening"
            ? "bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse"
            : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20"
        }`}
      >
        {state === "listening" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {state === "listening" ? "Parar Gravação" : "Iniciar Escuta"}
      </button>

      {/* Live transcript */}
      {(state === "listening" || transcript) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 max-h-32 overflow-y-auto">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            {state === "listening" && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />}
            Transcrição ao vivo
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {transcript || <span className="text-slate-600 italic">Aguardando fala...</span>}
          </p>
        </div>
      )}

      {/* Analyze button */}
      {transcript && state !== "analyzing" && state !== "done" && (
        <button
          onClick={handleAnalyze}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <Zap className="w-3.5 h-3.5" /> Analisar Agora
        </button>
      )}

      {/* Analyzing spinner */}
      {state === "analyzing" && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Analisando...</p>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <p className="text-[11px] text-rose-400">{errorMsg}</p>
        </div>
      )}

      {/* Analysis results */}
      {analysis && state === "done" && (
        <div className="space-y-3">

          {/* Score fechamento */}
          {analysis.score_fechamento !== undefined && (
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chance de Fechar</span>
              <span className={`text-lg font-black ${scoreColor(analysis.score_fechamento)}`}>
                {analysis.score_fechamento}%
              </span>
            </div>
          )}

          {/* BANT */}
          {analysis.bant && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">BANT</p>
              {(["budget", "authority", "need", "timeline"] as const).map((key) => {
                const item = analysis.bant![key];
                if (!item) return null;
                const cfg = STATUS_ICON[item.status] ?? STATUS_ICON.parcial;
                const Icon = cfg.icon;
                const labels: Record<string, string> = { budget: "Budget", authority: "Autoridade", need: "Necessidade", timeline: "Prazo" };
                return (
                  <div key={key} className="flex items-start gap-2 px-2.5 py-2 bg-white/[0.02] rounded-lg">
                    <Icon className={`w-3 h-3 shrink-0 mt-0.5 ${cfg.color}`} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-500 uppercase">{labels[key]}</p>
                      <p className="text-[10px] text-slate-300 leading-snug">{item.nota}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Objeções */}
          {analysis.objecoes_detectadas?.length ? (
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Objeções</p>
              {analysis.objecoes_detectadas.map((o, i) => (
                <div key={i} className="flex items-start gap-1.5 px-2.5 py-1.5 bg-amber-500/[0.07] border border-amber-500/15 rounded-lg">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-200">{o}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Próxima ação */}
          {analysis.proxima_acao && (
            <div className="px-3 py-2.5 bg-blue-500/[0.08] border border-blue-500/15 rounded-xl">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Próxima Ação
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.proxima_acao}</p>
            </div>
          )}

          {/* Pergunta poderosa */}
          {analysis.pergunta_poderosa && (
            <div className="px-3 py-2.5 bg-violet-500/[0.08] border border-violet-500/15 rounded-xl">
              <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-1">Pergunte Agora</p>
              <p className="text-[11px] text-slate-200 leading-relaxed italic">"{analysis.pergunta_poderosa}"</p>
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
    </div>
  );
}
