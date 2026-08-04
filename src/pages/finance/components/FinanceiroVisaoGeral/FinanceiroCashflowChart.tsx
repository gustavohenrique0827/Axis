import { Card } from "../../../../components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from "recharts";

interface ChartEntry { name: string; receita: number; despesa: number; projection: number; }

interface FinanceiroCashflowChartProps {
  chartData: ChartEntry[];
  stabilityScore: number;
}

export function FinanceiroCashflowChart({ chartData, stabilityScore }: FinanceiroCashflowChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      <Card className="lg:col-span-8 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-sm font-medium text-white">Fluxo de Caixa</h3>
            <p className="text-xs text-slate-500 mt-1">Comparativo de fluxo de caixa vs projeção</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[{ label: "Receita", color: "bg-blue-500" }, { label: "Projeção", color: "bg-blue-500/40" }, { label: "Despesa", color: "bg-rose-500" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px" }}
                itemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontSize: "12px", marginBottom: "8px", color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="projection" stroke="#3b82f6" strokeWidth={1} fill="transparent" strokeDasharray="6 4" opacity={0.4} />
              <Area type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
              <Area type="monotone" dataKey="despesa" stroke="#f43f5e" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center">
        <h4 className="text-xs text-slate-400 mb-6">Score de Estabilidade</h4>
        <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ name: "Stability", value: stabilityScore }, { name: "Remaining", value: 100 - stabilityScore }]}
                cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" startAngle={220} endAngle={-40} paddingAngle={0} dataKey="value" stroke="none">
                <Cell fill="#3b82f6" />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-white">{stabilityScore}</span>
            <span className="text-xs text-slate-400 mt-1">Saúde Global</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full mt-8">
          <Card className="p-3">
            <p className="text-xs text-slate-400 mb-1">Liquidez</p>
            <span className="text-white font-mono text-sm">--</span>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-slate-400 mb-1">Burn Rate</p>
            <span className="text-rose-400 font-mono text-sm">--</span>
          </Card>
        </div>
      </Card>
    </div>
  );
}
