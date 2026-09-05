import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { NovaIssuePayload } from '../modals/NovaIssueDevModal';

export type Severity = 'crítico' | 'alto' | 'médio' | 'baixo';
export type IssueStatus = 'aberto' | 'em andamento' | 'em review' | 'fechado';

export interface DevIssue {
  id: string | number;
  issueNumber: number;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  project: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  comments: number;
  labels: string[];
}

const MOCK_ISSUES: DevIssue[] = [
  { id: 247, issueNumber: 247, title: "Timeout na requisição de checkout após 30s", description: "Usuários relatam erro 504 ao finalizar compras com mais de 3 itens no carrinho.", severity: 'crítico', status: 'em andamento', project: "Plataforma S.P.Y. CRM", assignee: "G.H.", reporter: "M.L.", createdAt: "1h atrás", comments: 5, labels: ["checkout", "performance", "backend"] },
  { id: 246, issueNumber: 246, title: "Layout quebrado em mobile no pipeline Kanban", description: "Cards do pipeline ficam sobrepostos em telas menores que 375px.", severity: 'alto', status: 'em review', project: "Plataforma S.P.Y. CRM", assignee: "T.S.", reporter: "A.R.", createdAt: "3h atrás", comments: 2, labels: ["mobile", "crm", "ui"] },
  { id: 245, issueNumber: 245, title: "Emails de confirmação não estão sendo enviados", description: "Após atualização do SMTP, os emails de confirmação de matrícula pararam.", severity: 'crítico', status: 'aberto', project: "App Mobile Alunos", assignee: "P.C.", reporter: "G.H.", createdAt: "5h atrás", comments: 8, labels: ["email", "smtp", "educação"] },
  { id: 244, issueNumber: 244, title: "Filtros de data no relatório financeiro retornam incorreto", description: "Ao filtrar por mês, o sistema inclui transações do mês anterior.", severity: 'alto', status: 'aberto', project: "Plataforma S.P.Y. CRM", assignee: "M.L.", reporter: "P.C.", createdAt: "1 dia atrás", comments: 3, labels: ["financeiro", "relatórios"] },
  { id: 243, issueNumber: 243, title: "Erro 403 ao acessar configurações de empresa", description: "Usuários com role 'Administrador' recebem 403 ao editar dados da empresa.", severity: 'médio', status: 'em andamento', project: "Plataforma S.P.Y. CRM", assignee: "G.H.", reporter: "L.M.", createdAt: "2 dias atrás", comments: 4, labels: ["auth", "permissões"] },
  { id: 242, issueNumber: 242, title: "Lentidão ao carregar lista de alunos com 500+ registros", description: "A página de alunos demora mais de 8 segundos quando há muitos registros.", severity: 'médio', status: 'fechado', project: "App Mobile Alunos", assignee: "A.R.", reporter: "T.S.", createdAt: "3 dias atrás", comments: 6, labels: ["performance", "educação"] },
  { id: 241, issueNumber: 241, title: "Botão de exportar CSV não responde no Firefox", description: "No Firefox versão 118+, o botão de exportação de relatório não dispara o download.", severity: 'baixo', status: 'aberto', project: "Plataforma S.P.Y. CRM", assignee: "-", reporter: "M.L.", createdAt: "4 dias atrás", comments: 1, labels: ["browser", "exportação"] },
  { id: 240, issueNumber: 240, title: "Tooltip de gráfico BI sobrepõe sidebar em telas 1366px", description: "Em resoluções de 1366x768, o tooltip dos gráficos ultrapassa a sidebar.", severity: 'baixo', status: 'fechado', project: "Dashboard Analytics BI", assignee: "L.M.", reporter: "G.H.", createdAt: "1 semana atrás", comments: 2, labels: ["ui", "bi"] },
];

function rowToIssue(row: any): DevIssue {
  return {
    id: row.id,
    issueNumber: row.issue_number || 0,
    title: row.title,
    description: row.description || '',
    severity: row.severity as Severity,
    status: row.status as IssueStatus,
    project: row.project || '',
    assignee: row.assignee || '-',
    reporter: row.reporter || '',
    createdAt: new Date(row.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    comments: row.comments || 0,
    labels: row.labels || [],
  };
}

export function useDevIssues() {
  const [issues, setIssues] = useState<DevIssue[]>(supabase ? [] : MOCK_ISSUES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('dev_issues')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data !== null) {
        setIssues(data.map(rowToIssue));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addIssue(payload: NovaIssuePayload) {
    if (!supabase) {
      const next = Math.max(...issues.map(i => i.issueNumber)) + 1;
      setIssues(prev => [{
        id: Date.now(), issueNumber: next,
        title: payload.title, description: payload.description,
        severity: payload.severity, status: 'aberto',
        project: payload.project, assignee: payload.assignee || '-',
        reporter: '', createdAt: 'agora', comments: 0, labels: payload.labels,
      }, ...prev]);
      toast.success('Issue registrado!');
      return;
    }
    const { data, error } = await supabase
      .from('dev_issues')
      .insert({
        title: payload.title, description: payload.description,
        severity: payload.severity, project: payload.project,
        assignee: payload.assignee || '-', labels: payload.labels,
      })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao registrar issue'); return; }
    if (data) {
      setIssues(prev => [rowToIssue(data), ...prev]);
      toast.success('Issue registrado!');
    }
  }

  return { issues, loading, addIssue };
}
