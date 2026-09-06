import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  DollarSign, CheckCircle2, Clock, Users, ArrowUpRight,
  TrendingUp, Download, Building2
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ImobiliarioComissoes() {
  const [comissoes, setComissoes] = useState([
    { id: "1", imovel: "Apartamento 142 - Terraço Jardins", corretor: "Gustavo Henrique", valorVenda: 1850000, comissaoTotal: 111000, comissaoCorretor: 55500, status: "A Receber", previsao: "15/09/2026" },
    { id: "2", imovel: "Casa em Condomínio - Alphaville", corretor: "Mariana Costa", valorVenda: 3200000, comissaoTotal: 192000, comissaoCorretor: 96000, status: "Liquidada", previsao: "28/08/2026" },
    { id: "3", imovel: "Cobertura Duplex - Cerqueira César", corretor: "Felipe Ramos", valorVenda: 4500000, comissaoTotal: 270000, comissaoCorretor: 135000, status: "Em Tramitação", previsao: "30/09/2026" },
  ]);

  return (
    <PageContainer
      title="Comissões Imobiliárias & Honorários"
      description="Cálculo de comissões, split entre imobiliária e corretores parceiros, integrado ao Contas a Pagar/Receber."
      actions={
        <Link
          to="/app/financeiro/receber"
          className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Ver no Financeiro
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-emerald-500/25 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Comissões a Receber (VGV)</span>
          <div className="text-2xl font-black text-emerald-500">
            R$ {(comissoes.reduce((s, c) => s + c.comissaoTotal, 0) / 1000).toFixed(1)}k
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Repasses a Corretores</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">
            R$ {(comissoes.reduce((s, c) => s + c.comissaoCorretor, 0) / 1000).toFixed(1)}k
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-blue-500/25 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Honorários Liquidados</span>
          <div className="text-2xl font-black text-[var(--color-primary-blue)]">
            R$ {(comissoes.filter(c => c.status === "Liquidada").reduce((s, c) => s + c.comissaoTotal, 0) / 1000).toFixed(1)}k
          </div>
        </Card>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Imóvel Negociado</th>
                <th className="px-4 py-3">Corretor</th>
                <th className="px-4 py-3">Valor da Venda</th>
                <th className="px-4 py-3">Comissão Total</th>
                <th className="px-4 py-3">Repasse Corretor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Previsão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {comissoes.map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[var(--color-text-primary)]">{c.imovel}</td>
                  <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{c.corretor}</td>
                  <td className="px-4 py-3.5 font-mono text-[var(--color-text-primary)]">R$ {c.valorVenda.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-500">R$ {c.comissaoTotal.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3.5 font-bold text-blue-500">R$ {c.comissaoCorretor.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      c.status === "Liquidada"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[var(--color-text-muted)]">{c.previsao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
