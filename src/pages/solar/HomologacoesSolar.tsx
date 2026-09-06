import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  FileCheck, Clock, CheckCircle2, AlertTriangle, FileText,
  Building2, ExternalLink
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function HomologacoesSolar() {
  const [protocolos, setProtocolos] = useState([
    { id: "1", cliente: "Supermercado CompreBem", concessionaria: "CPFL Paulista", protocolo: "CPFL-2026-98124", etapa: "Parecer de Acesso Emitido", prazoConcessionaria: "14/09/2026", status: "Aprovado / Aguardando Troca de Medidor" },
    { id: "2", cliente: "Residência Família Moreira", concessionaria: "Enel SP", protocolo: "ENEL-SOL-4412", etapa: "Solicitação de Acesso", prazoConcessionaria: "18/09/2026", status: "Em Análise Técnica" },
    { id: "3", cliente: "Fazenda Santa Maria", concessionaria: "CPFL Paulista", protocolo: "CPFL-2026-77312", etapa: "Vistoria da Distribuidora", prazoConcessionaria: "10/09/2026", status: "Agendado com Concessionária" },
  ]);

  return (
    <PageContainer
      title="Homologações Junto à Concessionária"
      description="Tramitação de projetos elétricos, solicitação de parecer de acesso e troca de medidor bidirecional."
    >
      <div className="space-y-3">
        {protocolos.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{p.cliente}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-primary-blue)] font-bold">
                  {p.protocolo}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Concessionária: <strong className="text-[var(--color-text-primary)]">{p.concessionaria}</strong> • Etapa: {p.etapa} • Prazo Legal: {p.prazoConcessionaria}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                {p.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toast.success("Documentos da concessionária abertos.")} className="h-8 text-xs font-bold gap-1 rounded-xl">
                <FileText className="w-3.5 h-3.5" /> ART & Diagrama
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
