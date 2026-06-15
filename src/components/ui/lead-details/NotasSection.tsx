import { useState, useEffect, useRef } from "react";
import { StickyNote, Save, Mic, Phone } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

interface NotasSectionProps {
  lead: any;
  leadName: string;
  updateLead: (id: string, data: any) => void;
}

export function NotasSection({ lead, leadName, updateLead }: NotasSectionProps) {
  const [notes, setNotes] = useState<string>(lead?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(lead?.notes ?? "");

  useEffect(() => {
    setNotes(lead?.notes ?? "");
    lastSavedRef.current = lead?.notes ?? "";
  }, [lead?.id]);

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
            const now = new Date().toLocaleString("pt-BR");
            handleChange(notes ? `${notes}\n\n📞 [${now}] — ` : `📞 [${now}] — `);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-cyan-500/20"
        >
          <Phone className="w-3 h-3" /> Chamada ao Vivo
        </button>
        <button
          onClick={() => toast.info("Gravação de voz disponível no mobile.")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-violet-500/20"
        >
          <Mic className="w-3 h-3" /> Gravar Voz
        </button>
      </div>

      {/* Nova nota */}
      <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Nova Nota</label>
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Adicione uma observação sobre este lead..."
          rows={8}
          className="w-full bg-[#070E1A] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/10 transition-all resize-none leading-relaxed"
        />
        <p className="text-[8px] text-slate-600 text-right">
          {notes.length} caracteres · auto-salvo
        </p>
      </div>

      {/* Estado vazio */}
      {!notes && (
        <div className="flex flex-col items-center gap-2 py-6 text-center border border-dashed border-white/[0.06] rounded-2xl">
          <StickyNote className="w-8 h-8 text-slate-700" />
          <p className="text-[10px] text-slate-600 font-bold">Nenhuma nota registrada.</p>
          <p className="text-[9px] text-slate-700">Use o campo acima para adicionar observações rápidas.</p>
        </div>
      )}
    </div>
  );
}
