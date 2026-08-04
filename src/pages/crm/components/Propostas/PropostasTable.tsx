import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import {
  FileText, Search, Clock, CheckCircle2, XCircle, User, Download, Trash2, History, Send,
} from "lucide-react";
import { toast } from "sonner";
import { handleDownloadPdf } from "../../utils/proposalPdf";

interface Proposta {
  id: string;
  cliente: string;
  titulo: string;
  valor: string;
  dataCriacao: string;
  vencimento: string;
  status: "Aceita" | "Enviada" | "Aberta" | "Recusada" | string;
  vendedor: string;
}

const STATUS_CONFIG = {
  Aceita:   { color: "text-emerald-400", dot: "bg-emerald-400", icon: CheckCircle2 },
  Enviada:  { color: "text-slate-300", dot: "bg-slate-400", icon: Send },
  Aberta:   { color: "text-amber-400", dot: "bg-amber-400", icon: Clock },
  Recusada: { color: "text-rose-400", dot: "bg-rose-400", icon: XCircle },
};
const DEFAULT_STATUS = { color: "text-slate-300", dot: "bg-slate-400", icon: History };

interface PropostasTableProps {
  propostas: Proposta[];
  search: string;
  onSearchChange: (v: string) => void;
  onUpdateStatus: (id: string, status: Proposta["status"]) => void;
  onDelete: (id: string) => void;
}

export function PropostasTable({ propostas, search, onSearchChange, onUpdateStatus, onDelete }: PropostasTableProps) {
  const filtered = propostas.filter(p =>
    p.cliente.toLowerCase().includes(search.toLowerCase()) ||
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="p-4 bg-[var(--color-surface-elevated)]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente ou título..."
            className="w-full bg-transparent border-white/5 pl-12 h-12 rounded-xl text-sm italic text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info("Filtros extras ativados automaticamente para seller ativo.")}
          >
            Filtros Avançados
          </Button>
        </div>
      </Card>

      <div className="overflow-x-auto pb-12">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-xs text-slate-500 px-4">
              <th className="text-left pb-2 pl-6">Cliente / Título</th>
              <th className="text-left pb-2">Valor</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-left pb-2">Datas</th>
              <th className="text-left pb-2">Vendedor</th>
              <th className="text-right pb-2 pr-6">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || DEFAULT_STATUS;
              return (
                <tr key={item.id} className="group bg-[var(--color-surface-elevated)]/80 hover:bg-white/[0.03] transition-all">
                  <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{item.cliente}</div>
                        <div className="text-xs text-slate-500">{item.titulo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="text-sm font-medium text-white">{item.valor}</div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs w-fit ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {item.status}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => onUpdateStatus(item.id, "Aceita")} className="px-1.5 py-0.5 text-[10px] text-emerald-400 rounded hover:bg-emerald-500/10">Aceitar</button>
                        <button onClick={() => onUpdateStatus(item.id, "Recusada")} className="px-1.5 py-0.5 text-[10px] text-rose-400 rounded hover:bg-rose-500/10">Recusar</button>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="text-[10px] text-slate-400">Criada: {item.dataCriacao}</div>
                    <div className="text-[10px] text-rose-400">Venc: {item.vencimento}</div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-xs text-slate-300">{item.vendedor}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-white/5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleDownloadPdf(item as any)} title="Baixar Contrato (PDF)" className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} title="Deletar Proposta" className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
