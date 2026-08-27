import { useState, useEffect, useRef } from "react";
import { Phone, Mic, MicOff, Plus, Trash2, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { apiFetch } from "../../../lib/apiClient";
import { Button } from "../button";
import { Card } from "../card";
import { Badge } from "../badge";

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
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function NotasSection({ lead, leadName, updateLead }: NotasSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [authorName, setAuthorName] = useState("Usuário");

  const recognitionRef = useRef<any>(null);
  const inputPrefixRef = useRef("");

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

    setNotes(updated);
    setInput("");
    await persist(updated);
    setSaving(false);

    try {
      const res = await apiFetch("/api/ai/corrigir-nota", {
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
    } catch {}
  };

  const deleteNote = async (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    await persist(updated);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Gravação de voz não suportada neste navegador."); return; }

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
  };

  return (
    <div className="px-5 py-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Notas & Registros</p>
          <p className="text-xs text-[var(--color-text-faint)] truncate max-w-[140px]">{leadName}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInput((v) => v ? `${v}\n📞 Chamada — ` : `📞 Chamada — `)}
            disabled={isRecording}
            className="text-[10px] font-bold h-7 gap-1"
          >
            <Phone className="w-3 h-3 text-[var(--color-primary-blue)]" /> Chamada
          </Button>
          <Button
            type="button"
            variant={isRecording ? "danger" : "outline"}
            size="sm"
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className="text-[10px] font-bold h-7 gap-1"
          >
            {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-purple-500" />}
            {isRecording ? "Parar Gravação" : "Gravar Voz"}
          </Button>
        </div>
      </div>

      {/* ── Textarea ── */}
      <div className="relative">
        {isRecording && (
          <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Ouvindo...</span>
          </div>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addNote(); }
          }}
          placeholder="Escreva anotações importantes sobre a negociação..."
          rows={3}
          className={`w-full bg-[var(--color-surface-elevated)] border rounded-[var(--radius-control)] px-4 py-3 pr-12 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all resize-none leading-relaxed ${
            isRecording
              ? "border-rose-500/30 pt-8"
              : "border-[var(--color-border-default)]"
          }`}
        />
        <Button
          size="sm"
          onClick={addNote}
          disabled={!input.trim() || saving}
          loading={saving}
          className="absolute bottom-3 right-3 w-7 h-7 p-0 rounded-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between -mt-2">
        <p className="text-[10px] text-[var(--color-text-faint)]">
          Autor: <span className="text-[var(--color-text-muted)] font-semibold">{authorName}</span>
        </p>
        <p className="text-[10px] text-[var(--color-text-faint)] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" /> Correção automática por IA
        </p>
      </div>

      {/* ── Notes List ── */}
      {notes.length > 0 ? (
        <div className="space-y-2.5">
          {notes.map((note) => (
            <Card key={note.id} className="p-3.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-primary-blue)] uppercase tracking-wider">
                    {formatDate(note.createdAt)}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-faint)]">por {note.author}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 hover:bg-rose-500/10 rounded text-[var(--color-text-faint)] hover:text-rose-500 transition-all cursor-pointer"
                  title="Remover Nota"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {note.text}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed border-[var(--color-border-default)] rounded-[var(--radius-panel)]">
          <MessageSquare className="w-6 h-6 text-[var(--color-text-faint)]" />
          <p className="text-xs text-[var(--color-text-muted)] font-bold">Nenhuma anotação cadastrada.</p>
          <p className="text-[11px] text-[var(--color-text-faint)]">Utilize o campo acima para adicionar registros.</p>
        </div>
      )}
    </div>
  );
}
