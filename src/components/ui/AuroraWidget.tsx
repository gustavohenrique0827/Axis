import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, X, Send, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/apiClient";
import { AuroraCore } from "./auroraCore/AuroraCore";
import type { AuroraCoreMode } from "./auroraCore/auroraCoreStates";

/** Por quanto tempo o núcleo pulsa em "speaking" depois que a resposta da Aurora chega. */
const SPEAKING_PULSE_MS = 1500;

interface AuroraMessage {
  id: string;
  role: "user" | "aurora";
  text: string;
}

/**
 * Balão de chat flutuante global com a Aurora (assistente do G-TECH AI OS), embutido no Axis.
 * Só renderizado para usuários master (ver Layout.tsx) — a Aurora atende só Gustavo/G-TECH,
 * com ferramentas de escrita reais escopadas ao tenant da G-TECH, então não faz sentido (e não
 * é seguro) mostrá-la para usuários de outros tenants do Axis.
 *
 * Fala com POST /api/ai/aurora-chat (server.ts), que faz o proxy autenticado até o webhook do
 * Chat Trigger da Aurora no n8n — a URL do webhook nunca chega até este componente.
 */
export function AuroraWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AuroraMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => () => {
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
  }, []);

  // Mapeia o estado real do widget (não há voz/execução distinta no Axis hoje) pro modelo de
  // estados do núcleo — honesto com o que existe: sem "listening"/"analyzing"/"executing" fake.
  const coreMode: AuroraCoreMode = useMemo(() => {
    if (error) return "error";
    if (loading) return "thinking";
    if (speaking) return "speaking";
    return "idle";
  }, [error, loading, speaking]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/ai/aurora-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Aurora está indisponível agora.");
      }
      if (!res.ok || data.error) throw new Error(data.error ?? "Aurora está indisponível agora.");
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "aurora", text: data.output ?? "" }]);
      setSpeaking(true);
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = setTimeout(() => setSpeaking(false), SPEAKING_PULSE_MS);
    } catch (err: any) {
      setError(err.message ?? "Falha ao falar com a Aurora.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* ── Painel de chat ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[560px] max-h-[calc(100vh-8rem)] flex flex-col bg-[var(--color-surface-elevated)] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2.5">
              <AuroraCore mode={coreMode} size={28} showToggle />
              <div>
                <p className="text-[11px] font-black text-white">Aurora</p>
                <p className="text-[9px] text-slate-500">G-TECH AI OS</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center gap-2 h-full text-center px-6">
                <Sparkles className="w-10 h-10 text-slate-700" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pergunte alguma coisa pra Aurora — diretoria, agenda, Spotify, WhatsApp, Axis.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-sm"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />
                  <span className="text-[10px] text-slate-500">Aurora está pensando...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-1 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-[10px] text-rose-400 leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/[0.07] shrink-0 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              placeholder="Fale com a Aurora..."
              className="flex-1 resize-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── Botão flutuante (o próprio núcleo da Aurora) ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.35)] flex items-center justify-center transition-all hover:scale-105 overflow-hidden bg-black/20 backdrop-blur-sm"
        title="Falar com a Aurora"
      >
        <AuroraCore mode={coreMode} size={56} />
        {isOpen && (
          <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </div>
        )}
      </button>
    </>
  );
}
