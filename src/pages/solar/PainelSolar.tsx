import { useEffect, useMemo, useState } from "react";
import { Sun, Users, FileText, TrendingUp, Zap, DollarSign, Clock, Target } from "lucide-react";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";

interface SolarRow {
  id: string;
  status: string;
  potencia_estimada_kwp: number | null;
  valor_proposta: number | null;
  created_at: string;
  data_conclusao: string | null;
}

const STATUS_FLOW = ["Análise Concluída", "Visita Técnica", "Proposta Enviada", "Homologação", "Instalação", "Concluído"];

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

export default function PainelSolar() {
  const [rows, setRows] = useState<SolarRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("solar_analises").select("id,status,potencia_estimada_kwp,valor_proposta,created_at,data_conclusao").then(({ data }) => {
      if (data) setRows(data as SolarRow[]);
    });
  }, []);

  const kpis = useMemo(() => {
    const leadsRecebidos = rows.length;
    const idxProposta = STATUS_FLOW.indexOf("Proposta Enviada");
    const propostasEnviadas = rows.filter(r => STATUS_FLOW.indexOf(r.status) >= idxProposta).length;
    const fechados = rows.filter(r => r.status === "Concluído");
    const vendasFechadas = fechados.length;
    const taxaConversao = leadsRecebidos > 0 ? (vendasFechadas / leadsRecebidos) * 100 : 0;

    const abertos = rows.filter(r => r.status !== "Concluído" && r.valor_proposta);
    const valorPipeline = abertos.reduce((s, r) => s + Number(r.valor_proposta ?? 0), 0);

    const potenciaInstalada = fechados.reduce((s, r) => s + Number(r.potencia_estimada_kwp ?? 0), 0);

    const fechadosComValor = fechados.filter(r => r.valor_proposta);
    const ticketMedio = fechadosComValor.length > 0
      ? fechadosComValor.reduce((s, r) => s + Number(r.valor_proposta ?? 0), 0) / fechadosComValor.length
      : 0;

    const ciclosVenda = fechados
      .filter(r => r.data_conclusao)
      .map(r => (new Date(r.data_conclusao!).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24))
      .filter(d => d >= 0);
    const cicloMedio = ciclosVenda.length > 0 ? ciclosVenda.reduce((a, b) => a + b, 0) / ciclosVenda.length : null;

    const receitaFechada = fechados.reduce((s, r) => s + Number(r.valor_proposta ?? 0), 0);

    return { leadsRecebidos, propostasEnviadas, taxaConversao, valorPipeline, vendasFechadas, potenciaInstalada, ticketMedio, cicloMedio, receitaFechada };
  }, [rows]);

  const porEstagio = useMemo(() => {
    return STATUS_FLOW.map(status => ({ status, count: rows.filter(r => r.status === status).length }));
  }, [rows]);

  return (
    <PageContainer
      title="Painel Solar"
      description="Métricas comerciais e operacionais do funil fotovoltaico — leads, propostas, conversão e potência instalada."
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
        {rows.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center gap-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
            <Sun className="w-10 h-10 text-amber-500/40" />
            <p className="text-sm font-bold text-[var(--color-text-muted)]">Nenhuma análise de fatura registrada ainda.</p>
            <p className="text-xs text-[var(--color-text-faint)]">Os indicadores aparecem aqui assim que o time começar a analisar faturas em "Análise de Fatura".</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Leads Recebidos", value: kpis.leadsRecebidos.toString(), icon: Users, color: "text-blue-500" },
                { label: "Propostas Enviadas", value: kpis.propostasEnviadas.toString(), icon: FileText, color: "text-purple-500" },
                { label: "Taxa de Conversão", value: `${kpis.taxaConversao.toFixed(1)}%`, icon: Target, color: "text-emerald-500" },
                { label: "Vendas Fechadas", value: kpis.vendasFechadas.toString(), icon: TrendingUp, color: "text-amber-500" },
                { label: "Valor em Pipeline", value: fmtBRL(kpis.valorPipeline), icon: DollarSign, color: "text-blue-500" },
                { label: "Potência Instalada", value: `${kpis.potenciaInstalada.toFixed(1)} kWp`, icon: Zap, color: "text-amber-500" },
                { label: "Ticket Médio", value: kpis.ticketMedio > 0 ? fmtBRL(kpis.ticketMedio) : "—", icon: DollarSign, color: "text-emerald-500" },
                { label: "Ciclo Médio de Venda", value: kpis.cicloMedio !== null ? `${kpis.cicloMedio.toFixed(0)} dias` : "—", icon: Clock, color: "text-purple-500" },
              ].map((s, i) => (
                <Card key={i} className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">{s.value}</div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-5">Funil por Estágio</h3>
              <div className="space-y-3">
                {porEstagio.map(({ status, count }) => (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{status}</span>
                      <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-surface-sunken)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${rows.length > 0 ? (count / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-muted)]">Receita já fechada (vendas concluídas)</span>
              <span className="text-sm font-black text-emerald-500 font-mono">{fmtBRL(kpis.receitaFechada)}</span>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
