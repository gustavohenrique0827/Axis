import { useState, useRef, useEffect } from "react";
import { Mic, Monitor, RefreshCw, Brain } from "lucide-react";

type InputMode = "microfone" | "whatsapp";
type CopilotState = "idle" | "listening" | "analyzing" | "done";

interface IACopilotProps {
  leadName?: string;
  companyName?: string;
}

export function IACopilot({ leadName, companyName }: IACopilotProps) {
  const [inputMode, setInputMode] = useState<InputMode>("microfone");
  const [state, setState] = useState<CopilotState>("idle");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + " ";
      }
      setTranscript(full.trim());
    };

    recognition.onerror = () => setState("idle");
    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

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

  const toggleListening = () => {
    if (state === "listening") stopListening();
    else startListening();
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setState("analyzing");

    await new Promise((r) => setTimeout(r, 1200));

    const nome = leadName || "Lead";
    const empresa = companyName || "empresa";

    const result = `## Análise BANT — ${nome} (${empresa})

**Budget (Orçamento):** ${
      transcript.toLowerCase().includes("orçamento") ||
      transcript.toLowerCase().includes("preço") ||
      transcript.toLowerCase().includes("valor")
        ? "Mencionado na conversa — qualifique o teto disponível."
        : "Não identificado. Pergunte sobre budget disponível."
    }

**Authority (Autoridade):** ${
      transcript.toLowerCase().includes("diretor") ||
      transcript.toLowerCase().includes("ceo") ||
      transcript.toLowerCase().includes("decisão")
        ? "Tomador de decisão presente ou citado."
        : "Verifique se o interlocutor tem poder de decisão."
    }

**Need (Necessidade):** ${
      transcript.toLowerCase().includes("problema") ||
      transcript.toLowerCase().includes("precis") ||
      transcript.toLowerCase().includes("dificuldade")
        ? "Dor identificada. Aprofunde com perguntas abertas."
        : "Necessidade não clara. Explore os desafios atuais."
    }

**Timeline (Prazo):** ${
      transcript.toLowerCase().includes("mês") ||
      transcript.toLowerCase().includes("semana") ||
      transcript.toLowerCase().includes("prazo") ||
      transcript.toLowerCase().includes("urgente")
        ? "Urgência detectada — avance para proposta."
        : "Sem prazo definido. Crie urgência com valor/benefício."
    }

---
*Análise gerada a partir da transcrição capturada.*`;

    setAnalysis(result);
    setState("done");
  };

  const reset = () => {
    stopListening();
    setTranscript("");
    setAnalysis(null);
    setState("idle");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white">IA Copilot</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {leadName || "Lead"}
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#0B1120]">
        <button
          onClick={() => setInputMode("microfone")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all ${
            inputMode === "microfone"
              ? "bg-[#1E293B] text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Microfone
        </button>
        <button
          onClick={() => setInputMode("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all ${
            inputMode === "whatsapp"
              ? "bg-[#1E293B] text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          WhatsApp / PC
        </button>
      </div>

      {/* Action buttons */}
      {inputMode === "microfone" ? (
        <div className="flex gap-2">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black border transition-all ${
              state === "listening"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-pulse"
                : "bg-[#0B1120] border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${state === "listening" ? "animate-pulse" : ""}`} />
            {state === "listening" ? "Ouvindo..." : "Ouvir microfone"}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={!transcript.trim() || state === "analyzing"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${state === "analyzing" ? "animate-spin" : ""}`} />
            Analisar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Cole o texto da conversa
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Cole aqui o histórico do WhatsApp ou conversa..."
            rows={5}
            className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none resize-none placeholder:text-slate-600"
          />
          <button
            onClick={handleAnalyze}
            disabled={!transcript.trim() || state === "analyzing"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${state === "analyzing" ? "animate-spin" : ""}`} />
            Analisar
          </button>
        </div>
      )}

      {/* Transcript preview */}
      {transcript && state !== "done" && inputMode === "microfone" && (
        <div className="bg-[#0B1120]/60 border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Transcrição
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Idle state illustration */}
      {state === "idle" && !transcript && !analysis && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Brain className="w-12 h-12 text-slate-700" />
          <p className="text-sm font-bold text-slate-500 text-center">
            {inputMode === "microfone"
              ? 'Clique em "Ouvir microfone" para capturar'
              : 'Cole o texto para analisar'}
          </p>
          <p className="text-[11px] text-slate-600 text-center">
            Qualificação BANT · Dados comerciais · Histórico
          </p>
        </div>
      )}

      {/* Analyzing */}
      {state === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-bold text-purple-300">Analisando conversa...</p>
        </div>
      )}

      {/* Analysis result */}
      {analysis && (
        <div className="bg-[#0B1120]/80 border border-purple-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
              Resultado da Análise
            </p>
            <button
              onClick={reset}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold transition-all"
            >
              Nova análise
            </button>
          </div>
          <div className="prose prose-invert prose-xs max-w-none">
            {analysis.split("\n").map((line, i) => {
              if (line.startsWith("## "))
                return (
                  <p key={i} className="text-sm font-black text-white mb-2">
                    {line.replace("## ", "")}
                  </p>
                );
              if (line.startsWith("**") && line.includes(":**"))
                return (
                  <p key={i} className="text-xs text-slate-200 leading-relaxed mb-1">
                    <span className="font-black text-purple-300">
                      {line.match(/\*\*(.*?)\*\*/)?.[1]}:
                    </span>{" "}
                    {line.replace(/\*\*(.*?)\*\*:\s*/, "")}
                  </p>
                );
              if (line.startsWith("---"))
                return <hr key={i} className="border-white/10 my-3" />;
              if (line.startsWith("*") && line.endsWith("*"))
                return (
                  <p key={i} className="text-[10px] text-slate-500 italic">
                    {line.replace(/\*/g, "")}
                  </p>
                );
              return line ? (
                <p key={i} className="text-xs text-slate-300">
                  {line}
                </p>
              ) : (
                <div key={i} className="h-1" />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
