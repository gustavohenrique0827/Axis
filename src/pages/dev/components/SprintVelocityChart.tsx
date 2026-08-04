import { Card } from "../../../components/ui/card";
import { Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const velocityData: { sprint: string; pontos: number; bugs: number }[] = [];

export function SprintVelocityChart() {
  return (
    <Card className="lg:col-span-2 p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Velocidade por Sprint
        </h3>
        <span className="text-xs text-slate-500">Últimos 6 Sprints</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={velocityData}>
          <defs>
            <linearGradient id="gPontos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gBugs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="sprint" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Area type="monotone" dataKey="pontos" stroke="#64748B" strokeWidth={2} fill="url(#gPontos)" name="Story Points" />
          <Area type="monotone" dataKey="bugs" stroke="#EF4444" strokeWidth={2} fill="url(#gBugs)" name="Bugs Abertos" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
