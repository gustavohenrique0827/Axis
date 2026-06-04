import React, { useState } from 'react';
import { Plus, Search, AlertCircle, CheckCircle2, Circle, Clock, Flame, MessageSquare } from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { NovaIssueDevModal, type NovaIssuePayload } from "./modals/NovaIssueDevModal";

type Severity = 'crítico' | 'alto' | 'médio' | 'baixo';
type Status = 'aberto' | 'em andamento' | 'em review' | 'fechado';

interface Issue {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  project: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  comments: number;
  labels: string[];
}

const SEVERITY_STYLE: Record<Severity, string> = {
  crítico: 'bg-red-500/15 text-red-400 border-red-500/30',
  alto: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  médio: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  baixo: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const STATUS_STYLE: Record<Status, string> = {
  aberto: 'text-red-400',
  'em andamento': 'text-amber-400',
  'em review': 'text-indigo-400',
  fechado: 'text-emerald-400',
};

const STATUS_ICON: Record<Status, React.FC<any>> = {
  aberto: Circle,
  'em andamento': AlertCircle,
  'em review': Clock,
  fechado: CheckCircle2,
};

const MOCK_ISSUES: Issue[] = [
  { id: 247, title: "Timeout na requisição de checkout após 30s", description: "Usuários relatam erro 504 ao finalizar compras com mais de 3 itens no carrinho.", severity: 'crítico', status: 'em andamento', project: "Plataforma Axis CRM", assignee: "G.H.", reporter: "M.L.", createdAt: "1h atrás", comments: 5, labels: ["checkout", "performance", "backend"] },
  { id: 246, title: "Layout quebrado em mobile no pipeline Kanban", description: "Cards do pipeline ficam sobrepostos em telas menores que 375px de largura.", severity: 'alto', status: 'em review', project: "Plataforma Axis CRM", assignee: "T.S.", reporter: "A.R.", createdAt: "3h atrás", comments: 2, labels: ["mobile", "crm", "ui"] },
  { id: 245, title: "Emails de confirmação não estão sendo enviados", description: "Após a atualização do SMTP, os emails de confirmação de matrícula pararam.", severity: 'crítico', status: 'aberto', project: "App Mobile Alunos", assignee: "P.C.", reporter: "G.H.", createdAt: "5h atrás", comments: 8, labels: ["email", "smtp", "educação"] },
  { id: 244, title: "Filtros de data no relatório financeiro retornam incorreto", description: "Ao filtrar por mês, o sistema inclui transações do mês anterior na contagem.", severity: 'alto', status: 'aberto', project: "Plataforma Axis CRM", assignee: "M.L.", reporter: "P.C.", createdAt: "1 dia atrás", comments: 3, labels: ["financeiro", "relatórios"] },
  { id: 243, title: "Erro 403 ao tentar acessar configurações de empresa", description: "Usuários com role 'Administrador' recebem 403 ao tentar editar dados da empresa.", severity: 'médio', status: 'em andamento', project: "Plataforma Axis CRM", assignee: "G.H.", reporter: "L.M.", createdAt: "2 dias atrás", comments: 4, labels: ["auth", "permissões"] },
  { id: 242, title: "Lentidão ao carregar lista de alunos com mais de 500 registros", description: "A página de alunos demora mais de 8 segundos quando há muitos registros.", severity: 'médio', status: 'fechado', project: "App Mobile Alunos", assignee: "A.R.", reporter: "T.S.", createdAt: "3 dias atrás", comments: 6, labels: ["performance", "educação"] },
  { id: 241, title: "Botão de exportar CSV não responde no Firefox", description: "No Firefox versão 118+, o botão de exportação de relatório não dispara o download.", severity: 'baixo', status: 'aberto', project: "Plataforma Axis CRM", assignee: "-", reporter: "M.L.", createdAt: "4 dias atrás", comments: 1, labels: ["browser", "exportação"] },
  { id: 240, title: "Tooltip de gráfico BI sobrepõe sidebar em telas 1366px", description: "Em resoluções de 1366x768, o tooltip dos gráficos ultrapassa a sidebar.", severity: 'baixo', status: 'fechado', project: "Dashboard Analytics BI", assignee: "L.M.", reporter: "G.H.", createdAt: "1 semana atrás", comments: 2, labels: ["ui", "bi"] },
];

export default function Issues() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | Status>('todos');
  const [filterSeverity, setFilterSeverity] = useState<'todos' | Severity>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveIssue = (_data: NovaIssuePayload) => {
    // integração com estado/API aqui
  };

  const filtered = MOCK_ISSUES.filter(issue => {
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || issue.labels.some(l => l.includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'todos' || issue.status === filterStatus;
    const matchSeverity = filterSeverity === 'todos' || issue.severity === filterSeverity;
    return matchSearch && matchStatus && matchSeverity;
  });

  const open = MOCK_ISSUES.filter(i => i.status === 'aberto').length;
  const inProgress = MOCK_ISSUES.filter(i => i.status === 'em andamento').length;
  const critical = MOCK_ISSUES.filter(i => i.severity === 'crítico').length;
  const closed = MOCK_ISSUES.filter(i => i.status === 'fechado').length;

  return (
    <PageContainer
      title="Issues & Bugs"
      description="Rastreamento centralizado de bugs, erros e issues de todos os projetos."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Issues" }]}
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
          <Plus className="w-4 h-4" /> Reportar Issue
        </Button>
      }
    >
      <div className="space-y-6 pb-10">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Abertos", value: open, color: "text-red-400", bg: "bg-red-500/10", icon: Circle },
            { label: "Em Andamento", value: inProgress, color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertCircle },
            { label: "Críticos", value: critical, color: "text-orange-400", bg: "bg-orange-500/10", icon: Flame },
            { label: "Fechados", value: closed, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
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
              placeholder="Buscar por título ou label..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111827] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-[#111827] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
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
            className="bg-[#111827] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="todos">Todas severidades</option>
            <option value="crítico">Crítico</option>
            <option value="alto">Alto</option>
            <option value="médio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
        </div>

        {/* Lista de Issues */}
        <Card className="bg-[#111827]/80 border-white/5 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map(issue => {
              const StatusIcon = STATUS_ICON[issue.status];
              return (
                <div key={issue.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${STATUS_STYLE[issue.status]}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-black text-slate-500 font-mono">#{issue.id}</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{issue.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-1">{issue.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] text-slate-500 font-bold">{issue.project}</span>
                      <span className="text-slate-700">·</span>
                      {issue.labels.map(l => (
                        <span key={l} className="text-[9px] font-bold text-slate-500 bg-white/[0.03] px-1.5 py-0.5 rounded">#{l}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${SEVERITY_STYLE[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <MessageSquare className="w-3 h-3" /> {issue.comments}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-black text-white border border-white/10">
                      {issue.assignee === '-' ? '?' : issue.assignee.split('.')[0]}
                    </div>
                    <span className="text-[10px] text-slate-600 hidden md:block">{issue.createdAt}</span>
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
