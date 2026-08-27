import { Card } from "../../../components/ui/card";
import { Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useDevSprints } from "../hooks/useDevSprints";
import { useDevProjects } from "../hooks/useDevProjects";

export function SprintVelocityChart() {
  const { tasks } = useDevSprints();
  const { projects } = useDevProjects();

  const velocityData = projects
    .map(p => {
      const projectTasks = tasks.filter(t => String(t.project) === String(p.id));
      const pontos = projectTasks.filter(t => t.column !== 'done').reduce((s, t) => s + t.points, 0);
      const bugs = projectTasks.filter(t => t.type === 'bug' && t.column !== 'done').length;
      return { sprint: p.name, pontos, bugs, total: projectTasks.length };
    })
    .filter(d => d.total > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 6);

  return (
    <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Pontos em Aberto por Projeto
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sprint Atual</span>
      </div>
      {velocityData.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest">
          Nenhuma task de sprint registrada.
        </div>
      ) : (
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
              contentStyle={{ background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontSize: 11 }}
              labelStyle={{ color: "#94A3B8", fontWeight: 700 }}
            />
            <Area type="monotone" dataKey="pontos" stroke="#2563EB" strokeWidth={2} fill="url(#gPontos)" name="Pontos em Aberto" />
            <Area type="monotone" dataKey="bugs" stroke="#EF4444" strokeWidth={2} fill="url(#gBugs)" name="Bugs Abertos" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
