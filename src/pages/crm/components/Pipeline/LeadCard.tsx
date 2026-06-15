import { useData } from '../../../../contexts/DataContext';
import { Card } from '../../../../components/ui/card';
import {
  Flame, MoreVertical, Calendar, FileText,
  History, ArrowRight, FileDown, Activity,
  Zap, Package, Globe, MapPin, Users,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface LeadCardProps {
  item: any;
  tasks: any[];
  stageName?: string;
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

const SCORE_BAR  = (s: number) => s > 80 ? 'bg-emerald-500' : s > 50 ? 'bg-amber-500' : 'bg-rose-500';
const SCORE_TEXT = (s: number) => s > 80 ? 'text-emerald-400' : s > 50 ? 'text-amber-400' : 'text-rose-400';

const PRIORITY_BADGE: Record<string, string> = {
  Alta:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Média: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Baixa: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

// Source badge mapping
const SOURCE_ICON: Record<string, typeof Globe> = {
  site:       Globe,
  Site:       Globe,
  indicação:  Users,
  Indicação:  Users,
  instagram:  MapPin,
  Instagram:  MapPin,
  whatsapp:   MapPin,
  WhatsApp:   MapPin,
};

function initials(name: string) {
  return (name ?? "").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "–";
}

function formatCreatedAt(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export function LeadCard({
  item, tasks, stageName, draggedLeadId, setDraggedLeadId, updateLead,
  tempDropdownId, setTempDropdownId, openDropdownId, setOpenDropdownId,
  setSelectedLead, handleTransferToComercial, handleExportIAResume,
  setWebhookModalLead, currentPipeline,
}: LeadCardProps) {
  const { products, squads } = useData();

  const isDragging    = draggedLeadId === item.id;
  const hasDelayedTask = tasks.some(
    t => (t.related === item.name || t.related === item.company) && t.status === 'Atrasado'
  );
  const temp      = (item.temperature || 'frio').toLowerCase() as keyof typeof TEMP;
  const score     = item.scoreIA ?? 45;
  const tempStyle = TEMP[temp] ?? TEMP.frio;
  const tags      = Array.isArray(item.tags) ? item.tags : [];
  const timeIdleNum = Number(item.timeIdle) || 0;

  // Linked products — use their price sum as the deal value
  const linkedProducts = (products as any[]).filter(p => (item.productIds || []).includes(p.id));
  const primaryProduct = linkedProducts[0] ?? null;
  const displayValue = linkedProducts.length > 0
    ? formatCurrency(linkedProducts.reduce((s, p) => s + (Number(p.price) || 0), 0))
    : (item.value || 'R$ 0');

  // Squad — find first squad that has this lead's seller as a member
  const leadSquad = (squads as any[]).find(s =>
    (s.membros || []).some((m: string) => m === item.seller || m === item.sellerId)
  ) ?? null;

  // Creation date
  const createdLabel = formatCreatedAt(item.created_at ?? item.createdAt);

  // Source
  const source = item.source as string | undefined;
  const SourceIcon = source ? (SOURCE_ICON[source] ?? Globe) : null;

  return (
    <Card
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", item.id); setDraggedLeadId(item.id); }}
      onClick={() => setSelectedLead(item)}
      className={cn(
        "relative overflow-hidden cursor-grab active:cursor-grabbing group text-left select-none",
        "bg-[#0D1525] border border-white/[0.07] border-l-2 rounded-2xl",
        "hover:border-white/20 hover:bg-[#111827] hover:shadow-lg hover:shadow-black/40",
        "transition-all duration-150",
        tempStyle.accent,
        isDragging && "opacity-40 scale-[0.97] ring-1 ring-blue-500/40",
      )}
    >
      {hasDelayedTask && (
        <span className="absolute top-2.5 right-2.5 flex h-2 w-2 z-10 pointer-events-none">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
      )}

      <div className="p-3 flex flex-col gap-2.5">

        {/* Row 1 — avatar + flame + priority + menu */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/25 flex items-center justify-center text-[8px] font-black text-blue-300 shrink-0">
              {initials(item.seller || item.name)}
            </div>

            {/* Temperature dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setTempDropdownId(tempDropdownId === item.id ? null : item.id); }}
                title={`Temperatura: ${temp}`}
                className="p-0.5 rounded hover:bg-white/5 border-none bg-transparent cursor-pointer"
              >
                <Flame className={`w-3 h-3 ${tempStyle.flame}`} />
              </button>
              {tempDropdownId === item.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setTempDropdownId(null); }} />
                  <div className="absolute left-0 top-full mt-1 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex gap-1" onClick={(e) => e.stopPropagation()}>
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

            {/* Priority badge */}
            {item.priority && (
              <span className={cn(
                "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide",
                PRIORITY_BADGE[item.priority] ?? 'bg-slate-700/40 border-white/10 text-slate-400'
              )}>
                ▲ {item.priority === 'Alta' ? 'ALTO' : item.priority === 'Média' ? 'MÉDIO' : 'BAIXO'}
              </span>
            )}
          </div>

          {/* More menu */}
          <div className="relative shrink-0">
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
                    { icon: Calendar, label: 'Agendar Follow-up', action: () => setOpenDropdownId(null) },
                    { icon: FileText, label: 'Enviar Proposta',   action: () => setOpenDropdownId(null) },
                    { icon: History,  label: 'Ver Histórico',     action: () => { setOpenDropdownId(null); setSelectedLead(item); } },
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

        {/* Lead name */}
        <div>
          <h4 className="text-[12px] font-black text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors uppercase tracking-wide">
            {item.name || item.company || '—'}
          </h4>
          {item.company && item.name && (
            <p className="text-[9px] text-slate-600 truncate mt-0.5">{item.company}</p>
          )}
        </div>

        {/* Pills row: stage + source */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {stageName && (
            <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Zap className="w-2.5 h-2.5" />
              {stageName}
            </span>
          )}
          {source && SourceIcon && (
            <span className="inline-flex items-center gap-1 bg-slate-700/40 border border-white/[0.08] text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              <SourceIcon className="w-2.5 h-2.5" />
              {source}
            </span>
          )}
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3 h-3 shrink-0 ${SCORE_TEXT(score)}`} />
          <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${SCORE_BAR(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={`text-[9px] font-black tabular-nums ${SCORE_TEXT(score)}`}>{score}%</span>
        </div>

        {/* Tags + squad + product */}
        {(tags.length > 0 || leadSquad || primaryProduct) && (
          <div className="flex flex-wrap gap-1">
            {/* Squad badge */}
            {leadSquad && (
              <span
                className="text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide"
                style={{
                  backgroundColor: `${leadSquad.cor ?? '#6366f1'}18`,
                  borderColor: `${leadSquad.cor ?? '#6366f1'}40`,
                  color: leadSquad.cor ?? '#818cf8',
                }}
              >
                ◆ {leadSquad.nome}
              </span>
            )}
            {/* Custom tags */}
            {tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.06] text-slate-400 uppercase tracking-wide">
                {tag}
              </span>
            ))}
            {/* Product badge */}
            {primaryProduct && (
              <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wide">
                <Package className="w-2 h-2 shrink-0" />
                {primaryProduct.name}
              </span>
            )}
          </div>
        )}

        {/* Footer — value + creation date + idle */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] gap-1.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-[11px] font-black text-emerald-400 leading-none">{displayValue}</span>
            {createdLabel && (
              <span className="text-[8px] text-slate-600 font-semibold">{createdLabel}</span>
            )}
          </div>
          <span className={cn(
            "text-[8px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0",
            timeIdleNum > 7
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/20 animate-pulse'
              : timeIdleNum > 3
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
              : 'bg-slate-800/60 text-slate-500 border-white/[0.05]'
          )}>
            ⏳ {timeIdleNum}d
          </span>
        </div>

      </div>
    </Card>
  );
}
