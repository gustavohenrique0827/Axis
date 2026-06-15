import { useState, useEffect, useRef } from "react";
import { Phone, Mic, MicOff, Plus, Trash2, MessageSquare } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface NotasSectionProps {
  lead: any;
  leadName: string;
  updateLead: (id: string, data: any) => void;
}

function parseNotes(raw: string | null | undefined): Note[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  if (raw.trim()) {
    return [{ id: crypto.randomUUID(), text: raw.trim(), author: "Sistema", createdAt: new Date().toISOString() }];
  }
  return [];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ÀS ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function NotasSection({ lead, leadName, updateLead }: NotasSectionProps) {
  const [notes, setNotes]         = useState<Note[]>([]);
  const [input, setInput]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [authorName, setAuthorName] = useState("Usuário");

  const recognitionRef  = useRef<any>(null);
  const inputPrefixRef  = useRef("");          // texto digitado antes de iniciar gravação

  useEffect(() => { setNotes(parseNotes(lead?.notes)); }, [lead?.id]);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setAuthorName(
        user?.user_metadata?.name ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Usuário"
      );
    });
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const persist = async (updated: Note[]) => {
    const json = JSON.stringify(updated);
    updateLead(lead.id, { notes: json });
    if (supabase) await supabase.from("leads").update({ notes: json }).eq("id", lead.id);
  };

  const addNote = async () => {
    const text = input.trim();
    if (!text || saving) return;

    setSaving(true);
    const id = crypto.randomUUID();
    const note: Note = { id, text, author: authorName, createdAt: new Date().toISOString() };
    const updated = [note, ...notes];

    // Salva e limpa imediatamente
    setNotes(updated);
    setInput("");
    await persist(updated);
    setSaving(false);

    // IA corrige ortografia em background (silencioso)
    try {
      const res = await fetch("/api/ai/corrigir-nota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: text }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        let data: any;
        try { data = await res.json(); } catch { return; }
        if (data.corrigido?.trim() && data.corrigido.trim() !== text) {
          const corrected = updated.map((n) =>
            n.id === id ? { ...n, text: data.corrigido.trim() } : n
          );
          setNotes(corrected);
          await persist(corrected);
        }
      }
    } catch {
      // Falha silenciosa — mantém texto original
    }
  };

  const deleteNote = async (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    await persist(updated);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Gravação de voz não suportada. Use Chrome ou Edge."); return; }

    // Preserva o que já foi digitado — voz vai CONTINUAR de onde parou
    inputPrefixRef.current = input.trim();

    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e: any) => {
      let interim = "", final = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      const voiceText = (final + interim).trim();
      const prefix = inputPrefixRef.current;
      // Voz vai DENTRO do textarea — continua do texto pré-existente
      setInput(prefix ? `${prefix} ${voiceText}` : voiceText);
    };

    r.onerror = (e: any) => {
      if (e.error !== "aborted") toast.error("Erro na gravação: " + e.error);
      stopRecording();
    };

    r.onend = () => {
      if (recognitionRef.current) { recognitionRef.current = null; setIsRecording(false); }
    };

    recognitionRef.current = r;
    r.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    // Texto fica no textarea para o usuário revisar e clicar "+"
  };

  return (
    <div className="px-5 py-4 space-y-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Nova Nota</p>
          <p className="text-[8px] text-slate-700 truncate max-w-[120px]">{leadName}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setInput((v) => v ? `${v}\n📞 Chamada — ` : `📞 Chamada — `)}
            disabled={isRecording}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.1] text-slate-400 text-[8px] font-black uppercase tracking-widest hover:border-cyan-500/30 hover:text-cyan-400 transition-all disabled:opacity-40"
          >
            <Phone className="w-3 h-3" /> Chamada ao Vivo
          </button>
          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
              isRecording
                ? "border-rose-500/30 text-rose-400 bg-rose-500/10 animate-pulse"
                : "border-white/[0.1] text-slate-400 hover:border-violet-500/30 hover:text-violet-400"
            }`}
          >
            {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            {isRecording ? "Parar" : "Gravar Voz"}
          </button>
        </div>
      </div>

      {/* ── Textarea + botão + ── */}
      <div className="relative">
        {isRecording && (
          <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[8px] text-rose-400 font-black uppercase tracking-widest">Ao vivo</span>
          </div>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addNote(); }
          }}
          placeholder="Digite uma nota ou use 'Gravar Voz'..."
          rows={4}
          className={`w-full bg-white/[0.03] border rounded-2xl px-4 py-3 pr-12 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none leading-relaxed ${
            isRecording
              ? "border-rose-500/25 pt-8"
              : "border-white/[0.08] focus:border-white/[0.18]"
          }`}
        />
        {/* Botão + */}
        <button
          onClick={addNote}
          disabled={!input.trim() || saving}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
        >
          {saving
            ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <Plus className="w-4 h-4" />
          }
        </button>
      </div>
      <div className="flex items-center justify-between -mt-1">
        <p className="text-[8px] text-slate-600">
          Anotando como <span className="text-slate-400 font-semibold">{authorName}</span>
        </p>
        <p className="text-[8px] text-slate-700">⌘+Enter · IA corrige ortografia</p>
      </div>

      {/* ── Cards de notas ── */}
      {notes.length > 0 ? (
        <div className="space-y-2.5">
          {notes.map((note) => (
            <div key={note.id} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    {formatDate(note.createdAt)}
                  </p>
                  <p className="text-[9px] text-slate-500">por {note.author}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-700 hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="px-4 py-3 text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <MessageSquare className="w-7 h-7 text-slate-700" />
          <p className="text-[10px] text-slate-600 font-bold">Nenhuma nota registrada.</p>
          <p className="text-[9px] text-slate-700">Escreva ou grave para adicionar.</p>
        </div>
      )}
    </div>
  );
}
