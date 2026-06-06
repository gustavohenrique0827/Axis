import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { NovoProjetoPayload } from '../modals/NovoProjetoDevModal';

export interface DevProject {
  id: string | number;
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
  { id: 1, name: "Plataforma Axis CRM", description: "Sistema principal de CRM e gestão multitenant da G-Tech.", status: "Em Desenvolvimento", progress: 72, stack: ["React", "TypeScript", "Supabase"], team: ["G.H.", "M.L.", "A.R."], lastCommit: "2h atrás", openIssues: 8, sprints: 6, stars: 14 },
  { id: 2, name: "API Gateway v3", description: "Novo gateway de APIs com rate limiting, autenticação e logs centralizados.", status: "Em Planejamento", progress: 20, stack: ["Node.js", "Fastify", "Redis"], team: ["G.H.", "P.C."], lastCommit: "1 dia atrás", openIssues: 3, sprints: 1, stars: 5 },
  { id: 3, name: "App Mobile Alunos", description: "Aplicativo mobile para alunos acessarem turmas, conteúdos e certificados.", status: "Em Desenvolvimento", progress: 45, stack: ["React Native", "Expo", "Supabase"], team: ["A.R.", "L.M.", "T.S."], lastCommit: "4h atrás", openIssues: 12, sprints: 3, stars: 9 },
  { id: 4, name: "Dashboard Analytics BI", description: "Painel de BI com métricas avançadas, gráficos e relatórios exportáveis.", status: "Em Produção", progress: 100, stack: ["React", "Recharts", "PostgreSQL"], team: ["G.H.", "M.L."], lastCommit: "5 dias atrás", openIssues: 1, sprints: 4, stars: 21 },
  { id: 5, name: "Módulo Financeiro 2.0", description: "Refatoração completa do módulo financeiro com integração bancária open finance.", status: "Em Planejamento", progress: 8, stack: ["React", "TypeScript", "OpenFinance API"], team: ["G.H.", "P.C.", "A.R."], lastCommit: "3 dias atrás", openIssues: 0, sprints: 0, stars: 7 },
  { id: 6, name: "SDK de Integrações", description: "SDK JavaScript/TypeScript para parceiros integrarem o Axis em suas plataformas.", status: "Concluído", progress: 100, stack: ["TypeScript", "npm", "Vitest"], team: ["M.L."], lastCommit: "2 semanas atrás", openIssues: 0, sprints: 2, stars: 33 },
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
      setProjects(prev => [{ ...payload, id: Date.now(), progress: 0, team: [], lastCommit: 'agora', openIssues: 0, sprints: 0, stars: 0 }, ...prev]);
      toast.success('Projeto criado!');
      return;
    }
    const { data, error } = await supabase
      .from('dev_projects')
      .insert({ name: payload.name, description: payload.description, status: payload.status, stack: payload.stack })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao criar projeto'); return; }
    if (data) {
      setProjects(prev => [rowToProject(data), ...prev]);
      toast.success('Projeto criado!');
    }
  }

  return { projects, loading, addProject };
}
