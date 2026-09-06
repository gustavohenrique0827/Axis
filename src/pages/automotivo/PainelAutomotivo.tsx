import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Car, DollarSign, TrendingUp, Key, Calendar,
  ArrowRight, ShieldCheck, Plus, Columns3
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function PainelAutomotivo() {
  return (
    <PageContainer
      title="Painel Geral Concessionária & Revenda"
      description="Visão executiva do estoque de veículos, giro de pátio, ticket médio e test-drives agendados."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/crm/pipeline?nicho=automotivo"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Columns3 className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Ver Pipeline CRM
          </Link>
          <Link
            to="/app/automotivo/veiculos"
            className="h-9 px-4 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-primary-blue)] text-white shadow-xs"
          >
            <Car className="w-3.5 h-3.5" /> Estoque de Veículos
          </Link>
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Car, label: "Veículos em Estoque", val: "24", color: "text-blue-500" },
          { icon: DollarSign, label: "Estoque em R$", val: "R$ 3.2M", color: "text-emerald-500" },
          { icon: Calendar, label: "Test-Drives no Mês", val: "18", color: "text-amber-500" },
          { icon: TrendingUp, label: "Giro Médio de Pátio", val: "28 dias", color: "text-purple-500" },
        ].map((k, i) => (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-xl font-black text-[var(--color-text-primary)]">{k.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4 text-[var(--color-primary-blue)]" /> Últimos Veículos Cadastrados
          </h4>
          <div className="space-y-2">
            {[
              { modelo: "Toyota Corolla Altis 2.0 Hybrid", ano: "2024", valor: "R$ 178.000", status: "Disponível" },
              { modelo: "Jeep Compass Longitude T270", ano: "2023", valor: "R$ 152.000", status: "Em Test-Drive" },
              { modelo: "BMW 320i M Sport", ano: "2022", valor: "R$ 245.000", status: "Reservado" },
            ].map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{v.modelo}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{v.ano} • {v.valor}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" /> Próximos Test-Drives
          </h4>
          <div className="space-y-2">
            {[
              { cliente: "Dr. Marcelo Fonseca", carro: "BMW 320i M Sport", data: "Hoje às 15:00", consultor: "Ricardo Dias" },
              { cliente: "Camila Guimarães", carro: "Toyota Corolla Altis", data: "Amanhã às 10:30", consultor: "Ricardo Dias" },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{t.cliente}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{t.carro} • Consultor: {t.consultor}</p>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--color-primary-blue)]">{t.data}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
