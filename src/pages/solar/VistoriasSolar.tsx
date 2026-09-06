import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardCheck, Plus, Search, Calendar, MapPin,
  Camera, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function VistoriasSolar() {
  const [vistorias, setVistorias] = useState([
    { id: "1", cliente: "Fazenda Santa Maria", endereco: "Rodovia Anhanguera, km 312", dataAgendada: "08/09/2026", responsavel: "Eng. Lucas Peixoto", tipoTelhado: "Metálico / Solo", status: "Agendada" },
    { id: "2", cliente: "Supermercado CompreBem", endereco: "Av. Brasil, 4500", dataAgendada: "05/09/2026", responsavel: "Eng. Lucas Peixoto", tipoTelhado: "Fibrocimento", status: "Concluída / Aprovada" },
    { id: "3", cliente: "Residência Família Moreira", endereco: "Rua das Acácias, 120", dataAgendada: "03/09/2026", responsavel: "Técnico Rafael Lima", tipoTelhado: "Cerâmico Colonial", status: "Concluída / Aprovada" },
  ]);

  return (
    <PageContainer
      title="Vistorias Técnicas de Engenharia"
      description="Checklist técnico de telhado, orientação solar, padrão de entrada e medições estruturais."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/agenda/calendario"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Agendar na Agenda
          </Link>
          <Button onClick={() => toast.info("Checklist de vistoria aberto.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Nova Vistoria
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {vistorias.map(v => (
          <div key={v.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">{v.cliente}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
                  Telhado: {v.tipoTelhado}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Local: {v.endereco} • Engenheiro: <strong className="text-[var(--color-text-primary)]">{v.responsavel}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                v.status.includes("Aprovada")
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                  : "bg-blue-500/10 text-blue-500 border-blue-500/25"
              }`}>
                {v.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toast.success("Relatório de vistoria e fotos abertos.")} className="h-8 text-xs font-bold gap-1 rounded-xl">
                <Camera className="w-3.5 h-3.5" /> Fotos & Laudo
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
