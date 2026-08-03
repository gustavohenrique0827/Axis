import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { IACopilot } from "../../components/ui/IACopilot";
import { JitsiEmbed, isJitsiLink, jitsiRoomName } from "../../components/ui/JitsiEmbed";
import { Button } from "../../components/ui/button";
import {
  Brain, ArrowLeft, Video, Clock, User, Copy, ExternalLink,
  FileText, Zap, X, CheckCircle2, Calendar, Flame, Snowflake,
  Thermometer, Target, TrendingUp, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Reuniao } from "../../contexts/DataContextTypes";
import type { Lead } from "../../types";
import { apiFetch } from "../../lib/apiClient";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function useLiveTimer(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TEMP_CONFIG: Record<string, { label: string; icon: typeof Flame; color: string; bg: string }> = {
  quente: { label: "Quente", icon: Flame,       color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  morno:  { label: "Morno",  icon: Thermometer, color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20"  },
  frio:   { label: "Frio",   icon: Snowflake,   color: "text-sky-400",    bg: "bg-sky-500/10 border-sky-500/20"     },
};

export default function ReuniaoRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reunioes, leads, updateReuniao } = useData();

  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [ending, setEnding] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [startedAt] = useState<string | null>(new Date().toISOString());
  const [reportExpanded, setReportExpanded] = useState(false);
  const [sdrExpanded, setSdrExpanded] = useState(true);
  const noteSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useLiveTimer(startedAt);
  const reuniao = (reunioes as Reuniao[]).find((r) => r.id === id);
  const lead: Lead | undefined = reuniao
    ? (leads as Lead[]).find((l) => l.id === reuniao.leadId)
    : undefined;

  const leadContext = {
    name: reuniao?.leadName ?? lead?.name,
    company: reuniao?.companyName ?? lead?.company,
    iaSummary: lead?.iaSummary,
    scoreIA: lead?.scoreIA,
    temperature: lead?.temperature,
    lead_interesse: lead?.lead_interesse_cliente,
    pauta: reuniao?.pauta,
  };

  // Auto-save notes to Supabase with debounce
  const saveNotes = useCallback((value: string) => {
    if (!reuniao?.id) return;
    if (noteSaveRef.current) clearTimeout(noteSaveRef.current);
    noteSaveRef.current = setTimeout(() => {
      updateReuniao(reuniao.id, { notas_closer: value });
    }, 1500);
  }, [reuniao?.id, updateReuniao]);

  useEffect(() => {
    if (reuniao?.notas_closer) setNotes(reuniao.notas_closer);
    if (reuniao?.relatorio_ia) { setReportText(reuniao.relatorio_ia); setShowReport(true); }
  }, [reuniao?.id]);

  if (!reuniao) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--color-surface)] text-slate-500 gap-4">
        <Video className="w-10 h-10 opacity-20" />
        <p className="font-semibold">Reunião não encontrada</p>
        <button onClick={() => navigate("/app/reunioes")} className="text-blue-400 hover:underline text-sm">
          ← Voltar para Reuniões
        </button>
      </div>
    );
  }

  const isActive = reuniao.status !== "Concluída" && reuniao.status !== "Cancelada";
  const initials = ((reuniao.companyName || reuniao.leadName || "R").slice(0, 2)).toUpperCase();
  const tempCfg = lead?.temperature ? TEMP_CONFIG[lead.temperature] : null;
  const scoreColor = !lead?.scoreIA ? "text-slate-400" :
    lead.scoreIA >= 70 ? "text-emerald-400" : lead.scoreIA >= 40 ? "text-amber-400" : "text-rose-400";

  const handleEnd = async () => {
    setEnding(true);
    setGeneratingReport(true);
    try {
      const res = await apiFetch("/api/ai/reuniao-relatorio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reuniaoId: reuniao.id,
          transcript,
          notes,
          leadContext,
          pauta: reuniao.pauta,
        }),
      });
      const data = await res.json();
      if (data.relatorio) {
        setReportText(data.relatorio);
        setShowReport(true);
        setReportExpanded(true);
        updateReuniao(reuniao.id, {
          status: "Concluída",
          relatorio_ia: data.relatorio,
          transcricao: transcript,
          notas_closer: notes,
        });
        toast.success("Reunião encerrada! Relatório IA gerado.");
      }
    } catch {
      updateReuniao(reuniao.id, { status: "Concluída", transcricao: transcript, notas_closer: notes });
      toast.success("Reunião encerrada.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const copyMeetLink = () => {
    navigator.clipboard.writeText(reuniao.meetLink ?? "");
    toast.success("Link copiado!");
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[var(--color-surface)]/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/reunioes")}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-xs font-black text-blue-300 select-none">
            {initials}
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">{reuniao.companyName || reuniao.leadName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{reuniao.closerName || "—"} · {formatDateTime(reuniao.scheduledAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-black text-rose-400 tabular-nums">{timer}</span>
            </div>
          )}

          {/* Open Meet */}
          <a href={reuniao.meetLink} target="_blank" rel="noopener noreferrer">
            <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2">
              <Video className="w-3.5 h-3.5" /> Abrir Google Meet
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Button>
          </a>

          {isActive ? (
            <Button
              onClick={handleEnd}
              disabled={ending}
              className="h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2"
            >
              {generatingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              {generatingReport ? "Gerando relatório..." : "Encerrar"}
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold px-3">
              <CheckCircle2 className="w-4 h-4" /> Concluída
            </span>
          )}
        </div>
      </div>

      {/* ── 3-panel body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ PANEL 1 — Sala Ativa + Notas (left, ~50%) ════ */}
        <div className="flex flex-col w-[50%] border-r border-white/[0.06] overflow-y-auto">

          {/* Video area */}
          {isJitsiLink(reuniao.meetLink) ? (
            <div className="relative border-b border-white/[0.04]" style={{ height: "420px" }}>
              {/* overlay bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-[var(--color-surface)]/80 backdrop-blur-sm border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  {isActive
                    ? <><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ao Vivo</span></>
                    : <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encerrada</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyMeetLink} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-[10px] text-slate-400 hover:text-white transition-all font-bold">
                    <Copy className="w-3 h-3" /> Link
                  </button>
                  <a href={reuniao.meetLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-[10px] text-slate-400 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="absolute inset-0 pt-9">
                <JitsiEmbed
                  roomName={jitsiRoomName(reuniao.meetLink)}
                  displayName={reuniao.closerName || "Closer"}
                  email={reuniao.closerEmail}
                  onLeave={isActive ? handleEnd : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-white/[0.04]">
              <div className="rounded-2xl bg-[var(--color-surface)] border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    {isActive
                      ? <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sala Ativa</span></div>
                      : <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reunião Concluída</span>
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyMeetLink} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-[10px] text-slate-400 hover:text-white transition-all font-bold">
                      <Copy className="w-3 h-3" /> Copiar link
                    </button>
                    <a href={reuniao.meetLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 font-bold transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> Abrir Meet
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-8 px-6 text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
                    <Video className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">Google Meet — abre em nova aba</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
                      Reuniões criadas como "Sala Axis" ficam embutidas aqui. Para novos agendamentos, escolha "Sala Axis" no modal.
                    </p>
                  </div>
                  <a href={reuniao.meetLink} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all">
                      <Video className="w-4 h-4" /> Abrir Google Meet <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </a>
                  {reuniao.pauta && (
                    <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left mt-1">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Pauta</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{reuniao.pauta}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="flex-1 p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Notas do Closer
              <span className="ml-auto text-slate-700 normal-case font-medium">Salvo automaticamente</span>
            </h4>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                saveNotes(e.target.value);
              }}
              placeholder="Anotações em tempo real — objeções, pontos de interesse, decisões, próximos passos..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-all resize-none placeholder:text-slate-700 min-h-[160px]"
            />
          </div>

          {/* Post-meeting report */}
          {showReport && reportText && (
            <div className="p-4 border-t border-white/[0.06]">
              <button
                onClick={() => setReportExpanded(!reportExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-violet-500/[0.08] border border-violet-500/20 rounded-xl text-violet-400 font-black text-[10px] uppercase tracking-widest hover:bg-violet-500/15 transition-all"
              >
                <span className="flex items-center gap-2"><Brain className="w-3.5 h-3.5" /> Relatório IA Pós-Reunião</span>
                {reportExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {reportExpanded && (
                <div className="mt-3 px-4 py-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-y-auto max-h-96">
                  <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {reportText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════ PANEL 2 — SDR Intelligence (center, ~22%) ════ */}
        <div className="w-[22%] border-r border-white/[0.06] overflow-y-auto flex flex-col">

          {/* Lead header */}
          <div className="p-4 border-b border-white/[0.04]">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-base font-black text-blue-300 select-none">
                {initials}
              </div>
              <div>
                <p className="font-black text-white text-sm leading-tight">{reuniao.companyName || reuniao.leadName}</p>
                {reuniao.companyName && reuniao.leadName && reuniao.companyName !== reuniao.leadName && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{reuniao.leadName}</p>
                )}
              </div>

              {/* Score + Temp */}
              <div className="flex items-center gap-2 w-full justify-center">
                {lead?.scoreIA !== undefined && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg">
                    <Target className="w-3 h-3 text-slate-500" />
                    <span className={`text-xs font-black ${scoreColor}`}>{lead.scoreIA}</span>
                  </div>
                )}
                {tempCfg && (
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 border rounded-lg", tempCfg.bg)}>
                    <tempCfg.icon className={cn("w-3 h-3", tempCfg.color)} />
                    <span className={cn("text-[10px] font-black", tempCfg.color)}>{tempCfg.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="px-4 py-3 space-y-2 border-b border-white/[0.04] text-[11px]">
            <div className="flex items-start gap-2 text-slate-400">
              <User className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
              <span>{reuniao.closerName || "Closer"}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <Calendar className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
              <span>{formatDateTime(reuniao.scheduledAt)}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <Clock className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
              <span>{reuniao.durationMinutes} min</span>
            </div>
          </div>

          {/* SDR Report */}
          <div className="flex-1 p-4 space-y-3">
            <button
              onClick={() => setSdrExpanded(!sdrExpanded)}
              className="w-full flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-all"
            >
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-violet-500" /> Relatório SDR</span>
              {sdrExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {sdrExpanded && (
              lead?.iaSummary ? (
                <div className="px-3 py-3 bg-violet-500/[0.05] border border-violet-500/10 rounded-xl">
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">
                    {lead.iaSummary}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <Brain className="w-6 h-6 text-slate-700" />
                  <p className="text-[10px] text-slate-600">Relatório SDR não disponível para este lead.</p>
                </div>
              )
            )}

            {lead?.lead_interesse_cliente && (
              <div className="px-3 py-2.5 bg-blue-500/[0.05] border border-blue-500/10 rounded-xl">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Interesse</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">{lead.lead_interesse_cliente}</p>
              </div>
            )}

            {lead?.source && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                <Zap className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="text-[10px] text-slate-500">Origem: {lead.source}</span>
              </div>
            )}
          </div>
        </div>

        {/* ════ PANEL 3 — AI Copilot (right, ~28%) ════ */}
        <div className="w-[28%] flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-white/[0.04] shrink-0">
            <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Copilot IA — Tempo Real
            </h3>
            <p className="text-[9px] text-slate-600 mt-0.5 leading-relaxed">
              Ative o microfone, fale com o cliente e clique em "Analisar" para obter sugestões.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <IACopilot
              leadName={reuniao.leadName}
              companyName={reuniao.companyName}
              leadContext={leadContext}
              onTranscriptChange={setTranscript}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
