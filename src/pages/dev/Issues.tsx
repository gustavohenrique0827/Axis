import { useState } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, Circle, Clock, Flame, MessageSquare } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { NovaIssueDevModal, type NovaIssuePayload } from "./modals/NovaIssueDevModal";
import { useDevIssues, type Severity, type IssueStatus } from "./hooks/useDevIssues";

const SEVERITY_STYLE: Record<Severity, string> = {
  crítico: 'text-red-400',
  alto: 'text-amber-400',
  médio: 'text-amber-400',
  baixo: 'text-slate-400',
};

const STATUS_STYLE: Record<IssueStatus, string> = {
  aberto: 'text-red-400',
  'em andamento': 'text-amber-400',
  'em review': 'text-slate-300',
  fechado: 'text-emerald-400',
};

const STATUS_ICON = {
  aberto: Circle,
  'em andamento': AlertCircle,
  'em review': Clock,
  fechado: CheckCircle2,
};

export default function Issues() {
  const { issues, addIssue } = useDevIssues();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | IssueStatus>('todos');
  const [filterSeverity, setFilterSeverity] = useState<'todos' | Severity>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveIssue = async (data: NovaIssuePayload) => {
    await addIssue(data);
  };

  const filtered = issues.filter(issue => {
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || issue.labels.some(l => l.includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'todos' || issue.status === filterStatus;
    const matchSeverity = filterSeverity === 'todos' || issue.severity === filterSeverity;
    return matchSearch && matchStatus && matchSeverity;
  });

  const open = issues.filter(i => i.status === 'aberto').length;
  const inProgress = issues.filter(i => i.status === 'em andamento').length;
  const critical = issues.filter(i => i.severity === 'crítico').length;
  const closed = issues.filter(i => i.status === 'fechado').length;

  return (
    <PageContainer
      title="Issues & Bugs"
      description="Rastreamento centralizado de bugs, erros e issues de todos os projetos."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Issues" }]}
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl h-10 px-6 text-xs gap-2">
          <Plus className="w-4 h-4" /> Reportar Issue
        </Button>
      }
    >
      <div className="space-y-6 pb-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Abertos", value: open, icon: Circle },
            { label: "Em Andamento", value: inProgress, icon: AlertCircle },
            { label: "Críticos", value: critical, icon: Flame },
            { label: "Fechados", value: closed, icon: CheckCircle2 },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <s.icon className="w-4 h-4" />
                <span className="text-xs">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por título ou label..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="todos">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em andamento">Em Andamento</option>
            <option value="em review">Em Review</option>
            <option value="fechado">Fechado</option>
          </select>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="todos">Todas severidades</option>
            <option value="crítico">Crítico</option>
            <option value="alto">Alto</option>
            <option value="médio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
        </div>

        {/* Lista de Issues */}
        <Card className="overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map(issue => {
              const StatusIcon = STATUS_ICON[issue.status];
              return (
                <div key={String(issue.id)} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_STYLE[issue.status]}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-slate-500">#{issue.issueNumber}</span>
                      <h4 className="text-sm font-medium text-white">{issue.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-1">{issue.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">{issue.project}</span>
                      <span className="text-slate-700">·</span>
                      {issue.labels.map(l => (
                        <span key={l} className="text-xs text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded">#{l}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs flex items-center gap-1.5 ${SEVERITY_STYLE[issue.severity]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {issue.severity}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MessageSquare className="w-3 h-3" /> {issue.comments}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-white/10">
                      {issue.assignee === '-' ? '?' : issue.assignee.split('.')[0]}
                    </div>
                    <span className="text-xs text-slate-600 hidden md:block">{issue.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <NovaIssueDevModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveIssue}
      />
    </PageContainer>
  );
}
