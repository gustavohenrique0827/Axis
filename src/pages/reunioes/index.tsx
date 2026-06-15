import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { Video, Calendar, Clock, User, Search, ExternalLink, Copy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { Reuniao } from "../../contexts/DataContextTypes";

const STATUS_TABS = ["Todas", "Agendada", "Em Andamento", "Concluída", "Cancelada"] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_COLORS: Record<string, string> = {
  Agendada:      "bg-blue-500/10 border-blue-500/20 text-blue-400",
  "Em Andamento":"bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  Concluída:     "bg-slate-700/40 border-white/10 text-slate-400",
  Cancelada:     "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

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

export default function ReunioesList() {
  const { reunioes } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>("Todas");

  const filtered = (reunioes as Reuniao[]).filter((r) => {
    const matchesTab = tab === "Todas" || r.status === tab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (r.leadName || "").toLowerCase().includes(q) ||
      (r.companyName || "").toLowerCase().includes(q) ||
      (r.closerName || "").toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 min-h-full bg-[#0B1120]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Reuniões</h1>
          <p className="text-xs text-slate-500">{reunioes.length} reuniões registradas</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead, empresa ou closer..."
            className="w-full bg-[#111827] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#111827] border border-white/[0.06] rounded-lg p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 rounded text-xs font-bold transition-all",
                tab === t ? "bg-blue-500/20 text-blue-300" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-500 font-semibold">Nenhuma reunião encontrada</p>
          <p className="text-slate-600 text-sm mt-1">
            Reuniões agendadas pelo CRM aparecem aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-[#111827] border border-white/[0.06] rounded-xl p-4 space-y-3 hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{r.companyName || r.leadName}</div>
                  {r.companyName && r.leadName && r.companyName !== r.leadName && (
                    <div className="text-xs text-slate-400 truncate">{r.leadName}</div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0",
                  STATUS_COLORS[r.status] ?? STATUS_COLORS.Agendada
                )}>
                  {r.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 shrink-0 text-slate-500" />
                  {formatDateTime(r.scheduledAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 shrink-0 text-slate-500" />
                  {r.durationMinutes} minutos
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 shrink-0 text-slate-500" />
                  {r.closerName || "Não definido"}
                </div>
              </div>

              {r.pauta && (
                <p className="text-xs text-slate-500 line-clamp-2 border-t border-white/[0.05] pt-2">
                  {r.pauta}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={() => navigate(`/app/reunioes/${r.id}`)}
                  className="flex-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 h-8 text-xs font-bold"
                >
                  <Video className="w-3 h-3 mr-1" /> Entrar
                </Button>
                <button
                  onClick={() => { navigator.clipboard.writeText(r.meetLink); toast.success("Link copiado!"); }}
                  className="h-8 px-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-slate-500 hover:text-white transition-all"
                  title="Copiar link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a href={r.meetLink} target="_blank" rel="noopener noreferrer">
                  <button
                    className="h-8 px-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-slate-500 hover:text-white transition-all"
                    title="Abrir no Meet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
