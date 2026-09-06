import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Handshake, Plus, Search, Car, DollarSign,
  User, CheckCircle2, Clock
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function ConsignacoesVeiculos() {
  const [consignacoes, setConsignacoes] = useState([
    { id: "1", veiculo: "Mercedes-Benz C200 AMG Line 2022", consignante: "Eduardo Prado", telefone: "(11) 98888-1122", valorPedido: 215000, comissaoAgencia: "6%", repasseCombinado: 202100, status: "No Pátio" },
    { id: "2", veiculo: "Audi Q3 Prestige Plus 2023", consignante: "Juliana Rocha", telefone: "(11) 97777-3344", valorPedido: 195000, comissaoAgencia: "5%", repasseCombinado: 185250, status: "Vendido / Repasse Pendente" },
  ]);

  return (
    <PageContainer
      title="Veículos em Consignação & Repasses"
      description="Contratos de consignação, comissão retida e cálculo automático de repasse ao proprietário."
      actions={
        <Button onClick={() => toast.info("Para consignar, cadastre um novo veículo marcando a opção Consignado.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Consignação
        </Button>
      }
    >
      <div className="space-y-3">
        {consignacoes.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.veiculo}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/25">
                  Comissão: {c.comissaoAgencia}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Proprietário: <strong className="text-[var(--color-text-primary)]">{c.consignante}</strong> ({c.telefone}) • Pedido: R$ {c.valorPedido.toLocaleString("pt-BR")} • Repasse Líquido: <span className="text-emerald-500 font-bold">R$ {c.repasseCombinado.toLocaleString("pt-BR")}</span>
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25 self-start sm:self-auto">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
