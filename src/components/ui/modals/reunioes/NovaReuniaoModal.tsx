import { useState } from "react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import {
  Calendar, Clock, User, FileText, Video,
  Copy, Building2, Users, Loader2, CheckCircle2, ExternalLink,
} from "lucide-react";
import { generateJitsiLink } from "../../JitsiEmbed";
import { googleSignIn, getAccessToken } from "../../../../lib/google-auth";
import { createCalendarEvent } from "../../../../lib/google-calendar";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";
import { useNavigate } from "react-router-dom";

type MeetingType = "cliente" | "interna" | "equipe";

const MEETING_TYPES: { id: MeetingType; label: string; desc: string; icon: typeof Video }[] = [
  { id: "cliente",  label: "Cliente",  desc: "Reunião de vendas ou follow-up com cliente", icon: User     },
  { id: "interna",  label: "Interna",  desc: "Alinhamento interno da empresa",              icon: Building2 },
  { id: "equipe",   label: "Equipe",   desc: "Reunião de time, sprint, 1:1",                icon: Users    },
];

interface NovaReuniaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaReuniaoModal({ isOpen, onClose }: NovaReuniaoModalProps) {
  const { colaboradores, leads, addReuniao } = useData();
  const navigate = useNavigate();

  const [meetingType, setMeetingType] = useState<MeetingType>("cliente");
  const [title, setTitle]             = useState("");
  const [pauta, setPauta]             = useState("");
  const [closerName, setCloserName]   = useState("");
  const [date, setDate]               = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime]               = useState("09:00");
  const [duration, setDuration]       = useState(60);

  // For "cliente" type, optionally link a lead
  const [linkedLeadId, setLinkedLeadId] = useState("");

  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; meetLink: string; calendarLink?: string } | null>(null);

  const closerOptions: { name: string; email: string }[] = (() => {
    const fromColab = (colaboradores as any[])
      .filter((c: any) => c.status !== "Desligado")
      .map((c: any) => ({ name: c.nome || c.name || "", email: c.email || "" }))
      .filter((c) => c.name);
    if (fromColab.length > 0) return fromColab;
    const sellers = [...new Set((leads as any[]).map((l: any) => l.seller).filter(Boolean))] as string[];
    return sellers.map((s) => ({ name: s, email: "" }));
  })();

  const closerEmail = closerOptions.find((c) => c.name === closerName)?.email ?? "";

  const linkedLead = linkedLeadId
    ? (leads as any[]).find((l) => l.id === linkedLeadId)
    : null;

  const handleCreate = async () => {
    if (!closerName.trim()) { toast.error("Selecione o responsável."); return; }

    setLoading(true);
    try {
      const reuniaoId   = `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const meetLink    = generateJitsiLink(reuniaoId);
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      const displayTitle = title.trim() || (
        meetingType === "cliente"
          ? `Reunião com ${linkedLead?.company || linkedLead?.name || "Cliente"}`
          : meetingType === "equipe"
          ? "Reunião de Equipe"
          : "Reunião Interna"
      );

      (addReuniao as any)({
        id: reuniaoId,
        leadId:       linkedLead?.id   ?? `standalone-${reuniaoId}`,
        clienteId:    linkedLead?.clientId ?? undefined,
        leadName:     linkedLead?.name  ?? (meetingType === "cliente" ? "Externo" : closerName),
        companyName:  linkedLead?.company ?? displayTitle,
        leadEmail:    linkedLead?.email ?? "",
        closerName,
        closerEmail,
        scheduledAt,
        durationMinutes: duration,
        meetLink,
        status:  "Agendada",
        pauta:   pauta.trim() || undefined,
        relatorio: undefined,
        createdAt: new Date().toISOString(),
      });

      // Tenta criar evento no Google Calendar com link Jitsi na descrição
      let calendarLink: string | undefined;
      try {
        let token = await getAccessToken();
        if (!token) {
          const r = await googleSignIn();
          if (r) token = r.accessToken;
        }
        if (token) {
          const startISO = `${date}T${time}:00`;
          const endDate  = new Date(`${date}T${time}:00`);
          endDate.setMinutes(endDate.getMinutes() + duration);
          const attendees = [linkedLead?.email, closerEmail].filter(Boolean) as string[];
          const calEvent = await createCalendarEvent(token, {
            title: displayTitle,
            description: [
              "🖥️ Sala de vídeo Axis (Jitsi)",
              `🔗 Acesse: ${meetLink}`,
              "Nenhum app necessário — funciona direto no navegador.",
              pauta ? `\n📋 Pauta:\n${pauta}` : "",
            ].filter(Boolean).join("\n"),
            startISO,
            endISO: endDate.toISOString().slice(0, 19),
            attendeeEmails: attendees,
            skipConferenceData: true,
          });
          calendarLink = calEvent.htmlLink;
        }
      } catch {
        // Sala foi criada com sucesso — convite de calendário é opcional
      }

      setCreated({ id: reuniaoId, meetLink, calendarLink });
      toast.success(calendarLink ? "Reunião criada! Convite enviado pelo Google Calendar." : "Reunião criada com sucesso!");
    } catch (err) {
      toast.error("Erro ao criar reunião.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = () => {
    if (!created) return;
    onClose();
    navigate(`/app/reunioes/${created.id}`);
  };

  const reset = () => {
    setTitle(""); setPauta(""); setCloserName("");
    setLinkedLeadId(""); setCreated(null);
    setMeetingType("cliente");
    setDate(new Date().toISOString().slice(0, 10));
    setTime("09:00"); setDuration(60);
  };

  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Reunião"
      maxWidth="max-w-md"
      footer={
        !created ? (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" onClick={handleClose} className="text-slate-400 h-9 px-4 text-xs">
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black h-9 px-6 text-xs gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
              Criar Reunião
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => { navigator.clipboard.writeText(created.meetLink); toast.success("Link copiado!"); }}
              className="flex-1 border-white/10 text-slate-400 h-9 text-xs gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar Link
            </Button>
            <Button
              onClick={handleEnter}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black h-9 text-xs gap-1.5"
            >
              <Video className="w-3.5 h-3.5" /> Entrar na Sala
            </Button>
          </div>
        )
      }
    >
      {created ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-black text-white">Reunião Criada!</p>
            <p className="text-xs text-slate-500 mt-1">
              {created.calendarLink ? "Convite enviado pelo Google Calendar." : "Sala Axis pronta para uso"}
            </p>
          </div>
          <div className="w-full px-4 py-3 bg-[#070E1A] border border-white/[0.08] rounded-xl text-left space-y-3">
            <div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Link da Sala</p>
              <p className="text-[11px] text-blue-400 font-mono break-all">{created.meetLink}</p>
            </div>
            {created.calendarLink && (
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Evento no Google Calendar</p>
                <a
                  href={created.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Abrir evento no Calendar
                </a>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-600">
            {created.calendarLink ? "Participantes receberão o convite por e-mail." : "Compartilhe o link com os participantes."}
          </p>
        </div>
      ) : (
        /* ── Form ── */
        <div className="space-y-4 py-2">

          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Tipo de Reunião</label>
            <div className="grid grid-cols-3 gap-2">
              {MEETING_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMeetingType(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                    meetingType === id
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-white/[0.12] hover:text-slate-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Título (opcional)
            </label>
            <input
              type="text"
              placeholder={
                meetingType === "cliente" ? "Ex: Apresentação de proposta..." :
                meetingType === "equipe"  ? "Ex: Sprint Review — Semana 24..." :
                "Ex: Alinhamento de metas..."
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all"
            />
          </div>

          {/* Vincular lead (só para tipo cliente) */}
          {meetingType === "cliente" && (
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Vincular Lead (opcional)
              </label>
              <select
                value={linkedLeadId}
                onChange={(e) => setLinkedLeadId(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
              >
                <option value="">— Sem lead vinculado —</option>
                {(leads as any[]).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company || l.name}{l.company && l.name ? ` · ${l.name}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Responsável */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Responsável *
            </label>
            {closerOptions.length > 0 ? (
              <select
                value={closerName}
                onChange={(e) => setCloserName(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
              >
                <option value="">Selecionar responsável...</option>
                {closerOptions.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Nome do responsável..."
                value={closerName}
                onChange={(e) => setCloserName(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all"
              />
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/40 transition-all"
              />
            </div>
          </div>

          {/* Duração */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Duração
            </label>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map((min) => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-[10px] font-black transition-all",
                    duration === min
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-white/[0.12] hover:text-slate-300"
                  )}
                >
                  {min}min
                </button>
              ))}
            </div>
          </div>

          {/* Pauta */}
          <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500">Pauta (opcional)</label>
            <textarea
              value={pauta}
              onChange={(e) => setPauta(e.target.value)}
              placeholder="Objetivos da reunião, pontos a discutir..."
              rows={3}
              className="w-full bg-[#0B1120] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all resize-none"
            />
          </div>

          {/* Info sala Axis */}
          <div className="flex items-center gap-3 p-3 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl">
            <Video className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Será criada uma <strong className="text-blue-300">Sala Axis (Jitsi)</strong> exclusiva. Compartilhe o link com os participantes — nenhum app necessário.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
