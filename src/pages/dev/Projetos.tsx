import React, { useState } from 'react';
import { FolderCode, Plus, Search, Clock, MoreHorizontal, Star, Bug } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { NovoProjetoDevModal, type NovoProjetoPayload } from "./modals/NovoProjetoDevModal";

const STATUS_COLORS: Record<string, string> = {
  "Em Produção": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "Em Desenvolvimento": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "Em Planejamento": "bg-amber-500/15 text-amber-400 border-amber-500/25",
  "Pausado": "bg-slate-500/15 text-slate-400 border-slate-500/25",
  "Concluído": "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
};

const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Plataforma Axis CRM",
    description: "Sistema principal de CRM e gestão multitenant da G-Tech.",
    status: "Em Desenvolvimento",
    progress: 72,
    stack: ["React", "TypeScript", "Supabase"],
    team: ["G.H.", "M.L.", "A.R."],
    lastCommit: "2h atrás",
    openIssues: 8,
    sprints: 6,
    stars: 14,
  },
  {
    id: 2,
    name: "API Gateway v3",
    description: "Novo gateway de APIs com rate limiting, autenticação e logs centralizados.",
    status: "Em Planejamento",
    progress: 20,
    stack: ["Node.js", "Fastify", "Redis"],
    team: ["G.H.", "P.C."],
    lastCommit: "1 dia atrás",
    openIssues: 3,
    sprints: 1,
    stars: 5,
  },
  {
    id: 3,
    name: "App Mobile Alunos",
    description: "Aplicativo mobile para alunos acessarem turmas, conteúdos e certificados.",
    status: "Em Desenvolvimento",
    progress: 45,
    stack: ["React Native", "Expo", "Supabase"],
    team: ["A.R.", "L.M.", "T.S."],
    lastCommit: "4h atrás",
    openIssues: 12,
    sprints: 3,
    stars: 9,
  },
  {
    id: 4,
    name: "Dashboard Analytics BI",
    description: "Painel de BI com métricas avançadas, gráficos e relatórios exportáveis.",
    status: "Em Produção",
    progress: 100,
    stack: ["React", "Recharts", "PostgreSQL"],
    team: ["G.H.", "M.L."],
    lastCommit: "5 dias atrás",
    openIssues: 1,
    sprints: 4,
    stars: 21,
  },
  {
    id: 5,
    name: "Módulo Financeiro 2.0",
    description: "Refatoração completa do módulo financeiro com integração bancária open finance.",
    status: "Em Planejamento",
    progress: 8,
    stack: ["React", "TypeScript", "OpenFinance API"],
    team: ["G.H.", "P.C.", "A.R."],
    lastCommit: "3 dias atrás",
    openIssues: 0,
    sprints: 0,
    stars: 7,
  },
  {
    id: 6,
    name: "SDK de Integrações",
    description: "SDK JavaScript/TypeScript para parceiros integrarem o Axis em suas plataformas.",
    status: "Concluído",
    progress: 100,
    stack: ["TypeScript", "npm", "Vitest"],
    team: ["M.L."],
    lastCommit: "2 semanas atrás",
    openIssues: 0,
    sprints: 2,
    stars: 33,
  },
];

const STACK_COLORS: Record<string, string> = {
  "React": "bg-cyan-500/10 text-cyan-400",
  "TypeScript": "bg-blue-500/10 text-blue-400",
  "Supabase": "bg-emerald-500/10 text-emerald-400",
  "Node.js": "bg-green-500/10 text-green-400",
  "Fastify": "bg-indigo-500/10 text-indigo-400",
  "Redis": "bg-red-500/10 text-red-400",
  "React Native": "bg-cyan-500/10 text-cyan-400",
  "Expo": "bg-slate-400/10 text-slate-300",
  "Recharts": "bg-purple-500/10 text-purple-400",
  "PostgreSQL": "bg-sky-500/10 text-sky-400",
  "OpenFinance API": "bg-yellow-500/10 text-yellow-400",
  "npm": "bg-red-500/10 text-red-300",
  "Vitest": "bg-emerald-500/10 text-emerald-300",
  "default": "bg-white/5 text-slate-400",
};

export default function Projetos() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveprojeto = (_data: NovoProjetoPayload) => {
    // integração com estado/API aqui
  };

  const statuses = ['Todos', ...Array.from(new Set(MOCK_PROJECTS.map(p => p.status)))];

  const filtered = MOCK_PROJECTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Projetos"
      description="Gerencie todos os projetos de desenvolvimento, stacks, times e progresso."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Projetos" }]}
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      }
    >
      <div className="space-y-6 pb-10">

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${filterStatus === s ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/[0.05]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Projetos Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => (
            <Card key={project.id} className="p-6 bg-[#111827]/80 border-white/5 hover:border-blue-500/20 transition-all duration-200 group flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <FolderCode className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-white text-sm truncate">{project.name}</h3>
                </div>
                <button className="text-slate-600 hover:text-white shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">{project.description}</p>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.stack.map(tech => (
                  <span key={tech} className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${STACK_COLORS[tech] || STACK_COLORS['default']}`}>
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Progresso</span>
                  <span className="text-[10px] font-black text-white">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${STATUS_COLORS[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <Bug className="w-3 h-3" /> {project.openIssues}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <Star className="w-3 h-3" /> {project.stars}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <Clock className="w-3 h-3" /> {project.lastCommit}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Card de adicionar */}
          <button onClick={() => setIsModalOpen(true)} className="p-6 bg-white/[0.01] border border-white/5 border-dashed rounded-2xl hover:border-blue-500/30 hover:bg-blue-600/[0.03] transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[240px] group">
            <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-600/10 transition-colors">
              <Plus className="w-6 h-6 text-slate-600 group-hover:text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-slate-600 group-hover:text-slate-400 uppercase tracking-widest">Novo Projeto</span>
          </button>
        </div>
      </div>

      <NovoProjetoDevModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveprojeto}
      />
    </PageContainer>
  );
}
