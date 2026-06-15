import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { IACopilot } from "../../components/ui/IACopilot";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Brain, ArrowLeft, Video, Clock, User,
  Copy, ExternalLink, CheckCircle2, X, Calendar,
  FileText, Mic, Camera, Share2, Zap,
} from "lucide-react";
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
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [notes, setNotes] = useState("");

  const reuniao = (reunioes as Reuniao[]).find((r) => r.id === id);

  if (!reuniao) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0B1120] text-slate-500 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Video className="w-8 h-8 opacity-30" />
        </div>
        <p className="font-semibold">Reunião não encontrada</p>
        <button onClick={() => navigate("/app/reunioes")} className="text-blue-400 hover:underline text-sm">
          ← Voltar para Reuniões
        </button>
      </div>
    );
  }

  const handleEnd = () => {
    setEnding(true);
    updateReuniao(reuniao.id, { status: "Concluída" });
    toast.success("Reunião encerrada. Use o Copilot para gerar o relatório!");
    navigate("/app/reunioes");
  };

  const statusColor =
    reuniao.status === "Em Andamento" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
    reuniao.status === "Concluída"    ? "bg-slate-700/40 border-white/10 text-slate-400" :
    reuniao.status === "Cancelada"    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                        "bg-blue-500/10 border-blue-500/20 text-blue-400";

  const initials = ((reuniao.companyName || reuniao.leadName || "R").slice(0, 2)).toUpperCase();

  return (
    <PageContainer
      title={reuniao.companyName || reuniao.leadName}
      description={`Reunião com ${reuniao.closerName || "—"} · ${formatDateTime(reuniao.scheduledAt)}`}
      actions={
        <div className="flex items-center gap-3">
          <span className={cn("text-[10px] font-black px-3 py-1 rounded-full border", statusColor)}>
            {reuniao.status}
          </span>
          <Button
            onClick={() => setShowCopilot(!showCopilot)}
            className={cn(
              "h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border gap-2",
              showCopilot
                ? "bg-violet-500/20 border-violet-500/30 text-violet-400 hover:bg-violet-500/30"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            )}
          >
            <Brain className="w-4 h-4" /> Copilot
          </Button>
          <Button
            onClick={() => navigate("/app/reunioes")}
            className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          {reuniao.status !== "Concluída" && reuniao.status !== "Cancelada" ? (
            <Button
              onClick={handleEnd}
              disabled={ending}
              className="h-10 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2"
            >
              <X className="w-4 h-4" />
              {ending ? "Encerrando..." : "Encerrar"}
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Encerrada
            </span>
          )}
        </div>
      }
    >
      <div className={cn("grid gap-6 pb-10", showCopilot ? "lg:grid-cols-4" : "lg:grid-cols-3")}>

        {/* ── Main area (iframe + controls) ── */}
        <div className={cn("space-y-6", showCopilot ? "lg:col-span-3" : "lg:col-span-2")}>

          {/* Meet iframe */}
          <Card className="bg-[#0B1120] border-white/10 relative overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
            {reuniao.meetLink ? (
              <>
                <iframe
                  src={reuniao.meetLink}
                  allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write"
                  className="absolute inset-0 w-full h-full border-0"
                  title="Google Meet — Axis"
                />
                {/* Call controls overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={cn("p-4 rounded-2xl border transition-all", isMicOn ? "bg-white/10 border-white/10 text-white hover:bg-white/20" : "bg-rose-500 border-rose-600 text-white")}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={cn("p-4 rounded-2xl border transition-all", isCameraOn ? "bg-white/10 border-white/10 text-white hover:bg-white/20" : "bg-rose-500 border-rose-600 text-white")}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleEnd}
                    disabled={ending}
                    className="p-4 rounded-2xl bg-rose-600 border border-rose-700 text-white hover:bg-rose-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button className="p-4 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                {/* Live badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">AO VIVO</span>
                  </div>
                </div>
                {/* Lead info overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/30 flex items-center justify-center text-sm font-black text-blue-300 select-none">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white leading-none">{reuniao.companyName || reuniao.leadName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{reuniao.closerName || "—"}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center animate-pulse">
                  <Video className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-lg font-black text-white italic tracking-tight">Link da reunião indisponível</p>
              </div>
            )}
          </Card>

          {/* Notes + quick actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-[#111827]/80 border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Notas da Reunião
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações em tempo real..."
                className="w-full h-36 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-600"
              />
              <Button className="w-full mt-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-xl hover:bg-blue-600 hover:border-blue-600 transition-all">
                Salvar Notas
              </Button>
            </Card>

            <Card className="p-6 bg-[#111827]/80 border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" /> Ações Rápidas
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(reuniao.meetLink); toast.success("Link copiado!"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition-all font-medium"
                >
                  <Copy className="w-4 h-4 text-slate-500 shrink-0" /> Copiar link da reunião
                </button>
                <a href={reuniao.meetLink} target="_blank" rel="noopener noreferrer" className="block">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-sm text-blue-400 font-bold transition-all">
                    <ExternalLink className="w-4 h-4 shrink-0" /> Abrir no Google Meet
                  </button>
                </a>
                {reuniao.pauta && (
                  <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Pauta</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{reuniao.pauta}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-6">

          {/* Lead info card */}
          <Card className="p-6 bg-[#111827]/80 border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">Informações</h4>
            <div className="flex flex-col items-center gap-3 mb-5 pb-5 border-b border-white/[0.05]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center text-xl font-black text-blue-300 select-none">
                {initials}
              </div>
              <div className="text-center">
                <p className="font-black text-white">{reuniao.companyName || reuniao.leadName}</p>
                {reuniao.companyName && reuniao.leadName && reuniao.companyName !== reuniao.leadName && (
                  <p className="text-xs text-slate-400">{reuniao.leadName}</p>
                )}
                {reuniao.leadEmail && (
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{reuniao.leadEmail}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wider">Closer</p>
                  <p className="text-xs font-semibold text-white">{reuniao.closerName || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wider">Data & Hora</p>
                  <p className="text-xs font-semibold text-white">{formatDateTime(reuniao.scheduledAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wider">Duração</p>
                  <p className="text-xs font-semibold text-white">{reuniao.durationMinutes} min</p>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Copilot card */}
          {showCopilot && (
            <Card className="bg-gradient-to-br from-violet-600/10 to-transparent border-violet-500/20 relative overflow-hidden flex flex-col" style={{ minHeight: 380 }}>
              <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                <Brain className="w-24 h-24 text-violet-400" />
              </div>
              <div className="px-5 pt-5 pb-3 border-b border-white/[0.05] shrink-0">
                <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Copilot da Reunião
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Ative o microfone para transcrição e análise em tempo real.
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <IACopilot leadName={reuniao.leadName} companyName={reuniao.companyName} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
