import { useState } from 'react';
import { FolderCode, Plus, Search, Clock, MoreHorizontal, Star, Bug } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { NovoProjetoDevModal, type NovoProjetoPayload } from "./modals/NovoProjetoDevModal";
import { useDevProjects } from "./hooks/useDevProjects";

const STATUS_DOT: Record<string, string> = {
  "Em Produção": "bg-emerald-500",
  "Em Planejamento": "bg-amber-500",
  "Pausado": "bg-slate-500",
  "Em Desenvolvimento": "bg-slate-500",
  "Concluído": "bg-slate-500",
};

export default function Projetos() {
  const { projects, addProject } = useDevProjects();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveProjeto = async (data: NovoProjetoPayload) => {
    await addProject(data);
  };

  const statuses = ['Todos', ...Array.from(new Set(projects.map(p => p.status)))];

  const filtered = projects.filter(p => {
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
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
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
              className="w-full bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-xs transition-all border ${filterStatus === s ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/[0.05]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Projetos Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(project => (
            <Card
              key={String(project.id)}
              className="p-6 flex flex-col cursor-pointer"
              onClick={() => window.location.assign(`/app/dev/projetos/${project.id}`)}
            >

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FolderCode className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="font-medium text-white text-sm truncate">{project.name}</h3>
                </div>
                <button className="text-slate-600 hover:text-white shrink-0">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">{project.description}</p>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.stack.map(tech => (
                  <span key={tech} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Progresso</span>
                  <span className="text-xs text-white">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[project.status] || 'bg-slate-500'}`} />
                  {project.status}
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="flex items-center gap-1 text-xs">
                    <Bug className="w-3 h-3" /> {project.openIssues}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3" /> {project.stars}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" /> {project.lastCommit}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Card de adicionar */}
          <button onClick={() => setIsModalOpen(true)} className="p-6 bg-white/[0.01] border border-white/5 border-dashed rounded-2xl hover:border-white/10 hover:bg-white/[0.02] transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[240px]">
            <Plus className="w-6 h-6 text-slate-600" />
            <span className="text-xs text-slate-500">Novo Projeto</span>
          </button>
        </div>
      </div>

      <NovoProjetoDevModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProjeto}
      />
    </PageContainer>
  );
}
