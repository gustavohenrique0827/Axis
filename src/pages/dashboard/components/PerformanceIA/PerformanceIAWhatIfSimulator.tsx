import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, Area } from "recharts";
import { Play, RefreshCw, Zap, Inbox, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

export function PerformanceIAWhatIfSimulator(props: {
  isSimulating: boolean;
  runSimulation: () => void;
  simulationData: Array<{ name: string; mrr: number; cac: number; ltv: number }>;
  aiRecommendations: any[];
}) {
  const { isSimulating, runSimulation, simulationData, aiRecommendations } = props;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Play className="w-5 h-5 text-purple-400" /> Simulador de Cenários
            </h3>
            <p className="text-xs text-slate-500 mt-2">Modele o crescimento alterando variáveis críticas de aquisição.</p>
          </div>
          <Button
            onClick={runSimulation}
            disabled={isSimulating || simulationData.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 h-12 text-xs font-black uppercase tracking-widest gap-2 disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
            {isSimulating ? "Simulando..." : "Executar Simulação"}
          </Button>
        </div>

        {simulationData.length === 0 ? (
          <div className="h-[340px] flex flex-col items-center justify-center gap-4 opacity-40">
            <Inbox className="w-12 h-12 text-slate-500" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
              Simulador indisponível.
              <br />Cadastre dados financeiros e contratos reais.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[340px] -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid #ffffff05", borderRadius: "16px" }}
                    itemStyle={{ fontSize: "10px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="mrr" fill="#312e81" radius={[8, 8, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="ltv" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} />
                  <Area type="monotone" dataKey="cac" fill="#10b981" stroke="#10b981" fillOpacity={0.1} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid md:grid-cols-4 gap-4">
              {["Investimento em Ads", "Taxa de Conversão", "Churn Estimado", "Ticket Médio"].map((label) => (
                <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[9px] text-slate-500 font-black uppercase mb-3">{label}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">+15%</span>
                    <div className="h-1 flex-1 mx-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5 h-full flex flex-col">
        <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
          <Lightbulb className="w-4 h-4 text-amber-500" /> Recomendações MIA
        </h4>

        {simulationData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-black text-slate-500 text-center uppercase">Aguardando dados...</p>
          </div>
        ) : (
          <div
            className={`flex-1 space-y-6 transition-all duration-500 ${isSimulating ? "opacity-30 blur-sm" : "opacity-100"}`}
          >
            {(aiRecommendations.length > 0
              ? aiRecommendations
              : [{
                  title: "Analisando...",
                  desc: "Master IA está lendo seus indicadores de performance.",
                  impact: "--",
                  color: "text-slate-500",
                }]
            ).map((rec, i) => (
              <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-[13px] font-black text-white">{rec.title}</h5>
                  <span className={`text-[10px] font-black ${rec.color} bg-white/5 px-2 py-0.5 rounded-full`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full mt-8 border-white/5 text-[10px] font-black uppercase tracking-[0.2em] h-12 rounded-2xl hover:bg-white/5">
          Ver Auditoria Completa
        </Button>
      </Card>
    </div>
  );
}

