import { Card } from "../../../../components/ui/card";
import {
  MoreHorizontal, Mail, Phone, Calendar, Search,
  Users, ArrowUpDown,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  priority?: string;
  value?: string;
  seller?: string;
  date?: string;
  title?: string;
  temperature?: string;
  timeIdle?: number;
}

interface LeadsTableProps {
  leads: Lead[];
  sellers: string[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  temperatureFilter: string;
  onTemperatureChange: (v: string) => void;
  sortOrder: "asc" | "desc";
  onSortToggle: () => void;
  onUpdateLead: (id: string, data: any) => void;
  onSelectLead: (lead: Lead) => void;
}

export function LeadsTable({
  leads, sellers, searchQuery, onSearchChange,
  temperatureFilter, onTemperatureChange,
  sortOrder, onSortToggle, onUpdateLead, onSelectLead,
}: LeadsTableProps) {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa ou e-mail..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#111827]/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[#111827]/80 border border-white/5 rounded-xl px-3 h-[42px]">
          <span className="text-[9px] uppercase font-bold text-slate-500">Temp:</span>
          <select
            value={temperatureFilter}
            onChange={(e) => onTemperatureChange(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
          >
            <option value="Todas">Todas</option>
            <option value="quente">🔥 Quente</option>
            <option value="morno">☀️ Morno</option>
            <option value="frio">❄️ Frio</option>
          </select>
        </div>
        <button
          onClick={onSortToggle}
          className="flex items-center gap-1.5 bg-[#111827]/80 border border-white/5 rounded-xl px-3 h-[42px] text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowUpDown className="w-3 h-3" />
          Temp {sortOrder === "desc" ? "▼" : "▲"}
        </button>
      </div>

      {/* Desktop table */}
      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nome & Empresa</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status / Prioridade</th>
                <th className="px-6 py-4">Valor Estimado</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Última Interação</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-[#06B6D4] transition-colors">{lead.name}</div>
                    <div className="text-slate-400 text-xs">{lead.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Mail className="w-3 h-3 text-slate-600 shrink-0" /> {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 mt-1 text-xs">
                      <Phone className="w-3 h-3 text-slate-600 shrink-0" /> {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`w-fit px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                        lead.status === "Novo"           ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        lead.status === "Qualificado"    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                        lead.status === "Em Negociação"  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        lead.status === "Fechado"        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                           "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>{lead.status}</span>
                      <span className={`w-fit px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${
                        lead.priority === "Alta"  ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        lead.priority === "Média" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>{lead.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-emerald-400/80">{lead.value}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.seller || ""}
                      onChange={(e) => onUpdateLead(lead.id, { seller: e.target.value })}
                      className="bg-[#0B1120]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-white/5"
                    >
                      <option value="">Sem Vendedor</option>
                      {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {lead.date}
                    </div>
                    <div className="text-[10px] mt-0.5 italic text-slate-600">{lead.title}</div>
                    {lead.timeIdle !== undefined && lead.timeIdle > 0 && (
                      <div className="mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-block ${
                          lead.timeIdle > 7 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" : "bg-slate-800 text-slate-500"
                        }`}>
                          ⏳ {lead.timeIdle}d sem contato
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Nenhum lead encontrado com os filtros aplicados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className="p-4 bg-[#111827]/80 border-white/5 active:border-white/20 transition-all flex flex-col gap-3 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{lead.name}</h4>
                <p className="text-xs text-slate-400 truncate">{lead.company}</p>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase shrink-0 ml-2 ${
                lead.priority === "Alta"  ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                lead.priority === "Média" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>{lead.priority}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2 px-1">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Valor</span>
                <span className="font-mono text-emerald-400 text-xs">{lead.value}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Status</span>
                <span className={`w-fit px-2 py-0.5 text-[8px] font-black rounded-full border block ${
                  lead.status === "Novo"          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  lead.status === "Fechado"       ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  lead.status === "Em Negociação" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}>{lead.status}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="truncate">{lead.email}</span>
              <span className="shrink-0 font-medium ml-2">{lead.phone}</span>
            </div>

            <div className="bg-[#0B1120] border border-white/5 px-2 py-1.5 rounded-lg flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-[8px] text-slate-500 uppercase font-black shrink-0">Responsável:</span>
              <select
                value={lead.seller || ""}
                onChange={(e) => onUpdateLead(lead.id, { seller: e.target.value })}
                className="bg-transparent text-[10px] text-slate-300 font-bold focus:outline-none rounded px-1 cursor-pointer min-w-0"
              >
                <option value="">Sem Vendedor</option>
                {sellers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
        {leads.length === 0 && (
          <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
            Nenhum lead encontrado
          </div>
        )}
      </div>
    </>
  );
}
