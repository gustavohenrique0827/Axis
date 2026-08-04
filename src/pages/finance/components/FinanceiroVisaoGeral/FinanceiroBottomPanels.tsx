import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Sparkles, ChevronDown } from "lucide-react";

interface UpcomingEntry { label: string; date: string; value: string; type: "pagar" | "receber"; }
interface Squad { id?: string; nome: string; focoComercial?: string; meta?: number; faturamentoAlcancado?: number; }
interface FinanceEntry { type: string; status: string; value: number; }

interface FinanceiroBottomPanelsProps {
  upcomingEntries: UpcomingEntry[];
  squads: Squad[];
  financeEntries: FinanceEntry[];
  receita: number;
  despesa: number;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function FinanceiroBottomPanels({ upcomingEntries, squads, financeEntries, receita, despesa }: FinanceiroBottomPanelsProps) {
  const [showMetas, setShowMetas] = useState(false);
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="text-sm text-slate-400 flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4" /> Agenda de Lançamentos
          </h3>
          <div className="space-y-2">
            {upcomingEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">Nenhum pendente.</div>
            ) : upcomingEntries.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === "receber" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                    {item.type === "receber" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-white leading-tight">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-mono ${item.type === "receber" ? "text-emerald-400" : "text-slate-300"}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-xs text-slate-400 hover:text-white">Fluxo Completo</Button>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Inteligência Operacional
            </h3>
            <Badge className="bg-white/5 border-white/10 text-slate-400 text-xs">Projeções em Tempo Real</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { label: "Custo por Lead (CPL)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                { label: "LTV Projetado (12m)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                { label: "Margem Ebitda", value: "0%", trend: "0%", status: "Estável" },
              ].map((insight, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{insight.label}</p>
                    <h5 className="text-lg font-semibold text-white">{insight.value}</h5>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs block mb-1 ${insight.trend.startsWith("+") ? "text-emerald-400" : "text-slate-400"}`}>{insight.trend}</span>
                    <span className="text-xs text-slate-500">{insight.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm text-white">Consultoria IA</h4>
                  <p className="text-xs text-slate-500">Recomendação Automatizada</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Sem dados suficientes para geração de insights automáticos no momento.</p>
              <Button className="mt-4 h-10 w-full">Executar Estratégia</Button>
            </div>
          </div>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setShowMetas((v) => !v)}
        className="w-full flex items-center justify-between mt-6 px-4 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg transition-colors text-left"
      >
        <span className="text-sm text-white flex items-center gap-2">
          Campanha de Metas & Comissionamento
          {!showMetas && <span className="text-xs text-slate-500 ml-1">— {squads.length} squads, ver evolução e comissionamento</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${showMetas ? "rotate-180" : ""}`} />
      </button>

      {showMetas && (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
        <Card className="xl:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm text-white">Evolução de Metas por Squad</h4>
                <p className="text-xs text-slate-500 mt-1">Atingimento de faturamento e status da comissão OTE</p>
              </div>
              <Badge className="bg-white/5 border-white/10 text-slate-400 text-xs">Dados ao Vivo</Badge>
            </div>
            {squads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-white/10 rounded-xl">
                <span className="text-2xl">🎯</span>
                <p className="text-sm text-slate-500 text-center">Nenhum squad cadastrado ainda.<br />Crie squads para ver a evolução de metas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {squads.map((sq, idx) => {
                  const faturado = sq.faturamentoAlcancado ?? 0;
                  const meta = sq.meta ?? 0;
                  const percent = meta > 0 ? Math.min(100, Math.round((faturado / meta) * 100)) : 0;
                  return (
                    <div key={sq.id || idx} className="space-y-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-white">{sq.nome}</span>
                          <span className="text-xs text-slate-500 block mt-0.5">Foco: {sq.focoComercial}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-mono text-white">{percent}</span>
                          <span className="text-xs text-slate-500">%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span>R$ {faturado.toLocaleString("pt-BR")}</span>
                        <span className="opacity-60">META: R$ {meta.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-white/5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Taxa de aceitação SDR ➔ Closer: Estabelecida 90%</span>
            <span className="text-emerald-400">Assertividade atual: 92.4%</span>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm text-white mb-1">Resumo por Tipo</h4>
            <p className="text-xs text-slate-500 mb-6">Entradas vs Saídas do período</p>
            <div className="space-y-3">
              {[
                { title: "Total a Receber", value: fmt(financeEntries.filter(f => f.type === "Receber").reduce((s, f) => s + f.value, 0)), subtitle: `${financeEntries.filter(f => f.type === "Receber").length} lançamentos`, status: "Receita", type: "success" },
                { title: "Total a Pagar",   value: fmt(financeEntries.filter(f => f.type === "Pagar").reduce((s, f) => s + f.value, 0)),   subtitle: `${financeEntries.filter(f => f.type === "Pagar").length} lançamentos`,   status: "Despesa", type: "warning" },
                { title: "Saldo Líquido",   value: fmt(receita - despesa), subtitle: "Pago vs recebido", status: receita >= despesa ? "Positivo" : "Negativo", type: receita >= despesa ? "success" : "error" },
              ].map((fee, idx) => (
                <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{fee.title}</span>
                    <span className="text-sm font-mono text-white">{fee.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{fee.subtitle}</span>
                    <span className={`text-xs flex items-center gap-1 ${fee.type === "success" ? "text-emerald-400" : fee.type === "warning" ? "text-amber-400" : "text-rose-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${fee.type === "success" ? "bg-emerald-400" : fee.type === "warning" ? "bg-amber-400" : "bg-rose-400"}`} />
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-6">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg text-center">
              <span className="text-xs text-slate-500 block mb-1">Total Provisionado</span>
              <span className="text-xl font-mono text-white block">R$ 0,00</span>
            </div>
          </div>
        </Card>
      </div>
      )}
    </>
  );
}
