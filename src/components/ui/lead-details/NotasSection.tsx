import { useState, useEffect, useRef } from "react";
import { StickyNote, Save, Mic, MicOff, Phone } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

interface NotasSectionProps {
  lead: any;
  leadName: string;
  updateLead: (id: string, data: any) => void;
}

export function NotasSection({ lead, leadName, updateLead }: NotasSectionProps) {
  const [notes, setNotes]       = useState<string>(lead?.notes ?? "");
  const [saving, setSaving]     = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveText, setLiveText] = useState("");

  const debounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef      = useRef<string>(lead?.notes ?? "");
  const recognitionRef    = useRef<any>(null);
  const notesAtStartRef   = useRef<string>("");
  const timestampRef      = useRef<string>("");

  useEffect(() => {
    setNotes(lead?.notes ?? "");
    lastSavedRef.current = lead?.notes ?? "";
  }, [lead?.id]);

  // Cleanup on unmount
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const persistNotes = async (value: string) => {
    if (value === lastSavedRef.current) return;
    setSaving(true);
    try {
      updateLead(lead.id, { notes: value });
      if (supabase) {
        await supabase.from("leads").update({ notes: value }).eq("id", lead.id);
      }
      lastSavedRef.current = value;
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (val: string) => {
    setNotes(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistNotes(val), 1500);
  };

  const handleSaveNow = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await persistNotes(notes);
    toast.success("Nota salva!");
  };

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Gravação de voz não suportada. Use Chrome ou Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    const ts = new Date().toLocaleString("pt-BR");
    timestampRef.current  = ts;
    notesAtStartRef.current = notes;

    recognition.onresult = (e: any) => {
      let interim = "";
      let final   = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      const combined = (final + interim).trim();
      setLiveText(combined);
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "aborted") toast.error("Erro na gravação: " + e.error);
      stopRecording(false);
    };

    recognition.onend = () => {
      // Only commit if still recording (not stopped manually)
      if (recognitionRef.current) commitRecording();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setLiveText("");
  };

  const commitRecording = () => {
    const finalLive = liveText || "";
    if (finalLive.trim()) {
      const prefix = notesAtStartRef.current
        ? `${notesAtStartRef.current}\n\n🎤 [${timestampRef.current}] — `
        : `🎤 [${timestampRef.current}] — `;
      const committed = prefix + finalLive.trim();
      handleChange(committed);
    }
    setLiveText("");
    setIsRecording(false);
    recognitionRef.current = null;
  };

  const stopRecording = (commit = true) => {
    recognitionRef.current?.stop();
    recognitionRef.current = null; // prevent double-commit via onend
    if (commit && liveText.trim()) {
      const prefix = notesAtStartRef.current
        ? `${notesAtStartRef.current}\n\n🎤 [${timestampRef.current}] — `
        : `🎤 [${timestampRef.current}] — `;
      const committed = prefix + liveText.trim();
      handleChange(committed);
    }
    setLiveText("");
    setIsRecording(false);
  };

  // What to show in textarea: live preview while recording
  const displayValue = isRecording && liveText
    ? (notesAtStartRef.current
        ? `${notesAtStartRef.current}\n\n🎤 [${timestampRef.current}] — ${liveText}`
        : `🎤 [${timestampRef.current}] — ${liveText}`)
    : notes;

  return (
    <div className="px-5 py-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Notas do Lead</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate max-w-[180px]">{leadName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {saving && (
            <span className="text-[9px] font-bold text-amber-400 animate-pulse">Salvando...</span>
          )}
          <button
            onClick={handleSaveNow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500/20"
          >
            <Save className="w-3 h-3" /> Salvar
          </button>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (isRecording) return;
            const now = new Date().toLocaleString("pt-BR");
            handleChange(notes ? `${notes}\n\n📞 [${now}] — ` : `📞 [${now}] — `);
          }}
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

      {/* Textarea */}
      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Nova Nota</label>
        <textarea
          value={displayValue}
          onChange={(e) => {
            if (isRecording) return; // não deixa editar durante gravação
            handleChange(e.target.value);
          }}
          readOnly={isRecording}
          placeholder="Adicione uma observação sobre este lead..."
          rows={8}
          className={`w-full bg-[#070E1A] border rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none leading-relaxed ${
            isRecording
              ? "border-rose-500/30 focus:border-rose-500/40 cursor-not-allowed opacity-80"
              : "border-white/[0.08] focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10"
          }`}
        />
        <p className="text-[8px] text-slate-600 text-right">
          {displayValue.length} caracteres · auto-salvo
        </p>
      </div>

      {/* Estado vazio */}
      {!notes && !isRecording && (
        <div className="flex flex-col items-center gap-2 py-6 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <StickyNote className="w-8 h-8 text-slate-700" />
          <p className="text-[10px] text-slate-600 font-bold">Nenhuma nota registrada.</p>
          <p className="text-[9px] text-slate-700">Use o campo acima ou grave sua voz.</p>
        </div>
      )}
    </div>
  );
}
