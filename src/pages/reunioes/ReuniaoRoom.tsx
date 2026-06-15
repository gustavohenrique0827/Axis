import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { IACopilot } from "../../components/ui/IACopilot";
import {
  Brain, ArrowLeft, Video, Clock, User,
  Copy, ExternalLink, CheckCircle2, X, Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Reuniao } from "../../contexts/DataContextTypes";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ReuniaoRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reunioes, updateReuniao } = useData();
  const [showCopilot, setShowCopilot] = useState(true);
  const [ending, setEnding] = useState(false);

  const reuniao = (reunioes as Reuniao[]).find((r) => r.id === id);

  if (!reuniao) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0B1120] text-slate-500 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Video className="w-8 h-8 opacity-30" />
        </div>
        <p className="font-semibold">Reunião não encontrada</p>
        <button
          onClick={() => navigate("/app/reunioes")}
          className="text-blue-400 hover:underline text-sm"
        >
          ← Voltar para Reuniões
        </button>
      </div>
    );
  }

  const handleEnd = async () => {
    setEnding(true);
    try {
      await updateReuniao(reuniao.id, { status: "Concluída" });
      toast.success("Reunião encerrada. Use o Copilot para gerar o relatório!");
      navigate("/app/reunioes");
    } finally {
      setEnding(false);
    }
  };

  const statusColor =
    reuniao.status === "Em Andamento" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
    reuniao.status === "Concluída"    ? "bg-slate-700/40 border-white/10 text-slate-400" :
    reuniao.status === "Cancelada"    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                        "bg-blue-500/10 border-blue-500/20 text-blue-400";

  const initials = ((reuniao.companyName || reuniao.leadName || "R").slice(0, 2)).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#070E1A]">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B1120] border-b border-white/[0.06] shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/app/reunioes")}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="w-px h-5 bg-white/[0.08] shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate leading-none">
                {reuniao.companyName || reuniao.leadName}
              </div>
              <div className="text-[10px] text-slate-500">{formatDateTime(reuniao.scheduledAt)}</div>
            </div>
          </div>
          <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0", statusColor)}>
            {reuniao.status}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
              showCopilot
                ? "bg-violet-500/20 border-violet-500/30 text-violet-400"
                : "bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-violet-400 hover:border-violet-500/20"
            )}
          >
            <Brain className="w-3.5 h-3.5" /> Copilot
          </button>
          {reuniao.status !== "Concluída" && reuniao.status !== "Cancelada" ? (
            <Button
              onClick={handleEnd}
              disabled={ending}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 h-8 text-xs"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              {ending ? "Encerrando..." : "Encerrar"}
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Encerrada
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-56 shrink-0 bg-[#0B1120] border-r border-white/[0.06] flex flex-col overflow-y-auto">
          {/* Avatar + identity */}
          <div className="flex flex-col items-center gap-2 px-4 py-6 border-b border-white/[0.05]">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center text-xl font-black text-blue-300 select-none">
              {initials}
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{reuniao.companyName || reuniao.leadName}</div>
              {reuniao.companyName && reuniao.leadName && reuniao.companyName !== reuniao.leadName && (
                <div className="text-xs text-slate-400 mt-0.5">{reuniao.leadName}</div>
              )}
              {reuniao.leadEmail && (
                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">{reuniao.leadEmail}</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-3 border-b border-white/[0.05]">
            <div className="flex items-start gap-2">
              <User className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">Closer</div>
                <div className="text-xs font-semibold text-white">{reuniao.closerName || "—"}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">Data & Hora</div>
                <div className="text-xs font-semibold text-white">{formatDateTime(reuniao.scheduledAt)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">Duração</div>
                <div className="text-xs font-semibold text-white">{reuniao.durationMinutes} min</div>
              </div>
            </div>
          </div>

          {/* Pauta */}
          {reuniao.pauta && (
            <div className="p-4 border-b border-white/[0.05]">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Pauta</div>
              <p className="text-xs text-slate-400 leading-relaxed">{reuniao.pauta}</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 mt-auto space-y-2">
            <button
              onClick={() => { navigator.clipboard.writeText(reuniao.meetLink); toast.success("Link copiado!"); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-xs text-slate-400 hover:text-white transition-all font-medium"
            >
              <Copy className="w-3 h-3" /> Copiar link
            </button>
            <a
              href={reuniao.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs text-blue-400 font-bold transition-all"
            >
              <ExternalLink className="w-3 h-3" /> Abrir no Meet
            </a>
          </div>
        </div>

        {/* Center: Google Meet iframe */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black relative">
          {reuniao.meetLink ? (
            <>
              <iframe
                src={reuniao.meetLink}
                allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write"
                className="w-full flex-1 border-0"
                title="Google Meet — Axis"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="text-[10px] text-slate-500 bg-black/70 px-3 py-1 rounded-full">
                  Se o Meet não carregar,{" "}
                  <a
                    href={reuniao.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline pointer-events-auto"
                  >
                    abra em nova aba ↗
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
              <Video className="w-12 h-12 opacity-20" />
              <p className="text-sm">Link da reunião indisponível</p>
            </div>
          )}
        </div>

        {/* Right: Copilot */}
        {showCopilot && (
          <div className="w-72 shrink-0 bg-[#0B1120] border-l border-white/[0.06] flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-2.5 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-xs font-black text-violet-400 uppercase tracking-wider">
                  Copilot da Reunião
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Ative o microfone para transcrever e analisar a conversa em tempo real.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <IACopilot leadName={reuniao.leadName} companyName={reuniao.companyName} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
