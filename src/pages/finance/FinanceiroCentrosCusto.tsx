import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Layers, Plus, Search, DollarSign, Users, TrendingUp,
  Building2, Trash2, Edit2
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function FinanceiroCentrosCusto() {
  const [centros, setCentros] = useState([
    { id: "1", nome: "Operação Comercial & Vendas", codigo: "CC-01", orcamento: 45000, gasto: 32000, responsavel: "Diretoria Comercial" },
    { id: "2", nome: "Tecnologia & Produto", codigo: "CC-02", orcamento: 60000, gasto: 48500, responsavel: "Engenharia" },
    { id: "3", nome: "Marketing & Growth", codigo: "CC-03", orcamento: 30000, gasto: 27800, responsavel: "Head de Marketing" },
    { id: "4", nome: "Administrativo & Infra", codigo: "CC-04", orcamento: 25000, gasto: 19400, responsavel: "Financeiro / RH" },
  ]);

  return (
    <PageContainer
      title="Centros de Custo & Squads"
      description="Gerencie unidades de despesa, orçamentos departamentais e centros de resultado."
      actions={
        <Button onClick={() => toast.info("Configure novos centros de custo pelo menu Configurações > Financeiro.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Centro de Custo
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {centros.map(c => {
          const perc = Math.round((c.gasto / c.orcamento) * 100);
          return (
            <div key={c.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] font-bold">
                  {c.codigo}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{c.responsavel}</span>
              </div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.nome}</h4>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[var(--color-text-muted)]">Consumido:</span>
                  <span className="font-bold text-[var(--color-text-primary)]">{perc}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
                  <div className={`h-full rounded-full ${perc > 90 ? 'bg-rose-500' : perc > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${perc}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)] flex justify-between text-[11px]">
                <span className="text-[var(--color-text-muted)]">Gasto: <strong className="text-[var(--color-text-primary)]">R$ {c.gasto.toLocaleString("pt-BR")}</strong></span>
                <span className="text-[var(--color-text-muted)]">Teto: <strong>R$ {c.orcamento.toLocaleString("pt-BR")}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
