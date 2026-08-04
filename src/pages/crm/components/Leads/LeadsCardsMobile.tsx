import { Card } from "../../../../components/ui/card";

export function LeadsCardsMobile(props: {
  filteredLeads: any[];
  setSelectedLead: (lead: any) => void;
  updateLead: (leadId: string, payload: any) => void;
  sellers: string[];
}) {
  const { filteredLeads, setSelectedLead, updateLead, sellers } = props;

  return (
    <div className="space-y-3 sm:hidden">
      {filteredLeads.map((lead: any) => (
        <Card
          key={lead.id}
          onClick={() => setSelectedLead(lead)}
          className="p-4 bg-[var(--color-surface-elevated)]/80 border-white/5 active:border-white/20 transition-all flex flex-col gap-3 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h4 className="font-bold text-white text-sm truncate">{lead.name}</h4>
              <p className="text-xs text-slate-400 truncate">{lead.company}</p>
            </div>
            <span
              className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase shrink-0 ml-2 ${
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

          <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2 px-1">
            <div>
              <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Valor</span>
              <span className="font-mono text-emerald-400 text-xs">{lead.value}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Status</span>
              <span
                className={`w-fit px-2 py-0.5 text-[8px] font-black rounded-full border block ${
                  lead.status === "Novo"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : lead.status === "Fechado"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : lead.status === "Em Negociação"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}
              >
                {lead.status}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span className="truncate">{lead.email}</span>
            <span className="shrink-0 font-medium ml-2">{lead.phone}</span>
          </div>

          <div
            className="bg-[var(--color-surface)] border border-white/5 px-2 py-1.5 rounded-lg flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[8px] text-slate-500 uppercase font-black shrink-0">Responsável:</span>
            <select
              value={lead.seller || ""}
              onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
              className="bg-transparent text-[10px] text-slate-300 font-bold focus:outline-none rounded px-1 cursor-pointer min-w-0"
            >
              <option value="">Sem Vendedor</option>
              {sellers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </Card>
      ))}

      {filteredLeads.length === 0 && (
        <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
          Nenhum lead encontrado
        </div>
      )}
    </div>
  );
}

