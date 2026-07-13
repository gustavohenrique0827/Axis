import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { NovoProjetoPayload } from '../modals/NovoProjetoDevModal';
import { generateProjectBacklogAI } from '../lib/generateProjectBacklogAI';

export interface DevProject {
  id: string;

  name: string;
  description: string;
  status: string;
  progress: number;
  stack: string[];
  team: string[];
  lastCommit: string;
  openIssues: number;
  sprints: number;
  stars: number;
}

const MOCK_PROJECTS: DevProject[] = [
  { id: "1", name: "Plataforma Axis CRM", description: "Sistema principal de CRM e gestão multitenant da G-Tech.", status: "Em Desenvolvimento", progress: 72, stack: ["React", "TypeScript", "Supabase"], team: ["G.H.", "M.L.", "A.R."], lastCommit: "2h atrás", openIssues: 8, sprints: 6, stars: 14 },
  { id: "2", name: "API Gateway v3", description: "Novo gateway de APIs com rate limiting, autenticação e logs centralizados.", status: "Em Planejamento", progress: 20, stack: ["Node.js", "Fastify", "Redis"], team: ["G.H.", "P.C."], lastCommit: "1 dia atrás", openIssues: 3, sprints: 1, stars: 5 },
  { id: "3", name: "App Mobile Alunos", description: "Aplicativo mobile para alunos acessarem turmas, conteúdos e certificados.", status: "Em Desenvolvimento", progress: 45, stack: ["React Native", "Expo", "Supabase"], team: ["A.R.", "L.M.", "T.S."], lastCommit: "4h atrás", openIssues: 12, sprints: 3, stars: 9 },
  { id: "4", name: "Dashboard Analytics BI", description: "Painel de BI com métricas avançadas, gráficos e relatórios exportáveis.", status: "Em Produção", progress: 100, stack: ["React", "Recharts", "PostgreSQL"], team: ["G.H.", "M.L."], lastCommit: "5 dias atrás", openIssues: 1, sprints: 4, stars: 21 },
  { id: "5", name: "Módulo Financeiro 2.0", description: "Refatoração completa do módulo financeiro com integração bancária open finance.", status: "Em Planejamento", progress: 8, stack: ["React", "TypeScript", "OpenFinance API"], team: ["G.H.", "P.C.", "A.R."], lastCommit: "3 dias atrás", openIssues: 0, sprints: 0, stars: 7 },
  { id: "6", name: "SDK de Integrações", description: "SDK JavaScript/TypeScript para parceiros integrarem o Axis em suas plataformas.", status: "Concluído", progress: 100, stack: ["TypeScript", "npm", "Vitest"], team: ["M.L."], lastCommit: "2 semanas atrás", openIssues: 0, sprints: 2, stars: 33 },
];


function rowToProject(row: any): DevProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status,
    progress: row.progress || 0,
    stack: row.stack || [],
    team: row.team || [],
    lastCommit: row.last_commit || '',
    openIssues: row.open_issues || 0,
    sprints: row.sprints || 0,
    stars: row.stars || 0,
  };
}

export function useDevProjects() {
  const [projects, setProjects] = useState<DevProject[]>(supabase ? [] : MOCK_PROJECTS);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('dev_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data !== null) {
        setProjects(data.map(rowToProject));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addProject(payload: NovoProjetoPayload) {
  if (!supabase) {
    setProjects(prev => [
      {
        ...(payload as any),
        id: String(Date.now()),
        progress: 0,
        team: [],
        lastCommit: 'agora',
        openIssues: 0,
        sprints: 0,
        stars: 0,
      },
      ...prev,
    ]);
    toast.success('Projeto criado!');
    return;
  }


    // 1) cria projeto
    const { data: projectRow, error: projectError } = await supabase
      .from('dev_projects')
      .insert({
        name: payload.name,
        description: payload.description,
        status: payload.status,
        stack: payload.stack,
        team: [],
        progress: 0,
        sprints: 1,
      })
      .select()
      .maybeSingle();

    if (projectError || !projectRow) {
      toast.error('Erro ao criar projeto');
      return;
    }

    const projectId = projectRow.id;

    // 2) cria backlog (tasks) diretamente na sprint
    // Como o schema atual não tem tabela dev_sprints separada,
    // usamos sprint_id = projectId como "chave" de sprint atual.
    const sprintId = projectId;

    const AI_TASKS_FALLBACK = [
      { title: 'Levantamento de requisitos e escopo', type: 'chore' as const, priority: 'alta' as const, points: 3, tags: ['requisitos', 'planejamento'] },
      { title: 'Setup inicial do projeto e padrão de desenvolvimento', type: 'chore' as const, priority: 'média' as const, points: 2, tags: ['setup', 'devops'] },
      { title: 'Implementação do fluxo principal do projeto', type: 'feature' as const, priority: 'alta' as const, points: 5, tags: ['core', 'feature'] },
      { title: 'Testes e validações (unitários/e2e) essenciais', type: 'chore' as const, priority: 'média' as const, points: 4, tags: ['testes', 'qualidade'] },
      { title: 'Documentação e handoff final', type: 'chore' as const, priority: 'baixa' as const, points: 2, tags: ['docs'] },
    ];

    const backlogAIInput = {
      productName: payload.name,
      description: payload.description,
    };

    let backlogTasks: Array<{
      title: string;
      type: 'feature' | 'bug' | 'chore' | 'refactor';
      priority: 'crítica' | 'alta' | 'média' | 'baixa';
      points: number;
      tags: string[];
    }> = AI_TASKS_FALLBACK;

    try {
      const generated = await generateProjectBacklogAI(backlogAIInput, 'gemini');
      backlogTasks = (generated.tasks || []).slice(0, 10).map(t => ({
        title: t.title,
        type: t.type,
        priority: t.priority,
        points: Math.max(1, Math.min(13, Math.round(t.points || 1))),
        tags: Array.isArray(t.tags) ? t.tags.slice(0, 5) : [],
      }));

      if (backlogTasks.length === 0) backlogTasks = AI_TASKS_FALLBACK;
    } catch (e: any) {
      // Mantém fallback se a IA falhar.
      console.error('Falha ao gerar backlog por IA:', e);
      toast.error('Falha ao gerar backlog por IA. Usando fallback genérico.');
    }


    const { error: tasksError } = await supabase
      .from('dev_sprint_tasks')
      .insert(
        backlogTasks.map(t => ({
          title: t.title,
          type: t.type,
          priority: t.priority,
          points: t.points,
          assignee: '—',
          tags: t.tags,
          column_id: 'backlog',
          project: projectId,
          sprint_id: sprintId,
          tenant_id: null,
        }))
      );

    if (tasksError) {
      toast.error('Erro ao gerar backlog');
      return;
    }

    // 3) persiste projeto e recomputa progress (0 pois tudo começa em backlog)
    const { error: updError } = await supabase
      .from('dev_projects')
      .update({ progress: 0, sprints: 1 })
      .eq('id', String(projectId));


    if (updError) {
      toast.error('Erro ao atualizar progresso do projeto');
      return;
    }

    setProjects(prev => [rowToProject(projectRow), ...prev]);
    toast.success('Projeto criado e backlog gerado!');
  }


  async function updateProject(payload: {
    id: string;

    name: string;
    description: string;
    status: string;
    stack: string[];
  }) {
    if (!supabase) {
      setProjects((prev) =>
        prev.map((p) =>
          String(p.id) === String(payload.id)
            ? {
                ...p,
                name: payload.name,
                description: payload.description,
                status: payload.status,
                stack: payload.stack,
              }
            : p
        )
      );
      toast.success('Projeto atualizado!');
      return;
    }

    const { error } = await supabase
      .from('dev_projects')
      .update({
        name: payload.name,
        description: payload.description,
        status: payload.status,
        stack: payload.stack,
        updated_at: new Date().toISOString(),
      })
      .eq('id', String(payload.id));


    if (error) {
      toast.error('Erro ao atualizar projeto');
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(payload.id)
          ? { ...p, name: payload.name, description: payload.description, status: payload.status, stack: payload.stack }
          : p
      )
    );

    toast.success('Projeto atualizado!');
  }

  async function deleteProject(projectId: string) {

    if (!supabase) {
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(projectId)));
      toast.success('Projeto apagado!');
      return;
    }

    // As tasks devem ser removidas em cascata (ON DELETE CASCADE).
    // Se por algum motivo não estiver ativo, remover manualmente dev_sprint_tasks antes.
    const { error } = await supabase.from('dev_projects').delete().eq('id', String(projectId));


    if (error) {
      toast.error('Erro ao apagar projeto');
      return;
    }

    setProjects((prev) => prev.filter((p) => String(p.id) !== String(projectId)));
    toast.success('Projeto apagado!');
  }

  return { projects, loading, addProject, updateProject, deleteProject };
}
