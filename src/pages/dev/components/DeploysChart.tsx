import { Card } from "../../../components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const deployData: { dia: string; deploys: number }[] = [];

export function DeploysChart() {
  return (
    <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
      <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Deploys / Semana</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={deployData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="dia" tick={{ fill: "#4B5563", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontSize: 11 }}
            labelStyle={{ color: "#94A3B8", fontWeight: 700 }}
          />
          <Bar dataKey="deploys" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Deploys" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
