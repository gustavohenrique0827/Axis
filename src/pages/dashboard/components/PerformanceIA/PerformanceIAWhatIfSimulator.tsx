import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, Area } from "recharts";
import { Play, RefreshCw, Zap, Inbox, Lightbulb } from "lucide-react";

export function PerformanceIAWhatIfSimulator(props: {
  isSimulating: boolean;
  runSimulation: () => void;
  simulationData: Array<{ name: string; mrr: number; cac: number; ltv: number }>;
  aiRecommendations: any[];
}) {
  const { isSimulating, runSimulation, simulationData, aiRecommendations } = props;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm text-slate-400 flex items-center gap-2">
              <Play className="w-4 h-4" /> Simulador de Cenários
            </h3>
            <p className="text-xs text-slate-500 mt-1">Modele o crescimento alterando variáveis críticas de aquisição.</p>
          </div>
          <Button
            onClick={runSimulation}
            disabled={isSimulating || simulationData.length === 0}
            className="rounded-xl px-4 h-10 text-xs gap-2 disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isSimulating ? "Simulando..." : "Executar Simulação"}
          </Button>
        </div>

        {simulationData.length === 0 ? (
          <div className="h-[340px] flex flex-col items-center justify-center gap-3 text-center">
            <Inbox className="w-8 h-8 text-slate-500" />
            <p className="text-sm text-slate-500">
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
                    itemStyle={{ fontSize: "10px" }}
                  />
                  <Bar dataKey="mrr" fill="#475569" radius={[8, 8, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="ltv" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: "#94a3b8" }} />
                  <Area type="monotone" dataKey="cac" fill="#94a3b8" stroke="#94a3b8" fillOpacity={0.08} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid md:grid-cols-4 gap-4">
              {["Investimento em Ads", "Taxa de Conversão", "Churn Estimado", "Ticket Médio"].map((label) => (
                <div key={label} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-xs text-slate-500 mb-2">{label}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white">+15%</span>
                    <div className="h-1 flex-1 mx-3 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="p-6 h-full flex flex-col">
        <h4 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Recomendações MIA
        </h4>

        {simulationData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">Aguardando dados...</p>
          </div>
        ) : (
          <div
            className={`flex-1 space-y-3 transition-opacity duration-500 ${isSimulating ? "opacity-30" : "opacity-100"}`}
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
              <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm text-white">{rec.title}</h5>
                  <span className="text-xs text-slate-400">
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full mt-6 text-xs h-10 rounded-xl">
          Ver Auditoria Completa
        </Button>
      </Card>
    </div>
  );
}
