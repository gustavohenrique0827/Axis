import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/ui/empty-state";
import { NovaReuniaoModal } from "../../components/ui/modals/reunioes/NovaReuniaoModal";
import { ConfirmModal } from "../../components/ui/modals/shared/ConfirmModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  User,
  Search,
  ExternalLink,
  Copy,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Video,
  Plus,
  Trash2,
  Phone,
  MessageSquare,
  RefreshCw,
  Building2,
  Filter,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Reuniao } from "../../contexts/DataContextTypes";

type ViewMode = "mes" | "semana" | "dia" | "lista";
type StatusFilter = "Todos" | "Agendada" | "Em Andamento" | "Concluída" | "Cancelada";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaCRM() {
  const { reunioes, deleteReuniao, updateReuniao, leads, colaboradores } = useData();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewMode>("mes");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [selectedCloser, setSelectedCloser] = useState<string>("Todos");

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(() => new Date());
  const [showNovaReuniao, setShowNovaReuniao] = useState(false);
  const [reuniaoToDelete, setReuniaoToDelete] = useState<string | null>(null);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const all = reunioes as Reuniao[];

  const closerList = useMemo(() => {
    const fromColab = (colaboradores || [])
      .filter((c: any) => c.nome && c.status !== "Desligado")
      .map((c: any) => c.nome as string);
    const fromReunioes = all.map((r) => r.closerName).filter(Boolean);
    return Array.from(new Set([...fromColab, ...fromReunioes]));
  }, [colaboradores, all]);

  const filteredReunioes = useMemo(() => {
    return all.filter((r) => {
      const matchesStatus = statusFilter === "Todos" || r.status === statusFilter;
      const matchesCloser = selectedCloser === "Todos" || r.closerName === selectedCloser;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (r.leadName || "").toLowerCase().includes(q) ||
        (r.companyName || "").toLowerCase().includes(q) ||
        (r.closerName || "").toLowerCase().includes(q) ||
        (r.pauta || "").toLowerCase().includes(q);

      return matchesStatus && matchesCloser && matchesSearch;
    });
  }, [all, statusFilter, selectedCloser, search]);

  // Today metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeetings = all.filter((r) => r.scheduledAt?.startsWith(todayStr));
  const todayConfirmed = todayMeetings.filter((r) => r.status === "Agendada" || r.status === "Em Andamento");

  const nextMeeting = useMemo(() => {
    const now = new Date();
    return all
      .filter((r) => r.status === "Agendada" && new Date(r.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] ?? null;
  }, [all]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    if (view === "mes") setCurrentDate(new Date(year, month - 1, 1));
    else if (view === "semana") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (view === "mes") setCurrentDate(new Date(year, month + 1, 1));
    else if (view === "semana") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayDate(new Date());
  };

  const handleSyncGoogle = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Agenda sincronizada com o Google Calendar!");
    }, 1200);
  };

  const handleCopyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link da videoconferência copiado!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Em Andamento":
        return <Badge variant="success" dot dotPulse>Ao Vivo</Badge>;
      case "Agendada":
        return <Badge variant="info" dot>Agendada</Badge>;
      case "Concluída":
        return <Badge variant="secondary">Concluída</Badge>;
      case "Cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title="Agenda Comercial CRM"
      description="Controle de compromissos, reuniões de fechamento, follow-ups e demonstrações de vendas."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={handleSyncGoogle}
            disabled={isSyncing}
            className="text-xs font-bold gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[var(--color-primary-blue)]" : ""}`} />
            Sincronizar Google
          </Button>

          <Button
            onClick={() => setShowNovaReuniao(true)}
            className="gap-2 font-bold px-4 h-9 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Top KPIs Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                Compromissos Hoje
              </span>
              <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--color-text-primary)] font-mono">
              {todayMeetings.length}
            </div>
            <p className="text-[11px] text-[var(--color-text-faint)] mt-1">
              {todayConfirmed.length} confirmados no dia
            </p>
          </Card>

          <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Agendado (Mês)
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--color-text-primary)] font-mono">
              {all.filter((r) => r.status === "Agendada").length}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
              Pipeline ativo de conversão
            </p>
          </Card>

          <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                Reuniões Realizadas
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {all.filter((r) => r.status === "Concluída").length}
            </div>
            <p className="text-[11px] text-[var(--color-text-faint)] mt-1">
              Histórico com ata e notas salvas
            </p>
          </Card>

          <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                Próximo Alinhamento
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            {nextMeeting ? (
              <div>
                <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                  {nextMeeting.leadName || nextMeeting.companyName}
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5">
                  {new Date(nextMeeting.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {nextMeeting.closerName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-faint)] mt-1">Nenhum compromisso pendente</p>
            )}
          </Card>
        </div>

        {/* Controls Bar: Views, Date Navigation & Filters */}
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* View switcher & Date Nav */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-[var(--color-surface-sunken)] p-1 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                {[
                  { id: "mes" as const, label: "Mês" },
                  { id: "semana" as const, label: "Semana" },
                  { id: "dia" as const, label: "Dia" },
                  { id: "lista" as const, label: "Lista" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setView(t.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-none ${
                      view === t.id
                        ? "bg-[var(--color-primary-blue)] text-white shadow-xs"
                        : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-[var(--color-surface-sunken)] px-2 py-1 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)]">
                <Button variant="ghost" size="xs" onClick={handlePrev} className="h-7 w-7 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2.5 py-1 text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-md transition-colors cursor-pointer border-none bg-transparent"
                >
                  Hoje
                </button>
                <Button variant="ghost" size="xs" onClick={handleNext} className="h-7 w-7 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <span className="text-sm font-black text-[var(--color-text-primary)] ml-2">
                {MONTH_NAMES[month]} {year}
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <Input
                  type="text"
                  placeholder="Buscar lead ou closer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-9 px-3 rounded-[var(--radius-control)] bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
              >
                <option value="Todos">Status: Todos</option>
                <option value="Agendada">Agendada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>

              <select
                value={selectedCloser}
                onChange={(e) => setSelectedCloser(e.target.value)}
                className="h-9 px-3 rounded-[var(--radius-control)] bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
              >
                <option value="Todos">Closer: Todos</option>
                {closerList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* View Renderings */}
        {view === "mes" && (
          <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DOW.map((d) => (
                <div key={d} className="py-2 text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  {d}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-[var(--color-surface-sunken)]/30 rounded-[var(--radius-control)] opacity-30 border border-transparent" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isToday = dayDateStr === todayStr;
                const dayMeetings = filteredReunioes.filter((r) => r.scheduledAt?.startsWith(dayDateStr));

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      setSelectedDayDate(new Date(year, month, dayNum));
                      setView("dia");
                    }}
                    className={`min-h-[110px] p-2 rounded-[var(--radius-control)] border transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? "bg-[var(--color-primary-blue)]/5 border-[var(--color-primary-blue)]/40 shadow-xs"
                        : "bg-[var(--color-surface-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-primary-blue)]/30 hover:bg-[var(--color-surface-sunken)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isToday ? "text-[var(--color-primary-blue)] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-primary-blue)]/10" : "text-[var(--color-text-primary)]"}`}>
                        {dayNum}
                      </span>
                      {dayMeetings.length > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                          {dayMeetings.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayMeetings.slice(0, 2).map((r) => (
                        <div
                          key={r.id}
                          className="px-1.5 py-0.5 rounded bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] border border-[var(--color-primary-blue)]/20 text-[10px] font-bold truncate"
                          title={`${r.leadName || r.companyName} (${new Date(r.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`}
                        >
                          {new Date(r.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {r.leadName || r.companyName}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <span className="text-[9px] text-[var(--color-text-faint)] font-bold block pl-1">
                          +{dayMeetings.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {view === "dia" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[var(--color-primary-blue)]" />
                    Compromissos de {selectedDayDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Linha do tempo diária de negociações e videochamadas
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowNovaReuniao(true)} className="gap-1 font-bold text-xs">
                  <Plus className="w-3.5 h-3.5" /> Agendar
                </Button>
              </div>

              {/* Day slots list */}
              {(() => {
                const dayDateStr = selectedDayDate.toISOString().slice(0, 10);
                const dayMeetings = filteredReunioes.filter((r) => r.scheduledAt?.startsWith(dayDateStr));

                if (dayMeetings.length === 0) {
                  return (
                    <EmptyState
                      icon={CalendarDays}
                      title="Nenhum compromisso neste dia"
                      description="Clique em 'Novo Agendamento' para marcar uma reunião com o lead."
                      className="py-12"
                    />
                  );
                }

                return (
                  <div className="space-y-3">
                    {dayMeetings.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-panel)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--color-primary-blue)]/40 transition-all shadow-xs"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-blue)]/10 border border-[var(--color-primary-blue)]/20 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                                {r.leadName || r.companyName || "Reunião Comercial"}
                              </h4>
                              {getStatusBadge(r.status)}
                            </div>
                            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                              {r.companyName && <span>{r.companyName} • </span>}
                              Closer: <strong className="text-[var(--color-text-primary)]">{r.closerName || "Não atribuído"}</strong>
                            </p>
                            {r.pauta && (
                              <p className="text-[11px] text-[var(--color-text-faint)] italic mt-1 line-clamp-1">
                                Pauta: {r.pauta}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-2.5 py-1 rounded-md">
                            {new Date(r.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>

                          {r.meetLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(r.meetLink)}
                              title="Copiar Link da Reunião"
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => navigate(`/app/reuniao/${r.id}`)}
                            className="gap-1.5 h-8 text-xs font-bold"
                          >
                            <Video className="w-3.5 h-3.5" /> Entrar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>

            {/* Quick lead info / Sidebar */}
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2">
                <Building2 className="w-4 h-4 text-emerald-500" /> Próximos Passos Comerciais
              </h3>

              <div className="space-y-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[var(--radius-control)]">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mb-1">Dica de Conversão</p>
                  <p className="text-[11px]">Envie a pauta prévia e lembrete pelo WhatsApp 30 minutos antes para reduzir a taxa de no-show para menos de 5%.</p>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-faint)]">Vendedores em Atividade</p>
                  <div className="flex flex-wrap gap-1.5">
                    {closerList.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[10px] font-bold text-[var(--color-text-primary)]">
                        👤 {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {(view === "lista" || view === "semana") && (
          <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-[var(--color-primary-blue)]" /> Lista Geral de Agendamentos ({filteredReunioes.length})
              </h3>
            </div>

            {filteredReunioes.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nenhum agendamento encontrado"
                description="Ajuste os filtros de pesquisa ou crie um novo agendamento."
                className="py-12"
              />
            ) : (
              <div className="space-y-2.5">
                {filteredReunioes.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/40 rounded-[var(--radius-control)] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                            {r.leadName || r.companyName}
                          </span>
                          {getStatusBadge(r.status)}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          {r.companyName && <span>{r.companyName} • </span>}
                          Responsável: <strong className="text-[var(--color-text-primary)]">{r.closerName || "Não atribuído"}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                        {new Date(r.scheduledAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} às {new Date(r.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>

                      {r.meetLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(r.meetLink)}
                          className="h-8 text-xs font-bold gap-1"
                        >
                          <Copy className="w-3 h-3" /> Link
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => navigate(`/app/reuniao/${r.id}`)}
                        className="h-8 text-xs font-bold gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Abrir Sala
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReuniaoToDelete(r.id)}
                        className="h-8 w-8 p-0 text-[var(--color-text-faint)] hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modais */}
      <NovaReuniaoModal
        isOpen={showNovaReuniao}
        onClose={() => setShowNovaReuniao(false)}
      />

      <ConfirmModal
        isOpen={!!reuniaoToDelete}
        onClose={() => setReuniaoToDelete(null)}
        onConfirm={() => {
          if (reuniaoToDelete) {
            deleteReuniao(reuniaoToDelete);
            toast.success("Agendamento removido!");
            setReuniaoToDelete(null);
          }
        }}
        title="Cancelar Agendamento"
        message="Tem certeza que deseja cancelar esta reunião comercial da agenda?"
      />

      {selectedLeadForDetails && (
        <LeadDetailsModal
          isOpen={!!selectedLeadForDetails}
          lead={selectedLeadForDetails}
          onClose={() => setSelectedLeadForDetails(null)}
        />
      )}
    </PageContainer>
  );
}

