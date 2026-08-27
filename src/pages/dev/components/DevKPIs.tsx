import { Card } from "../../../components/ui/card";
import { Zap, Bug, Rocket, Server } from "lucide-react";
import { useDevSprints } from "../hooks/useDevSprints";
import { useDevIssues } from "../hooks/useDevIssues";
import { useAmbientes } from "../hooks/useAmbientes";

// Considera "deploy hoje" quando o último deploy do ambiente foi há minutos/horas
// (não há tabela de log de deploys — deriva do campo lastDeploy do ambiente).
function wasDeployedToday(lastDeploy: string): boolean {
  const s = lastDeploy.toLowerCase();
  if (!s || s === '-') return false;
  return (s.includes('min atrás') || s.includes('h atrás') || s === 'agora') && !s.includes('dia') && !s.includes('semana') && !s.includes('mês') && !s.includes('mes');
}

export function DevKPIs() {
  const { tasks } = useDevSprints();
  const { issues } = useDevIssues();
  const { environments } = useAmbientes();

  const pontosNoSprint = tasks.reduce((s, t) => s + t.points, 0);
  const issuesAbertas = issues.filter(i => i.status === 'aberto' || i.status === 'em andamento').length;
  const deploysHoje = environments.filter(e => wasDeployedToday(e.lastDeploy)).length;
  const producao = environments.find(e => e.type === 'Production' || e.name === 'Produção');

  const STATS = [
    { label: "Pontos no Sprint", value: tasks.length ? String(pontosNoSprint) : "--", icon: Zap, color: "text-indigo-500" },
    { label: "Issues em Aberto", value: issues.length ? String(issuesAbertas) : "--", icon: Bug, color: "text-rose-500" },
    { label: "Deploys Hoje", value: environments.length ? String(deploysHoje) : "--", icon: Rocket, color: "text-emerald-500" },
    { label: "Uptime Produção", value: producao?.uptime ?? "--", icon: Server, color: "text-cyan-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
          <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
          <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
