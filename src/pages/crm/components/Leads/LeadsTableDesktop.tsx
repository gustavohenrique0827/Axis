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
    <Card className="bg-[var(--color-surface-elevated)]/80 border border-white/10 overflow-hidden hidden sm:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-[var(--color-surface)]/50 border-b border-white/10">
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
                  <div className="font-medium text-white">{lead.name}</div>
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
                    <span className={`inline-flex items-center gap-1.5 w-fit text-xs ${
                      lead.status === "Fechado" ? "text-emerald-400" :
                      lead.status === "Perdido" ? "text-rose-400" :
                      "text-slate-300"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        lead.status === "Fechado" ? "bg-emerald-400" :
                        lead.status === "Perdido" ? "bg-rose-400" :
                        "bg-slate-400"
                      }`} />
                      {lead.status}
                    </span>
                    <span className={`w-fit text-[10px] ${
                      lead.priority === "Alta" ? "text-rose-400" :
                      lead.priority === "Média" ? "text-amber-400" : "text-slate-400"
                    }`}>
                      {lead.priority}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-300">{lead.value}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.seller || ""}
                    onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                    className="bg-[var(--color-surface)]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white/20 cursor-pointer hover:bg-white/5"
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
                    <div className={`mt-1.5 text-[10px] ${lead.timeIdle > 7 ? "text-rose-400" : "text-slate-500"}`}>
                      {lead.timeIdle}d sem contato
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

