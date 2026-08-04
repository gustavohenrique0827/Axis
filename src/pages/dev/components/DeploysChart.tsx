import { Card } from "../../../components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const deployData: { dia: string; deploys: number }[] = [];

export function DeploysChart() {
  return (
    <Card className="p-4">
      <h3 className="text-sm text-slate-400 mb-6">Deploys / Semana</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={deployData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="dia" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Bar dataKey="deploys" fill="#64748B" radius={[4, 4, 0, 0]} name="Deploys" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
