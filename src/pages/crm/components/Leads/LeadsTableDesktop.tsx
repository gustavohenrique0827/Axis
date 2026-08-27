import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { EmptyState } from "../../../../components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";
import { MoreHorizontal, Mail, Phone, Calendar, Users } from "lucide-react";

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

export function LeadsTableDesktop(props: {
  filteredLeads: any[];
  setSelectedLead: (lead: any) => void;
  updateLead: (leadId: string, payload: any) => void;
  sellers: string[];
}) {
  const { filteredLeads, setSelectedLead, updateLead, sellers } = props;

  return (
    <Card className="overflow-hidden hidden sm:block">
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum lead encontrado"
          description="Ajuste os filtros aplicados para ver mais resultados"
          className="border-none rounded-none"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome & Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status / Prioridade</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Última Interação</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead: any) => (
              <TableRow
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="cursor-pointer group"
              >
                <TableCell>
                  <div className="font-semibold text-[var(--color-text-primary)] group-hover:text-accent transition-colors">{lead.name}</div>
                  <div className="text-[var(--color-text-muted)] text-xs">{lead.company}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs">
                    <Mail className="w-3 h-3 text-[var(--color-text-faint)] shrink-0" /> {lead.email}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-text-muted)] mt-1 text-xs">
                    <Phone className="w-3 h-3 text-[var(--color-text-faint)] shrink-0" /> {lead.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <Badge variant={statusBadgeVariant(lead.status)} className="w-fit">{lead.status}</Badge>
                    <Badge variant={priorityBadgeVariant(lead.priority)} className="w-fit text-[8px] uppercase">{lead.priority}</Badge>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-success">{lead.value}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.seller || ""}
                    onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                    className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-lg px-2.5 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-blue)] cursor-pointer hover:bg-[var(--color-surface-sunken)]"
                  >
                    <option value="">Sem Vendedor</option>
                    {sellers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-[var(--color-text-faint)] text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {lead.date}
                  </div>
                  <div className="text-[10px] mt-0.5 italic text-[var(--color-text-faint)]">{lead.title}</div>
                  {lead.timeIdle !== undefined && lead.timeIdle > 0 && (
                    <div className="mt-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-block ${
                          lead.timeIdle > 7
                            ? "bg-danger/20 text-danger border border-danger/30 animate-pulse"
                            : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        ⏳ {lead.timeIdle}d sem contato
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-sunken)] transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
