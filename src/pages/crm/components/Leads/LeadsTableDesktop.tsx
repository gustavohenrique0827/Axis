import { Card } from "../../../../components/ui/card";
import { MoreHorizontal, Mail, Phone, Calendar, Users } from "lucide-react";

export function LeadsTableDesktop(props: {
  filteredLeads: any[];
  setSelectedLead: (lead: any) => void;
  updateLead: (leadId: string, payload: any) => void;
  sellers: string[];
}) {
  const { filteredLeads, setSelectedLead, updateLead, sellers } = props;

  return (
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
            {filteredLeads.map((lead: any) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
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
                    <span
                      className={`w-fit px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                        lead.status === "Novo"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : lead.status === "Qualificado"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : lead.status === "Em Negociação"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : lead.status === "Fechado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {lead.status}
                    </span>
                    <span
                      className={`w-fit px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${
                        lead.priority === "Alta"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : lead.priority === "Média"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-emerald-400/80">{lead.value}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.seller || ""}
                    onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                    className="bg-[#0B1120]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-white/5"
                  >
                    <option value="">Sem Vendedor</option>
                    {sellers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {lead.date}
                  </div>
                  <div className="text-[10px] mt-0.5 italic text-slate-600">{lead.title}</div>
                  {lead.timeIdle !== undefined && lead.timeIdle > 0 && (
                    <div className="mt-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-block ${
                          lead.timeIdle > 7
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
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

            {filteredLeads.length === 0 && (
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
  );
}

