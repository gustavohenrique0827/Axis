import { Card } from '../../../../components/ui/card';
import {
  Flame, MoreVertical, Calendar, FileText,
  History, ArrowRight, FileDown, Activity,
} from 'lucide-react';

interface LeadCardProps {
  item: any;
  tasks: any[];
  draggedLeadId: string | null;
  setDraggedLeadId: (id: string | null) => void;
  updateLead: (id: string, updates: Partial<any>) => void;
  tempDropdownId: string | null;
  setTempDropdownId: (id: string | null) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  setSelectedLead: (lead: any) => void;
  handleTransferToComercial: (e: any, lead: any) => void;
  handleExportIAResume: (e: any, lead: any) => void;
  setWebhookModalLead: (lead: any) => void;
  currentPipeline: 'comercial' | 'sdr';
}

const TEMP: Record<string, { flame: string; accent: string }> = {
  quente: { flame: 'text-rose-500',  accent: 'border-l-rose-500/60'  },
  morno:  { flame: 'text-amber-500', accent: 'border-l-amber-500/50' },
  frio:   { flame: 'text-blue-500',  accent: 'border-l-blue-500/30'  },
};

const SCORE_COLOR = (s: number) =>
  s > 80 ? 'bg-emerald-500' : s > 50 ? 'bg-amber-500' : 'bg-rose-500';

const PRIORITY_BADGE: Record<string, string> = {
  Alta:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Média: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Baixa: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function initials(name: string) {
  return (name ?? "").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "–";
}

export function LeadCard({
  item, tasks, draggedLeadId, setDraggedLeadId, updateLead,
  tempDropdownId, setTempDropdownId, openDropdownId, setOpenDropdownId,
  setSelectedLead, handleTransferToComercial, handleExportIAResume,
  setWebhookModalLead, currentPipeline,
}: LeadCardProps) {
  const isDragging = draggedLeadId === item.id;
  const hasDelayedTask = tasks.some(
    t => (t.related === item.name || t.related === item.company) && t.status === 'Atrasado'
  );
  const temp = (item.temperature || 'frio').toLowerCase() as keyof typeof TEMP;
  const score = item.scoreIA ?? 45;
  const tempStyle = TEMP[temp] ?? TEMP.frio;

  return (
    <Card
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", item.id); setDraggedLeadId(item.id); }}
      onClick={() => setSelectedLead(item)}
      className={[
        "relative overflow-hidden cursor-grab active:cursor-grabbing group text-left select-none",
        "bg-[#0D1525] border border-white/[0.07] border-l-2 rounded-2xl",
        "hover:border-white/20 hover:bg-[#111827] hover:shadow-lg hover:shadow-black/40",
        "transition-all duration-150",
        tempStyle.accent,
        isDragging ? "opacity-40 scale-[0.97] ring-1 ring-blue-500/40" : "",
      ].join(" ")}
    >
      {/* Delayed task ping */}
      {hasDelayedTask && (
        <span className="absolute top-2.5 right-2.5 flex h-2 w-2 z-10 pointer-events-none">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}

      <div className="p-3 flex flex-col gap-2">

        {/* Row 1 — seller + temp + menu */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/25 flex items-center justify-center text-[8px] font-black text-blue-300 shrink-0">
              {initials(item.seller)}
            </div>
            <span className="text-[9px] font-semibold text-slate-500 truncate">
              {item.seller?.split(' ')[0] || '—'}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Temperature */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setTempDropdownId(tempDropdownId === item.id ? null : item.id); }}
                title={`Temperatura: ${temp}`}
                className="p-1 rounded hover:bg-white/5 border-none bg-transparent cursor-pointer"
              >
                <Flame className={`w-3 h-3 ${tempStyle.flame}`} />
              </button>
              {tempDropdownId === item.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setTempDropdownId(null); }} />
                  <div className="absolute right-0 top-full mt-1 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {(['quente', 'morno', 'frio'] as const).map((t) => (
                      <button key={t} onClick={() => { updateLead(item.id, { temperature: t }); setTempDropdownId(null); }}
                        className={`p-2 hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer ${TEMP[t].flame}`} title={t}>
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === item.id ? null : item.id); }}
                className="p-1 rounded hover:bg-white/5 border-none bg-transparent cursor-pointer text-slate-600 hover:text-slate-300 transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              {openDropdownId === item.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    {[
                      { icon: Calendar,  label: 'Agendar Follow-up',  action: () => setOpenDropdownId(null) },
                      { icon: FileText,  label: 'Enviar Proposta',    action: () => setOpenDropdownId(null) },
                      { icon: History,   label: 'Ver Histórico',      action: () => { setOpenDropdownId(null); setSelectedLead(item); } },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-left">
                        <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
                      </button>
                    ))}

                    {currentPipeline === 'sdr' && (
                      <>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={(e) => handleTransferToComercial(e, item)}
                          className="flex items-center gap-2 w-full p-2 hover:bg-blue-500/10 rounded-lg text-xs font-semibold text-blue-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Transf. Inteligente
                        </button>
                        <button onClick={(e) => handleExportIAResume(e, item)}
                          className="flex items-center gap-2 w-full p-2 hover:bg-emerald-500/10 rounded-lg text-xs font-semibold text-emerald-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                          <FileDown className="w-3.5 h-3.5 shrink-0" /> Exportar Resumo IA
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setWebhookModalLead(item); }}
                          className="flex items-center gap-2 w-full p-2 hover:bg-purple-500/10 rounded-lg text-xs font-semibold text-purple-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                          <Activity className="w-3.5 h-3.5 shrink-0" /> Configurar Webhook
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2 — name + company */}
        <div>
          <h4 className="text-[12px] font-bold text-white leading-tight line-clamp-1 group-hover:text-blue-300 transition-colors">
            {item.name}
          </h4>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.company}</p>
        </div>

        {/* SDR score bar */}
        {currentPipeline === 'sdr' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${SCORE_COLOR(score)}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-[9px] font-black text-slate-400 tabular-nums w-6 text-right">{score}%</span>
          </div>
        )}

        {/* Footer — value + priority + idle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="font-mono text-[11px] font-bold text-emerald-400">{item.value || 'R$ 0'}</span>
          <div className="flex items-center gap-1">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${PRIORITY_BADGE[item.priority] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {item.priority}
            </span>
            {item.timeIdle !== undefined && item.timeIdle > 0 && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                item.timeIdle > 7
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-slate-800/80 text-slate-500'
              }`}>
                {item.timeIdle}d
              </span>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
