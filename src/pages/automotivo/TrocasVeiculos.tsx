import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  TrendingUp, Plus, Search, Car, ArrowRightLeft,
  DollarSign, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function TrocasVeiculos() {
  const [trocas, setTrocas] = useState([
    { id: "1", cliente: "Fábio Vasconcelos", veiculoEntrada: "Ford Ka 1.0 SE 2019 (Avaliado em R$ 42.000)", veiculoSaida: "Jeep Compass Longitude 2023 (R$ 152.000)", diferenca: 110000, formaPagamento: "Entrada + Financiamento Santander", status: "Em Análise de Crédito" },
  ]);

  return (
    <PageContainer
      title="Negociações com Troca / Veículo na Entrada"
      description="Gerenciamento de negócios comerciais envolvendo veículo seminovo como parte do pagamento."
    >
      <div className="space-y-3">
        {trocas.map(t => (
          <div key={t.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-1">Cliente: {t.cliente}</h4>
              <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                <p>🚗 <strong>Entrada:</strong> {t.veiculoEntrada}</p>
                <p>🚙 <strong>Desejado:</strong> {t.veiculoSaida}</p>
                <p>💵 <strong>Diferença a Cobrir:</strong> <span className="text-emerald-500 font-bold">R$ {t.diferenca.toLocaleString("pt-BR")}</span> ({t.formaPagamento})</p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 self-start sm:self-auto">
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
