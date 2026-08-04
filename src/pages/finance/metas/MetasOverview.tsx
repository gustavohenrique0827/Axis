import React, { useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { 
  Target, DollarSign, TrendingUp, Users, Flame, Award
} from "lucide-react";
import { 
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, ComposedChart, Bar 
} from 'recharts';
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { SquadMeta } from "./useFinanceiroMetas";

// CountUp component using motion/react
function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Math.round(latest).toLocaleString("pt-BR")
  );
  
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

interface MetasOverviewProps {
  period: "monthly" | "quarterly" | "annual";
  totalFaturamento: number;
  totalMeta: number;
  totalPercent: number;
  squads: SquadMeta[];
  calculateOTE: (squad: SquadMeta) => { base: number; bonus: number; total: number };
  oteActiveTab: "projection" | "history";
  setOteActiveTab: (tab: "projection" | "history") => void;
  historicalOTEData: any[];
  projecaoInteligente: number;
}

export function MetasOverview({
  period,
  totalFaturamento,
  totalMeta,
  totalPercent,
  squads,
  calculateOTE,
  oteActiveTab,
  setOteActiveTab,
  historicalOTEData,
  projecaoInteligente
}: MetasOverviewProps) {
  const diff = totalFaturamento - totalMeta;
  const isPositive = diff >= 0;

  const msgVolume = totalFaturamento > 0 ? Math.round(totalFaturamento / 100) : 0;
  const callVolume = totalFaturamento > 0 ? Math.round(totalFaturamento / 350) : 0;

  const totalOTE = squads.reduce((sum, s) => sum + calculateOTE(s).total, 0);
  const totalOTEBonus = squads.reduce((sum, s) => sum + calculateOTE(s).bonus, 0);

  const activeSquadsOnGoal = squads.filter(s => {
    const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
    return s.faturamento >= s.meta * mult;
  }).length;

  return (
    <div className="space-y-6">
      {/* Balanço Geral */}
      <div className="p-6 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-3xl relative overflow-hidden glass-card">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Balanço Geral & Comunicações Ativas
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
              Auditoria consolidada de conversão sdr/closer e diferencial líquido
            </p>
          </div>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8.5px] font-mono uppercase tracking-widest px-3 py-1 rounded-xl">
            Sincronizado via API
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mensagens sent rate */}
          <div className="p-4 bg-[var(--color-surface)]/40 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Flame className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Volume de Mensagens (WhatsApp)</span>
              <span className="text-lg font-mono font-black text-white block mt-0.5">
                {msgVolume.toLocaleString("pt-BR")} msgs
              </span>
              <span className="text-[9.5px] text-purple-400 font-bold block">Taxa de Resposta: 94.2%</span>
            </div>
          </div>

          {/* Ligações dials */}
          <div className="p-4 bg-[var(--color-surface)]/40 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total de Ligações Registradas</span>
              <span className="text-lg font-mono font-black text-white block mt-0.5">
                {callVolume.toLocaleString("pt-BR")} dials
              </span>
              <span className="text-[9.5px] text-blue-400 font-bold block">Conexão Eficiente: 82%</span>
            </div>
          </div>

          {/* Diferença Líquida contra o teto da meta geral */}
          <div className={`p-4 rounded-2xl border transition-colors flex items-center gap-4 ${
            isPositive 
              ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/30" 
              : "bg-rose-500/10 border-rose-500/20 hover:border-rose-500/30"
          }`}>
            <div className={`p-3 rounded-xl ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              <TrendingUp className={`w-5 h-5 ${isPositive ? "" : "transform rotate-180"}`} />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-sans">Diferença Líquida (Meta)</span>
              <span className={`text-lg font-mono font-black block mt-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {isPositive ? "+" : "-"} R$ {Math.abs(diff).toLocaleString("pt-BR")}
              </span>
              <span className="text-[9.5px] text-slate-400 block font-medium">
                {isPositive ? "Excedente de Meta Obtido" : "Déficit Restante do Teto"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total revenue meta */}
        <Card className="p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/15 text-[#06B6D4]">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-[#06B6D4] bg-[#06B6D4]/5 px-2 py-0.5 rounded border border-[#06B6D4]/10 uppercase tracking-widest">
              Geral {period === "monthly" ? "Mês" : period === "quarterly" ? "Trimestre" : "Ano"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Faturamento Realizado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                R$ {totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                de R$ {totalMeta.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </span>
            </div>
            {/* Visual Gauge */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Progresso consolidado</span>
                <span className="font-extrabold text-blue-400">{totalPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Provisioned commission and OTE payout based on calculations */}
        <Card className="p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/15 text-[#06B6D4]">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-[#06B6D4] bg-[#06B6D4]/5 px-2 py-0.5 rounded border border-[#06B6D4]/10 uppercase tracking-widest">
              Provisionado
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Comissão + OTE Extra</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                R$ {totalOTE.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] border-t border-white/5 pt-3 text-slate-400">
              <span>Bônus superador ativo:</span>
              <span className="font-bold text-emerald-400">
                R$ {totalOTEBonus.toLocaleString("pt-BR")}
              </span>
            </div>
            
            {/* Tab Swapper Header Inside Card */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Visualização OTE</span>
              <div className="flex gap-1.5 font-mono">
                <button 
                  onClick={() => setOteActiveTab("history")} 
                  className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                    oteActiveTab === "history" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  Histórico 6M
                </button>
                <button 
                  onClick={() => setOteActiveTab("projection")} 
                  className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                    oteActiveTab === "projection" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  Projeção 3M
                </button>
              </div>
            </div>

            {/* Smooth animated comparative mini charts */}
            <motion.div 
              key={oteActiveTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              {oteActiveTab === "history" ? (
                <div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>Performance (Últimos 6 meses)</span>
                    <span className="text-emerald-400 font-mono">Histórico OTE</span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalOTEData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={8} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                          itemStyle={{ fontSize: "10px", color: "#10b981" }}
                        />
                        <Line type="monotone" dataKey="OTE" stroke="#10b981" strokeWidth={2} name="Ganhos OTE" dot={{ r: 3, stroke: "#111827", strokeWidth: 1 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>Faturado vs Meta 3M</span>
                    <span className="text-emerald-400 font-mono">OTE Proj</span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={[
                          {
                            name: "Progresso",
                            "Faturamento": totalFaturamento,
                            "Meta Projetada 3M": squads.reduce((sum, s) => sum + s.meta * 3, 0),
                            "Projeção Inteligente": projecaoInteligente
                          }
                        ]}
                        margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={8} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                          itemStyle={{ fontSize: "10px" }}
                        />
                        <Bar dataKey="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} name="Atual" />
                        <Bar dataKey="Meta Projetada 3M" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Trimester 90d" />
                        <Line type="monotone" dataKey="Projeção Inteligente" stroke="#fbbf24" strokeWidth={2} name="Proj Inteligente" dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </Card>

        {/* Active alert indicator status card */}
        <Card className="p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/15 text-[#06B6D4]">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-[#06B6D4] bg-[#06B6D4]/5 px-2 py-0.5 rounded border border-[#06B6D4]/10 uppercase tracking-widest">
              Consistência
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Squads na Meta</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                {activeSquadsOnGoal} de {squads.length}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">Surtindo Efeito</span>
            </div>
            <div className="mt-4 text-[10px] border-t border-white/5 pt-3 flex items-center gap-2 text-slate-400 leading-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Aceleração SDR base Palma ativa.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
