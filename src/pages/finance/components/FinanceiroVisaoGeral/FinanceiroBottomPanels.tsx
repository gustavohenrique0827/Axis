import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

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
        <Card className="p-8 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl">
          <h3 className="font-black flex items-center gap-3 mb-8 uppercase text-[10px] tracking-[0.2em] text-slate-300">
            <Clock className="w-4 h-4 text-blue-500" /> Agenda de Lançamentos
          </h3>
          <div className="space-y-3">
            {upcomingEntries.length === 0 ? (
              <div className="py-16 text-center italic text-slate-600 text-[10px] font-black uppercase tracking-widest bg-white/[0.01] rounded-3xl border border-dashed border-white/5">Nenhum pendente.</div>
            ) : upcomingEntries.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 ${item.type === "receber" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"}`}>
                    {item.type === "receber" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight leading-none mb-1">{item.label}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-mono font-black ${item.type === "receber" ? "text-emerald-400" : "text-slate-300"}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-400 hover:bg-blue-600/5 h-14 rounded-2xl transition-all border border-transparent hover:border-blue-500/20">Fluxo Completo</Button>
        </Card>

        <Card className="lg:col-span-2 p-8 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black flex items-center gap-3 uppercase text-[10px] tracking-[0.2em] text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Inteligência Operacional
            </h3>
            <Badge className="bg-white/5 border-white/10 text-slate-500 text-[8px] font-black uppercase h-6">Projeções ML em Tempo Real</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { label: "Custo por Lead (CPL)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                { label: "LTV Projetado (12m)", value: "R$ 0,00", trend: "0%", status: "Estável" },
                { label: "Margem Ebitda", value: "0%", trend: "0%", status: "Estável" },
              ].map((insight, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{insight.label}</p>
                    <h5 className="text-lg font-black text-white italic tracking-tighter">{insight.value}</h5>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black uppercase block mb-1 ${insight.trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{insight.trend}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${insight.status === "Seguro" ? "bg-emerald-500/10 text-emerald-400" : insight.status === "Atenção" ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-slate-500"}`}>{insight.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">Consultoria IA</h4>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recomendação Automatizada</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">Sem dados suficientes para geração de insights automáticos no momento.</p>
              <Button className="mt-6 h-11 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest">Executar Estratégia</Button>
            </div>
          </div>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setShowMetas((v) => !v)}
        className="w-full flex items-center justify-between mt-10 px-5 py-3 bg-[var(--color-surface-elevated)]/40 hover:bg-[var(--color-surface-elevated)]/60 border border-white/5 rounded-2xl transition-colors text-left"
      >
        <span className="font-black text-sm text-white uppercase tracking-[0.15em] flex items-center gap-2">
          🎯 Campanha de Metas & Comissionamento
          {!showMetas && <span className="text-[10px] text-slate-500 font-medium normal-case tracking-normal ml-1">— {squads.length} squads, ver evolução e comissionamento</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${showMetas ? "rotate-180" : ""}`} />
      </button>

      {showMetas && (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
        <Card className="xl:col-span-2 p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl flex flex-col justify-between rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Evolução de Metas por Squad</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Atingimento de faturamento e status da comissão OTE</p>
              </div>
              <div className="bg-blue-500/10 text-blue-400 border border-blue-500/15 font-black uppercase tracking-widest text-[8px] px-3 py-1.5 rounded-lg shadow-inner">Extração de Dados ao Vivo</div>
            </div>
            {squads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <span className="text-3xl">🎯</span>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum squad cadastrado ainda.<br />Crie squads para ver a evolução de metas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {squads.map((sq, idx) => {
                  const faturado = sq.faturamentoAlcancado ?? 0;
                  const meta = sq.meta ?? 0;
                  const percent = meta > 0 ? Math.min(100, Math.round((faturado / meta) * 100)) : 0;
                  const colors = ["bg-blue-500", "bg-emerald-500", "bg-indigo-500", "bg-orange-500"];
                  return (
                    <div key={sq.id || idx} className="space-y-3 p-4 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-white uppercase tracking-tight">{sq.nome}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase block mt-0.5 opacity-60">Foco: {sq.focoComercial}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-mono font-black text-white">{percent}</span>
                          <span className="text-[9px] font-black text-slate-600">%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-1000`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold font-mono">
                        <span>R$ {faturado.toLocaleString("pt-BR")}</span>
                        <span className="opacity-40">META: R$ {meta.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-white/5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Taxa de aceitação SDR ➔ Closer: Estabelecida 90%</span>
            <span className="text-emerald-400 font-black px-3 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">Assertividade atual: 92.4%</span>
          </div>
        </Card>

        <Card className="p-8 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl flex flex-col justify-between rounded-[32px]">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Resumo por Tipo</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8">Entradas vs Saídas do período</p>
            <div className="space-y-4">
              {[
                { title: "Total a Receber", value: fmt(financeEntries.filter(f => f.type === "Receber").reduce((s, f) => s + f.value, 0)), subtitle: `${financeEntries.filter(f => f.type === "Receber").length} lançamentos`, status: "Receita", type: "success" },
                { title: "Total a Pagar",   value: fmt(financeEntries.filter(f => f.type === "Pagar").reduce((s, f) => s + f.value, 0)),   subtitle: `${financeEntries.filter(f => f.type === "Pagar").length} lançamentos`,   status: "Despesa", type: "warning" },
                { title: "Saldo Líquido",   value: fmt(receita - despesa), subtitle: "Pago vs recebido", status: receita >= despesa ? "Positivo" : "Negativo", type: receita >= despesa ? "success" : "error" },
              ].map((fee, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{fee.title}</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{fee.value}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-tight block">{fee.subtitle}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${fee.type === "success" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : fee.type === "warning" ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}>{fee.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 mt-8">
            <div className="p-5 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl text-center">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] block mb-2">Total Provisionado</span>
              <span className="text-2xl font-mono font-black text-white block italic tracking-tighter">R$ 0,00</span>
            </div>
          </div>
        </Card>
      </div>
      )}
    </>
  );
}
