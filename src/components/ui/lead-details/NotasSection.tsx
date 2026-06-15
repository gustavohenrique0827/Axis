import { useState, useEffect, useRef } from "react";
import { StickyNote, Mic, MicOff, Phone, Trash2, Plus } from "lucide-react";
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
  // Legado: string simples → converte em card único
  if (raw.trim()) {
    return [{
      id: crypto.randomUUID(),
      text: raw.trim(),
      author: "Sistema",
      createdAt: new Date().toISOString(),
    }];
  }
  return [];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} ÀS ${time}`;
}

export function NotasSection({ lead, leadName, updateLead }: NotasSectionProps) {
  const [notes, setNotes]         = useState<Note[]>([]);
  const [newNote, setNewNote]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText]   = useState("");
  const [authorName, setAuthorName] = useState("Usuário");

  const recognitionRef = useRef<any>(null);
  const liveTextRef    = useRef<string>("");

  useEffect(() => {
    setNotes(parseNotes(lead?.notes));
  }, [lead?.id]);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      const name =
        user?.user_metadata?.name ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Usuário";
      setAuthorName(name);
    });
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const persist = async (updated: Note[]) => {
    const json = JSON.stringify(updated);
    updateLead(lead.id, { notes: json });
    if (supabase) {
      await supabase.from("leads").update({ notes: json }).eq("id", lead.id);
    }
  };

  const addNote = async (text: string) => {
    if (!text.trim()) return;
    setSaving(true);
    const note: Note = {
      id: crypto.randomUUID(),
      text: text.trim(),
      author: authorName,
      createdAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    setNewNote("");
    try {
      await persist(updated);
      toast.success("Nota salva!");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await persist(updated);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Gravação de voz não suportada. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let interim = "", final = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      const combined = (final + interim).trim();
      setLiveText(combined);
      liveTextRef.current = combined;
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "aborted") toast.error("Erro na gravação: " + e.error);
      stopRecording(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current) commitRecording();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setLiveText("");
    liveTextRef.current = "";
  };

  const commitRecording = () => {
    const text = liveTextRef.current;
    recognitionRef.current = null;
    setIsRecording(false);
    setLiveText("");
    liveTextRef.current = "";
    if (text.trim()) addNote(`🎤 ${text.trim()}`);
  };

  const stopRecording = (commit = true) => {
    recognitionRef.current?.stop();
    const text = liveTextRef.current;
    recognitionRef.current = null;
    setIsRecording(false);
    setLiveText("");
    liveTextRef.current = "";
    if (commit && text.trim()) addNote(`🎤 ${text.trim()}`);
  };

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-black text-white">Notas do Lead</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate max-w-[180px]">{leadName}</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setNewNote((v) => v ? `${v}\n📞 Chamada ao Vivo — ` : `📞 Chamada ao Vivo — `)}
          disabled={isRecording}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Phone className="w-3 h-3" /> Chamada ao Vivo
        </button>
        <button
          onClick={() => (isRecording ? stopRecording(true) : startRecording())}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
            isRecording
              ? "bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse"
              : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20"
          }`}
        >
          {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          {isRecording ? "Parar Gravação" : "Gravar Voz"}
        </button>
      </div>

      {/* Live recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <p className="text-[10px] text-rose-300 leading-relaxed flex-1 truncate">
            {liveText || <span className="italic text-rose-400/60">Aguardando fala...</span>}
          </p>
        </div>
      )}

      {/* Nova nota */}
      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Nova Nota</label>
        <textarea
          value={newNote}
          onChange={(e) => { if (!isRecording) setNewNote(e.target.value); }}
          readOnly={isRecording}
          placeholder="Adicione uma observação sobre este lead..."
          rows={4}
          className={`w-full bg-[#070E1A] border rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none leading-relaxed ${
            isRecording
              ? "border-rose-500/30 cursor-not-allowed opacity-80"
              : "border-white/[0.08] focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10"
          }`}
        />
        <button
          onClick={() => addNote(newNote)}
          disabled={!newNote.trim() || saving || isRecording}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
          {saving ? "Salvando..." : "Adicionar Nota"}
        </button>
      </div>

      {/* Lista de notas */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    {formatDate(note.createdAt)}
                  </p>
                  <p className="text-[9px] text-slate-500">por {note.author}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-600 hover:text-rose-400 transition-all"
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
        <div className="flex flex-col items-center gap-2 py-6 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <StickyNote className="w-8 h-8 text-slate-700" />
          <p className="text-[10px] text-slate-600 font-bold">Nenhuma nota registrada.</p>
          <p className="text-[9px] text-slate-700">Use o campo acima ou grave sua voz.</p>
        </div>
      )}
    </div>
  );
}
