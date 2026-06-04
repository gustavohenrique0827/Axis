import React, { useState } from 'react';
import { GitBranch, GitFork, Star, Lock, Globe, Plus, Search, Clock, Code2, Archive, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { NovoRepositorioDevModal, type NovoRepositorioPayload } from "./modals/NovoRepositorioDevModal";

interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  visibility: 'public' | 'private';
  status: 'ativo' | 'arquivado' | 'em desenvolvimento';
  branches: number;
  stars: number;
  forks: number;
  lastCommit: string;
  openPRs: number;
  contributors: string[];
  size: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3B82F6',
  JavaScript: '#F59E0B',
  Python: '#10B981',
  Go: '#06B6D4',
  Rust: '#F97316',
  'C#': '#8B5CF6',
  Dart: '#22D3EE',
};

const MOCK_REPOS: Repo[] = [
  { id: 1, name: "axis-crm-platform", description: "Plataforma principal do CRM Axis — React + TypeScript + Supabase", language: "TypeScript", visibility: 'private', status: 'ativo', branches: 8, stars: 14, forks: 2, lastCommit: "2h atrás", openPRs: 3, contributors: ["G.H.", "M.L.", "A.R."], size: "4.2 MB" },
  { id: 2, name: "axis-api-gateway", description: "Gateway de APIs com autenticação, rate limiting e logging centralizado", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 4, stars: 5, forks: 0, lastCommit: "1 dia atrás", openPRs: 1, contributors: ["G.H.", "P.C."], size: "1.8 MB" },
  { id: 3, name: "axis-mobile-app", description: "App mobile para alunos — React Native + Expo", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 6, stars: 9, forks: 0, lastCommit: "4h atrás", openPRs: 5, contributors: ["A.R.", "L.M.", "T.S."], size: "12.4 MB" },
  { id: 4, name: "axis-analytics-bi", description: "Painel de BI e analytics com Recharts e PostgreSQL", language: "TypeScript", visibility: 'private', status: 'ativo', branches: 3, stars: 21, forks: 1, lastCommit: "5 dias atrás", openPRs: 0, contributors: ["G.H.", "M.L."], size: "2.1 MB" },
  { id: 5, name: "axis-integrations-sdk", description: "SDK público para integrações com a plataforma Axis", language: "TypeScript", visibility: 'public', status: 'ativo', branches: 2, stars: 33, forks: 8, lastCommit: "2 semanas atrás", openPRs: 0, contributors: ["M.L."], size: "0.8 MB" },
  { id: 6, name: "axis-infra-terraform", description: "Infraestrutura como código — AWS + Terraform + CI/CD", language: "Go", visibility: 'private', status: 'ativo', branches: 5, stars: 7, forks: 0, lastCommit: "3 dias atrás", openPRs: 2, contributors: ["G.H.", "P.C."], size: "0.5 MB" },
  { id: 7, name: "axis-landing-builder", description: "Editor de landing pages drag-and-drop para campanhas", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 3, stars: 4, forks: 0, lastCommit: "6h atrás", openPRs: 2, contributors: ["T.S.", "L.M."], size: "3.7 MB" },
  { id: 8, name: "axis-legacy-v1", description: "Versão legada do sistema (descontinuada)", language: "JavaScript", visibility: 'private', status: 'arquivado', branches: 1, stars: 2, forks: 0, lastCommit: "1 ano atrás", openPRs: 0, contributors: ["G.H."], size: "8.9 MB" },
];

const STATUS_STYLE: Record<string, string> = {
  ativo: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'em desenvolvimento': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  arquivado: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

export default function Repositorios() {
  const [search, setSearch] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'todos' | 'public' | 'private'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveRepo = (_data: NovoRepositorioPayload) => {
    // integração com estado/API aqui
  };

  const filtered = MOCK_REPOS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchVis = filterVisibility === 'todos' || r.visibility === filterVisibility;
    return matchSearch && matchVis;
  });

  const totalStars = MOCK_REPOS.reduce((s, r) => s + r.stars, 0);
  const totalPRs = MOCK_REPOS.reduce((s, r) => s + r.openPRs, 0);
  const activeRepos = MOCK_REPOS.filter(r => r.status !== 'arquivado').length;

  return (
    <PageContainer
      title="Repositórios"
      description="Gerencie todos os repositórios de código da organização."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Repositórios" }]}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
            <GitFork className="w-4 h-4" /> Conectar GitHub
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Plus className="w-4 h-4" /> Novo Repo
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Repositórios", value: MOCK_REPOS.length, icon: Code2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Ativos", value: activeRepos, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Stars Total", value: totalStars, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "PRs em Aberto", value: totalPRs, icon: GitBranch, color: "text-indigo-400", bg: "bg-indigo-500/10" },
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
              placeholder="Buscar repositório..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'private', 'public'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilterVisibility(v)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${filterVisibility === v ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/[0.05]'}`}
              >
                {v === 'private' && <Lock className="w-3 h-3" />}
                {v === 'public' && <Globe className="w-3 h-3" />}
                {v === 'todos' ? 'Todos' : v === 'private' ? 'Privados' : 'Públicos'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <Card className="bg-[#111827]/80 border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map(repo => (
              <div key={repo.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <div className="p-2.5 rounded-xl bg-white/5 shrink-0">
                  {repo.status === 'arquivado'
                    ? <Archive className="w-4 h-4 text-slate-500" />
                    : <Code2 className="w-4 h-4 text-blue-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors font-mono">
                      {repo.name}
                    </h4>
                    <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded border ${repo.visibility === 'private' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {repo.visibility === 'private' ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                      {repo.visibility}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${STATUS_STYLE[repo.status]}`}>
                      {repo.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">{repo.description}</p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || '#64748B' }} />
                      {repo.language}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {repo.branches} branches
                    </div>
                    {repo.openPRs > 0 && (
                      <div className="flex items-center gap-1 text-indigo-400">
                        <GitBranch className="w-3 h-3" /> {repo.openPRs} PRs abertos
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {repo.lastCommit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex -space-x-1.5">
                    {repo.contributors.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-black text-white border border-white/10">
                        {c.split('.')[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 hidden md:block">{repo.size}</span>
                  <button className="text-slate-600 hover:text-blue-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <NovoRepositorioDevModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRepo}
      />
    </PageContainer>
  );
}
