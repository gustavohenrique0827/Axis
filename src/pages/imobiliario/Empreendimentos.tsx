import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Building2, Plus, Search, MapPin, DollarSign,
  TrendingUp, CheckCircle2, ArrowRight
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function Empreendimentos() {
  const [empreendimentos, setEmpreendimentos] = useState([
    { id: "1", nome: "Residencial Terraço Jardins", construtora: "G-Tech Incorporações", cidade: "São Paulo - SP", totalUnidades: 80, unidadesDisponiveis: 18, vgvTotal: 96000000, status: "Em Obras", entrega: "Nov/2027" },
    { id: "2", nome: "Infinity Tower Corporate", construtora: "Axis Real Estate", cidade: "São Paulo - SP", totalUnidades: 45, unidadesDisponiveis: 12, vgvTotal: 135000000, status: "Lançamento", entrega: "Mar/2028" },
    { id: "3", nome: "Parque das Palmeiras Villa", construtora: "Prime Urbanismo", cidade: "Campinas - SP", totalUnidades: 120, unidadesDisponiveis: 34, vgvTotal: 72000000, status: "Pronto para Morar", entrega: "Entregue" },
  ]);

  return (
    <PageContainer
      title="Empreendimentos & Lançamentos"
      description="Gerenciamento de torres, condomínios fechados, espelho de vendas e tabelas de construtoras."
      actions={
        <Button onClick={() => toast.info("Para cadastrar novo empreendimento, insira o espelho de unidades.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Empreendimento
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Empreendimentos Ativos</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{empreendimentos.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">VGV Total Gerenciado</span>
          <div className="text-2xl font-black text-amber-500">
            R$ {(empreendimentos.reduce((s, e) => s + e.vgvTotal, 0) / 1e6).toFixed(0)}M
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Unidades Disponíveis</span>
          <div className="text-2xl font-black text-emerald-500">
            {empreendimentos.reduce((s, e) => s + e.unidadesDisponiveis, 0)} unidades
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empreendimentos.map(emp => (
          <div key={emp.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/50 transition-all flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {emp.status}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{emp.entrega}</span>
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-0.5">{emp.nome}</h4>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-4">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {emp.cidade}
              </p>

              <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                <div className="flex justify-between">
                  <span>VGV do Projeto:</span>
                  <strong className="text-[var(--color-text-primary)]">R$ {(emp.vgvTotal / 1e6).toFixed(1)}M</strong>
                </div>
                <div className="flex justify-between">
                  <span>Estoque:</span>
                  <strong className="text-emerald-500">{emp.unidadesDisponiveis} de {emp.totalUnidades} un.</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--color-border-subtle)] flex justify-end">
              <Button size="sm" variant="outline" onClick={() => toast.success(`Espelho de ${emp.nome} aberto.`)} className="h-8 text-xs font-bold gap-1 rounded-xl">
                Ver Espelho de Vendas <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
