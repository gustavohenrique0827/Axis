import { useState, useEffect } from "react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import {
  Calendar, Clock, User, FileText, Video,
  Copy, ExternalLink, Loader2, CheckCircle2, AlertCircle, MessageCircle, Phone,
} from "lucide-react";
import { googleSignIn, getAccessToken } from "../../../../lib/google-auth";
import { createMeetSpace } from "../../../../lib/meet";
import { createCalendarEvent } from "../../../../lib/google-calendar";
import { generateJitsiLink } from "../../JitsiEmbed";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

interface AgendarReuniaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: { id: string; name: string; company: string; email: string; phone?: string; seller: string; clienteId?: string };
  onConfirm: (reuniaoId: string, meetLink: string) => void;
}

export function AgendarReuniaoModal({ isOpen, onClose, lead, onConfirm }: AgendarReuniaoModalProps) {
  const { colaboradores, leads, addReuniao } = useData();

  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<{ id: string; meetLink: string; calendarLink?: string } | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState("");
  const [videoProvider, setVideoProvider] = useState<"axis" | "google">("axis");

  const [closerName, setCloserName] = useState(lead.seller || "");
  const [closerEmail, setCloserEmail] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [leadEmail, setLeadEmail] = useState(lead.email || "");
  const [pauta, setPauta]             = useState("");
  const [leadPhone, setLeadPhone]     = useState(lead.phone || "");

  const closerOptions: { name: string; email: string }[] = (() => {
    const fromColab = (colaboradores as any[])
      .filter((c: any) => c.status !== "Desligado")
      .map((c: any) => ({ name: c.nome || c.name || "", email: c.email || "" }))
      .filter((c) => c.name);
    if (fromColab.length > 0) return fromColab;
    const sellers = [...new Set((leads as any[]).map((l: any) => l.seller).filter(Boolean))];
    return (sellers as string[]).map((s) => ({ name: s, email: "" }));
  })();

  useEffect(() => {
    const found = (colaboradores as any[]).find(
      (c: any) => (c.nome || c.name) === closerName
    );
    setCloserEmail(found?.email || "");
  }, [closerName, colaboradores]);

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) setGoogleEmail("Conectado");
    });
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCreatedMeeting(null);
      setCloserName(lead.seller || "");
      setLeadEmail(lead.email || "");
      setLeadPhone(lead.phone || "");
      setPauta("");
    }
  }, [isOpen, lead.seller, lead.email]);

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setGoogleAuthError(null);
      const result = await googleSignIn();
      if (result) {
        setGoogleEmail(result.user.email || "Conectado");
        toast.success("Google conectado!");
      }
    } catch (err: any) {
      const msg: string = err.message || "Tente novamente";
      setGoogleAuthError(msg);
      toast.error(msg, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!closerName) { toast.error("Selecione o closer responsável."); return; }
    if (!date || !time) { toast.error("Informe data e horário."); return; }

    const startISO = `${date}T${time}:00`;
    const endDate = new Date(`${date}T${time}:00`);
    endDate.setMinutes(endDate.getMinutes() + duration);
    const endISO = endDate.toISOString().slice(0, 19);
    // ID determinístico: usado tanto no estado local quanto no Supabase
    const reuniaoId = `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const attendees = [leadEmail, closerEmail].filter(Boolean);

    const baseReuniao = {
      leadId: lead.id, clienteId: lead.clienteId,
      leadName: lead.name, companyName: lead.company,
      leadEmail, closerName, closerEmail,
      scheduledAt: startISO, durationMinutes: duration,
      status: "Agendada" as const, pauta: pauta || undefined,
    };

    // ── Sala S.P.Y. com Jitsi embutido ──────────────────────────────────────
    if (videoProvider === "axis") {
      setLoading(true);
      try {
        const jitsiLink = generateJitsiLink(reuniaoId);

        // Sempre tenta criar evento no Google Calendar com link Jitsi na descrição
        let calendarLink: string | undefined;
        try {
          let token = await getAccessToken();
          if (!token) {
            const r = await googleSignIn();
            if (r) { token = r.accessToken; setGoogleEmail(r.user.email || "Conectado"); }
          }
          if (token) {
            const endDate = new Date(`${date}T${time}:00`);
            endDate.setMinutes(endDate.getMinutes() + duration);
            const calEvent = await createCalendarEvent(token, {
              title: `Reunião — ${lead.company || lead.name}`,
              description: [
                "🖥️ Sala de vídeo S.P.Y. (Jitsi)",
                `🔗 Acesse: ${jitsiLink}`,
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
          toast.warning("Sala criada, mas convite de calendário não enviado.");
        }

        (addReuniao as any)({ id: reuniaoId, ...baseReuniao, meetLink: jitsiLink });
        setCreatedMeeting({ id: reuniaoId, meetLink: jitsiLink, calendarLink });
        toast.success(calendarLink
          ? "Sala S.P.Y. criada! Convite enviado pelo Google Calendar."
          : "Sala S.P.Y. criada! O vídeo abre direto no sistema."
        );
      } catch (err: any) {
        toast.error("Erro ao criar sala: " + (err.message || "Tente novamente"));
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Google Meet (link manual ou via API) ──────────────────────────────
    if (googleAuthError || !googleEmail) {
      const link = manualLink.trim();
      if (!link) { toast.error("Insira um link do Google Meet ou conecte sua conta Google."); return; }
      (addReuniao as any)({ id: reuniaoId, ...baseReuniao, meetLink: link });
      setCreatedMeeting({ id: reuniaoId, meetLink: link });
      toast.success("Reunião agendada com link manual!");
      return;
    }

    setLoading(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        if (!result) throw new Error("Login cancelado");
        token = result.accessToken;
        setGoogleEmail(result.user.email || "Conectado");
      }

      const meetSpace = await createMeetSpace(token);
      let googleEventId: string | undefined;
      try {
        const calEvent = await createCalendarEvent(token, {
          title: `Reunião — ${lead.company || lead.name}`,
          description: pauta || `Reunião comercial com ${lead.name}${lead.company ? ` (${lead.company})` : ""}.`,
          startISO, endISO, attendeeEmails: attendees,
        });
        googleEventId = calEvent.id;
      } catch {
        toast.warning("Reunião criada, mas convite de calendário não enviado.");
      }

      (addReuniao as any)({ id: reuniaoId, ...baseReuniao, meetLink: meetSpace.meetingUri, googleEventId });
      setCreatedMeeting({ id: reuniaoId, meetLink: meetSpace.meetingUri });
      toast.success("Reunião agendada! Convite enviado ao lead e ao closer.");
    } catch (err: any) {
      toast.error("Erro ao criar reunião: " + (err.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsAppUrl = (meetLink: string) => {
    const dateStr = new Date(`${date}T${time}:00`).toLocaleDateString("pt-BR");
    const msg = [
      `Olá, ${lead.name}! 👋`,
      "",
      `Sua reunião com *${lead.company || "a S.P.Y."}* foi confirmada. 🎯`,
      "",
      `📅 *Data:* ${dateStr} às ${time}`,
      `⏱️ *Duração:* ${duration} minutos`,
      closerName ? `👤 *Responsável:* ${closerName}` : "",
      pauta ? `\n📋 *Pauta:*\n${pauta}` : "",
      "",
      `🔗 *Link de acesso:*\n${meetLink}`,
      "",
      "Acesse direto pelo navegador — sem precisar instalar nada. ✅",
    ].filter((l) => l !== undefined).join("\n");

    const encoded = encodeURIComponent(msg);
    if (leadPhone) {
      const digits = leadPhone.replace(/\D/g, "");
      const number = digits.startsWith("55") ? digits : `55${digits}`;
      return `https://wa.me/${number}?text=${encoded}`;
    }
    return `https://wa.me/?text=${encoded}`;
  };

  const inputCls =
    "w-full bg-[var(--color-surface)] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600";
  const labelCls =
    "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Reunião"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-4 h-9 text-sm"
          >
            Cancelar
          </Button>
          {createdMeeting ? (
            <Button
              onClick={() => onConfirm(createdMeeting.id, createdMeeting.meetLink)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 h-9 text-sm"
            >
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Entrar na Reunião
            </Button>
          ) : (
            <Button
              onClick={handleCreateMeeting}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 h-9 text-sm disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <Video className="w-3.5 h-3.5 mr-1.5" />}
              {loading ? "Criando..." : "Criar Reunião no Google Meet"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Lead info */}
        <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 text-sm font-black text-blue-300 select-none">
            {((lead.company || lead.name || "R").slice(0, 2)).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{lead.company || lead.name}</div>
            <div className="text-xs text-slate-400 truncate">{lead.name}{lead.email ? ` · ${lead.email}` : ""}</div>
          </div>
        </div>

        {/* Video provider toggle */}
        <div>
          <label className={labelCls}><Video className="w-3 h-3" /> Tipo de Sala</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVideoProvider("axis")}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all",
                videoProvider === "axis"
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20"
              )}
            >
              <span className="text-xs font-black">🖥️ Sala S.P.Y.</span>
              <span className="text-[10px] leading-tight opacity-70">Vídeo embutido no CRM — sem sair do sistema</span>
            </button>
            <button
              type="button"
              onClick={() => setVideoProvider("google")}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all",
                videoProvider === "google"
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20"
              )}
            >
              <span className="text-xs font-black">📹 Google Meet</span>
              <span className="text-[10px] leading-tight opacity-70">Cria sala no Google Meet e envia convite</span>
            </button>
          </div>
        </div>

        {/* Google Connect — só aparece quando provider = google */}
        {videoProvider === "google" && (
          <div className={cn(
            "rounded-xl border p-3 space-y-2",
            googleEmail
              ? "bg-emerald-500/[0.07] border-emerald-500/20"
              : googleAuthError
              ? "bg-rose-500/[0.07] border-rose-500/20"
              : "bg-amber-500/[0.05] border-amber-500/20"
          )}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {googleEmail
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <AlertCircle className={cn("w-4 h-4 shrink-0", googleAuthError ? "text-rose-400" : "text-amber-400")} />}
                <div className="min-w-0">
                  <div className={cn("text-xs font-bold", googleEmail ? "text-emerald-400" : googleAuthError ? "text-rose-400" : "text-amber-400")}>
                    {googleEmail ? "Google Conectado" : googleAuthError ? "Erro de autenticação" : "Google não conectado"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {googleEmail || "Conecte para criar sala Meet automaticamente"}
                  </div>
                </div>
              </div>
              {!googleEmail && (
                <Button
                  onClick={handleConnectGoogle}
                  disabled={loading}
                  className="bg-white text-gray-800 hover:bg-gray-100 font-bold px-3 h-7 text-xs shrink-0"
                >
                  Conectar
                </Button>
              )}
            </div>
            {googleAuthError && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] text-rose-300 leading-relaxed">{googleAuthError}</p>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                    <Video className="w-3 h-3 inline mr-1" />Link manual do Google Meet
                  </label>
                  <input
                    type="url"
                    value={manualLink}
                    onChange={(e) => setManualLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full bg-[var(--color-surface)] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}><User className="w-3 h-3" /> Closer Responsável</label>
            <select value={closerName} onChange={(e) => setCloserName(e.target.value)} className={inputCls}>
              <option value="">Selecione o closer...</option>
              {closerOptions.map((c) => (
                <option key={c.name} value={c.name}>{c.name}{c.email ? ` — ${c.email}` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}><Calendar className="w-3 h-3" /> Data</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}><Clock className="w-3 h-3" /> Horário</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}><Clock className="w-3 h-3" /> Duração</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputCls}>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h 30min</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          <div>
            <label className={labelCls}><User className="w-3 h-3" /> E-mail do Lead</label>
            <input
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="email@lead.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}><Phone className="w-3 h-3" /> WhatsApp do Lead</label>
            <input
              type="tel"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className={inputCls}
            />
          </div>

          <div className="col-span-2">
            <label className={labelCls}><FileText className="w-3 h-3" /> Pauta (opcional)</label>
            <textarea
              value={pauta}
              onChange={(e) => setPauta(e.target.value)}
              placeholder="Objetivo da reunião, pontos a discutir..."
              rows={3}
              className={cn(inputCls, "resize-none")}
            />
          </div>
        </div>

        {/* Result after creation */}
        {createdMeeting && (
          <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Reunião criada! {createdMeeting.calendarLink ? "Convite enviado pelo Google Calendar." : "Sala pronta."}
            </div>

            {/* Link da sala */}
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Link da Sala</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={createdMeeting.meetLink}
                  className="flex-1 bg-[var(--color-surface)] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono min-w-0"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(createdMeeting.meetLink); toast.success("Link copiado!"); }}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-xs text-slate-400 hover:text-white transition-all"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <a href={createdMeeting.meetLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-xs text-slate-400 hover:text-white transition-all">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </a>
              </div>
            </div>

            {/* Link do evento no Google Calendar */}
            {createdMeeting.calendarLink && (
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Evento no Google Calendar</p>
                <a
                  href={createdMeeting.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Abrir evento no Calendar
                </a>
              </div>
            )}

            {/* Botão WhatsApp */}
            <a
              href={buildWhatsAppUrl(createdMeeting.meetLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] text-[11px] font-black uppercase tracking-widest transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {leadPhone ? "Enviar convite pelo WhatsApp" : "Compartilhar via WhatsApp"}
            </a>

            {(leadEmail || closerEmail) && (
              <p className="text-[10px] text-slate-500">
                {createdMeeting.calendarLink ? "Convite enviado para:" : "Participantes:"}{" "}
                {[leadEmail, closerEmail].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
