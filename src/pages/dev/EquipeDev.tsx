import React, { useState } from 'react';
import {
  Users, Plus, Search, Code2, GitBranch, Bug,
  CheckCircle2, Clock, TrendingUp, Star, Mail,
  MoreHorizontal, Zap, Award, Coffee, Settings2
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";

type DevRole = 'Tech Lead' | 'Desenvolvedor Full Stack' | 'Desenvolvedor Frontend' | 'Desenvolvedor Backend' | 'DevOps' | 'QA Engineer' | 'Designer UI/UX';
type Status = 'Ativo' | 'Em Férias' | 'Home Office';

interface Developer {
  id: number;
  name: string;
  role: DevRole;
  email: string;
  avatar: string;
  status: Status;
  stack: string[];
  sprintPoints: number;
  commitsWeek: number;
  issuesResolved: number;
  currentTask: string;
  level: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
  squad: string;
}

const ROLE_COLORS: Record<DevRole, string> = {
  'Tech Lead': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'Desenvolvedor Full Stack': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Desenvolvedor Frontend': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Desenvolvedor Backend': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  'DevOps': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'QA Engineer': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Designer UI/UX': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
};

const STATUS_CONFIG: Record<Status, string> = {
  Ativo: 'bg-emerald-500',
  'Em Férias': 'bg-amber-500',
  'Home Office': 'bg-blue-500',
};

const LEVEL_BADGE: Record<string, string> = {
  Júnior: 'text-slate-400',
  Pleno: 'text-blue-400',
  Sênior: 'text-indigo-400',
  Especialista: 'text-purple-400',
};

const TEAM: Developer[] = [
  {
    id: 1, name: "Gustavo Henrique", role: "Tech Lead", email: "gustavo@gtech.com.br", avatar: "GH",
    status: "Ativo", stack: ["React", "TypeScript", "Supabase", "Node.js"],
    sprintPoints: 21, commitsWeek: 34, issuesResolved: 12, currentTask: "Arquitetura do módulo Dev",
    level: "Especialista", squad: "Core",
  },
  {
    id: 2, name: "Marina Lima", role: "Desenvolvedor Full Stack", email: "marina@gtech.com.br", avatar: "ML",
    status: "Ativo", stack: ["React", "TypeScript", "PostgreSQL"],
    sprintPoints: 13, commitsWeek: 18, issuesResolved: 7, currentTask: "Módulo financeiro 2.0",
    level: "Sênior", squad: "Core",
  },
  {
    id: 3, name: "André Rodrigues", role: "Desenvolvedor Frontend", email: "andre@gtech.com.br", avatar: "AR",
    status: "Home Office", stack: ["React", "React Native", "Expo", "Tailwind"],
    sprintPoints: 8, commitsWeek: 14, issuesResolved: 5, currentTask: "App Mobile v2 — tela de dashboard",
    level: "Pleno", squad: "Mobile",
  },
  {
    id: 4, name: "Pedro Costa", role: "Desenvolvedor Backend", email: "pedro@gtech.com.br", avatar: "PC",
    status: "Ativo", stack: ["Node.js", "Fastify", "Redis", "Docker"],
    sprintPoints: 11, commitsWeek: 22, issuesResolved: 9, currentTask: "API Gateway — rate limiting",
    level: "Sênior", squad: "Infrastructure",
  },
  {
    id: 5, name: "Tiago Silva", role: "DevOps", email: "tiago@gtech.com.br", avatar: "TS",
    status: "Ativo", stack: ["Terraform", "AWS", "Docker", "GitHub Actions"],
    sprintPoints: 5, commitsWeek: 8, issuesResolved: 4, currentTask: "Pipeline CI/CD — staging environment",
    level: "Sênior", squad: "Infrastructure",
  },
  {
    id: 6, name: "Larissa Martins", role: "QA Engineer", email: "larissa@gtech.com.br", avatar: "LM",
    status: "Ativo", stack: ["Cypress", "Playwright", "Jest", "k6"],
    sprintPoints: 8, commitsWeek: 10, issuesResolved: 15, currentTask: "Testes E2E módulo CRM",
    level: "Pleno", squad: "Quality",
  },
  {
    id: 7, name: "Felipe Nunes", role: "Designer UI/UX", email: "felipe@gtech.com.br", avatar: "FN",
    status: "Em Férias", stack: ["Figma", "Framer", "Storybook"],
    sprintPoints: 0, commitsWeek: 0, issuesResolved: 0, currentTask: "—",
    level: "Pleno", squad: "Design",
  },
];

const SQUADS = ['Todos', 'Core', 'Mobile', 'Infrastructure', 'Quality', 'Design'];

export default function EquipeDev() {
  const [search, setSearch] = useState('');
  const [filterSquad, setFilterSquad] = useState('Todos');

  const filtered = TEAM.filter(dev => {
    const matchSearch = dev.name.toLowerCase().includes(search.toLowerCase()) || dev.role.toLowerCase().includes(search.toLowerCase());
    const matchSquad = filterSquad === 'Todos' || dev.squad === filterSquad;
    return matchSearch && matchSquad;
  });

  const activeCount = TEAM.filter(d => d.status === 'Ativo' || d.status === 'Home Office').length;
  const totalCommits = TEAM.reduce((s, d) => s + d.commitsWeek, 0);
  const totalPoints = TEAM.reduce((s, d) => s + d.sprintPoints, 0);
  const totalIssues = TEAM.reduce((s, d) => s + d.issuesResolved, 0);

  return (
    <PageContainer
      title="Equipe Dev"
      description="Gerencie a equipe de desenvolvimento, squads, workload e performance de cada dev."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Equipe Dev" }]}
      actions={
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
          <Plus className="w-4 h-4" /> Adicionar Dev
        </Button>
      }
    >
      <div className="space-y-6 pb-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Devs Ativos", value: activeCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Commits / Semana", value: totalCommits, icon: GitBranch, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Story Points", value: totalPoints, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Issues Resolvidos", value: totalIssues, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((s, i) => (
            <Card key={i} className="p-5 bg-[#111827]/80 border-white/5 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar desenvolvedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {SQUADS.map(s => (
              <button
                key={s}
                onClick={() => setFilterSquad(s)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${filterSquad === s ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/[0.05]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Cards da equipe */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(dev => (
            <Card key={dev.id} className="p-6 bg-[#111827]/80 border-white/5 hover:border-blue-500/20 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-sm font-black text-white border border-white/10">
                      {dev.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111827] ${STATUS_CONFIG[dev.status]}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{dev.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{dev.email}</p>
                  </div>
                </div>
                <button className="text-slate-600 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Role + Level */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${ROLE_COLORS[dev.role]}`}>
                  {dev.role}
                </span>
                <span className={`text-[10px] font-black ${LEVEL_BADGE[dev.level]}`}>
                  {dev.level}
                </span>
                <span className="text-[9px] font-bold text-slate-600 bg-white/[0.03] px-2 py-0.5 rounded">
                  Squad {dev.squad}
                </span>
              </div>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {dev.stack.map(tech => (
                  <span key={tech} className="text-[9px] font-bold text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Current Task */}
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 mb-4">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tarefa atual</p>
                <p className="text-xs text-slate-300 font-bold line-clamp-1">{dev.currentTask}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-base font-black text-white">{dev.sprintPoints}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Pts Sprint</p>
                </div>
                <div className="text-center border-x border-white/5">
                  <p className="text-base font-black text-white">{dev.commitsWeek}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Commits</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-white">{dev.issuesResolved}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Issues</p>
                </div>
              </div>
            </Card>
          ))}

          {/* Add card */}
          <button className="p-6 bg-white/[0.01] border border-white/5 border-dashed rounded-2xl hover:border-blue-500/30 hover:bg-blue-600/[0.03] transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[320px] group">
            <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 transition-colors">
              <Plus className="w-6 h-6 text-slate-600 group-hover:text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-slate-600 group-hover:text-slate-400 uppercase tracking-widest">Adicionar Dev</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
