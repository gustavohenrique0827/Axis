import { Card } from "../../../components/ui/card";
import { Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const velocityData: { sprint: string; pontos: number; bugs: number }[] = [];

export function SprintVelocityChart() {
  return (
    <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Velocidade por Sprint
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Últimos 6 Sprints</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={velocityData}>
          <defs>
            <linearGradient id="gPontos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gBugs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="sprint" tick={{ fill: "#4B5563", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontSize: 11 }}
            labelStyle={{ color: "#94A3B8", fontWeight: 700 }}
          />
          <Area type="monotone" dataKey="pontos" stroke="#2563EB" strokeWidth={2} fill="url(#gPontos)" name="Story Points" />
          <Area type="monotone" dataKey="bugs" stroke="#EF4444" strokeWidth={2} fill="url(#gBugs)" name="Bugs Abertos" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
