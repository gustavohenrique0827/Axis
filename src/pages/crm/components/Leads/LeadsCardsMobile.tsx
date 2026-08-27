import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { EmptyState } from "../../../../components/ui/empty-state";
import { Users } from "lucide-react";

function statusBadgeVariant(status: string): "secondary" | "info" | "warning" | "success" | "destructive" {
  if (status === "Novo") return "secondary";
  if (status === "Qualificado") return "info";
  if (status === "Em Negociação") return "warning";
  if (status === "Fechado") return "success";
  return "destructive";
}

function priorityBadgeVariant(priority: string): "destructive" | "warning" | "info" {
  if (priority === "Alta") return "destructive";
  if (priority === "Média") return "warning";
  return "info";
}

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
          className="p-4 transition-all flex flex-col gap-3 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h4 className="font-bold text-[var(--color-text-primary)] text-sm truncate">{lead.name}</h4>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{lead.company}</p>
            </div>
            <Badge variant={priorityBadgeVariant(lead.priority)} className="shrink-0 ml-2 text-[8px] uppercase">
              {lead.priority}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--color-border-subtle)] py-2 px-1">
            <div>
              <span className="text-[8px] text-[var(--color-text-faint)] uppercase font-bold block mb-0.5">Valor</span>
              <span className="font-mono text-success text-xs">{lead.value}</span>
            </div>
            <div>
              <span className="text-[8px] text-[var(--color-text-faint)] uppercase font-bold block mb-0.5">Status</span>
              <Badge variant={statusBadgeVariant(lead.status)} className="text-[8px]">{lead.status}</Badge>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[var(--color-text-faint)]">
            <span className="truncate">{lead.email}</span>
            <span className="shrink-0 font-medium ml-2">{lead.phone}</span>
          </div>

          <div
            className="bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] px-2 py-1.5 rounded-lg flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[8px] text-[var(--color-text-faint)] uppercase font-black shrink-0">Responsável:</span>
            <select
              value={lead.seller || ""}
              onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
              className="bg-transparent text-[10px] text-[var(--color-text-muted)] font-bold focus:outline-none rounded px-1 cursor-pointer min-w-0"
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
        <EmptyState icon={Users} title="Nenhum lead encontrado" />
      )}
    </div>
  );
}
