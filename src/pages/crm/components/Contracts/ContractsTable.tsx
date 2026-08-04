import { Card } from "../../../../components/ui/card";
import { FileText, Search, Edit2, Trash2, ChevronRight } from "lucide-react";

interface Contract {
  id: string;
  client: string;
  plan: string;
  mrr: string | number;
  status: string;
  date: string;
  progress?: number;
}

interface ContractsTableProps {
  contracts: Contract[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLE: Record<string, { text: string; dot: string }> = {
  Ativo:        { text: "text-emerald-400", dot: "bg-emerald-400" },
  Inadimplente: { text: "text-amber-400", dot: "bg-amber-400" },
  Cancelado:    { text: "text-rose-400", dot: "bg-rose-400" },
};
const DEFAULT_STATUS_STYLE = { text: "text-slate-400", dot: "bg-slate-400" };

export function ContractsTable({ contracts, searchQuery, onSearchChange, onDelete }: ContractsTableProps) {
  const filtered = contracts.filter(c =>
    c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-[var(--color-surface-elevated)]/50 border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar contratos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[var(--color-surface)] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-white/20 outline-none w-full"
          />
        </div>
        <select className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-white/20">
          <option>Todos os Planos</option>
          <option>Enterprise</option>
          <option>Pro</option>
          <option>Starter</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-[var(--color-surface)]/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4">MRR</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assinatura</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((contract) => {
              const statusStyle = STATUS_STYLE[contract.status] ?? DEFAULT_STATUS_STYLE;
              return (
              <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-medium text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {contract.client}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-300">{contract.plan}</td>
                <td className="px-6 py-4 font-mono font-medium text-slate-300">{contract.mrr}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${statusStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  <div className="flex flex-col justify-center gap-1.5 h-[36px]">
                    {contract.date}
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${contract.progress ?? 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(contract.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors ml-1">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
