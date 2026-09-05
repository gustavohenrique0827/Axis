import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/apiClient";

export type AuroraMeetingStatus = "idle" | "listening" | "analyzing" | "error";

export interface AuroraMeetingMessage {
  id: string;
  at: string;
  spoken: boolean;
  text: string;
}

interface LeadContextLike {
  name?: string;
  company?: string;
  iaSummary?: string;
  scoreIA?: number;
  temperature?: string;
  lead_interesse?: string;
  pauta?: string;
}

const CYCLE_MS = 90_000;
const FALAR_PREFIX = /^FALAR:\s*/i;

/**
 * Presença contínua da Aurora numa reunião: liga o microfone sozinha (sem precisar de um
 * "Iniciar Escuta" manual), manda o trecho NOVO da transcrição pra Aurora a cada ciclo, e só
 * repassa pra falar em voz alta (via onSpeak) quando ela mesma decide que vale a pena — o
 * resto vira só uma nota interna no painel. Substitui o antigo IACopilot.tsx (BANT genérico,
 * IA separada da Aurora) — aqui é sempre a Aurora de verdade (mesmo agente/ferramentas do
 * /api/ai/aurora-chat), só que chamada em ciclo em vez de em clique único.
 */
export function useAuroraMeetingPresence(
  reuniaoId: string | undefined,
  leadContext: LeadContextLike,
  active: boolean,
  onSpeak: (audioBase64: string, text: string) => void,
  onTranscriptChange?: (transcript: string) => void
) {
  const [status, setStatus] = useState<AuroraMeetingStatus>("idle");
  const [messages, setMessages] = useState<AuroraMeetingMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const lastSentIndexRef = useRef(0);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyzingRef = useRef(false);

  const sessionId = reuniaoId ? `aurora-reuniao-${reuniaoId}` : undefined;

  const runCycle = useCallback(async () => {
    if (!sessionId || analyzingRef.current) return;
    const novo = transcriptRef.current.slice(lastSentIndexRef.current).trim();
    if (!novo) return;

    analyzingRef.current = true;
    setStatus("analyzing");

    const contextoLead = leadContext.name
      ? `Cliente/Lead: ${leadContext.name}${leadContext.company ? ` (${leadContext.company})` : ""}\n`
      : "";

    // Regra de silêncio: por padrão ela fica muda (só registra observação interna) — só fala
    // em voz alta quando decide que vale a pena interromper. Quando decide falar, a resposta
    // inteira TEM que ser só a fala (o áudio devolvido pelo webhook narra o texto inteiro que
    // ela mandar, então não dá pra misturar raciocínio interno com a fala na mesma resposta).
    const message = `Você está ouvindo esta reunião ao vivo, em segundo plano (ciclo automático, não é uma pergunta direta minha). Isto é uma atualização incremental — você já pode ter registrado algo nesta mesma conversa antes; nunca duplique lead/tarefa/projeto já criados, só atualize ou complemente quando fizer sentido.\n\n${contextoLead}${leadContext.pauta ? `Pauta: ${leadContext.pauta}\n` : ""}\nTrecho novo da transcrição desde o último ciclo:\n"""\n${novo}\n"""\n\nSe você achar que vale a pena interromper agora com algo em voz alta pro closer/cliente (um alerta importante, uma objeção forte que precisa de resposta, uma pergunta poderosa no momento certo) — responda SOMENTE com "FALAR: " seguido exatamente do que você quer dizer em voz alta, nada mais. Caso contrário, responda só com uma nota interna curta (o que você observou, e o que registrou no S.P.Y. se registrou algo) — sem o prefixo FALAR.`;

    try {
      const res = await apiFetch("/api/ai/aurora-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Aurora está indisponível agora.");

      lastSentIndexRef.current = transcriptRef.current.length;
      const output: string = data.output ?? "";
      const falarMatch = FALAR_PREFIX.test(output);
      const text = output.replace(FALAR_PREFIX, "").trim();

      if (text) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), at: new Date().toISOString(), spoken: falarMatch, text },
        ]);
      }
      if (falarMatch && data.audioBase64) {
        onSpeak(data.audioBase64, text);
      }
      setStatus("listening");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Falha ao falar com a Aurora.");
      setStatus("error");
    } finally {
      analyzingRef.current = false;
    }
  }, [sessionId, leadContext, onSpeak]);

  useEffect(() => {
    if (!active || !sessionId) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Reconhecimento de voz não suportado neste navegador. Use Chrome.");
      setStatus("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + " ";
      transcriptRef.current = full.trim();
      onTranscriptChange?.(transcriptRef.current);
    };
    recognition.onerror = () => {};
    recognition.onend = () => {
      // A API do navegador encerra sozinha depois de um tempo — religa enquanto a reunião
      // continuar ativa, pra Aurora não "sair" da escuta no meio da call.
      if (active) { try { recognition.start(); } catch {} }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); setStatus("listening"); } catch {}

    cycleRef.current = setInterval(runCycle, CYCLE_MS);

    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sessionId]);

  return { status, messages, errorMsg };
}
