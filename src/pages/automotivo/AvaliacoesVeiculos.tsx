import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  CheckSquare, Plus, Search, Car, Gauge, DollarSign,
  CheckCircle2, Clock
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function AvaliacoesVeiculos() {
  const [avaliacoes, setAvaliacoes] = useState([
    { id: "1", veiculo: "Honda Civic Touring 1.5 Turbo 2021", placa: "ABC-1D23", km: 48000, fipe: 135000, oferta: 122000, avaliador: "Oficina & Vistoria Sul", status: "Aprovado / Proposta Feita" },
    { id: "2", veiculo: "Volkswagen T-Cross Highline 2022", placa: "XYZ-9E88", km: 32000, fipe: 118000, oferta: 108000, avaliador: "Oficina & Vistoria Sul", status: "Em Avaliação" },
  ]);

  return (
    <PageContainer
      title="Avaliações de Seminovos & Usados"
      description="Checklist cautelar, laudo de pintura, motor, histórico de leilão e precificação FIPE."
      actions={
        <Button onClick={() => toast.info("Nova avaliação iniciada.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Avaliação
        </Button>
      }
    >
      <div className="space-y-3">
        {avaliacoes.map(av => (
          <div key={av.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{av.veiculo}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] font-bold">
                  {av.placa}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{av.km.toLocaleString("pt-BR")} km</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                FIPE: R$ {av.fipe.toLocaleString("pt-BR")} • Margem Sugerida: <strong className="text-emerald-500">R$ {av.oferta.toLocaleString("pt-BR")}</strong> • Avaliador: {av.avaliador}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                {av.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toast.success("Laudo cautelar aberto.")} className="h-8 text-xs font-bold rounded-xl">
                Ver Laudo Cautelar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
