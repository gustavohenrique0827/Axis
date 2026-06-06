import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { NovoRepositorioPayload } from '../modals/NovoRepositorioDevModal';

export interface DevRepo {
  id: string | number;
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

const MOCK_REPOS: DevRepo[] = [
  { id: 1, name: "axis-crm-platform", description: "Plataforma principal do CRM Axis — React + TypeScript + Supabase", language: "TypeScript", visibility: 'private', status: 'ativo', branches: 8, stars: 14, forks: 2, lastCommit: "2h atrás", openPRs: 3, contributors: ["G.H.", "M.L.", "A.R."], size: "4.2 MB" },
  { id: 2, name: "axis-api-gateway", description: "Gateway de APIs com autenticação, rate limiting e logging centralizado", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 4, stars: 5, forks: 0, lastCommit: "1 dia atrás", openPRs: 1, contributors: ["G.H.", "P.C."], size: "1.8 MB" },
  { id: 3, name: "axis-mobile-app", description: "App mobile para alunos — React Native + Expo", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 6, stars: 9, forks: 0, lastCommit: "4h atrás", openPRs: 5, contributors: ["A.R.", "L.M.", "T.S."], size: "12.4 MB" },
  { id: 4, name: "axis-analytics-bi", description: "Painel de BI e analytics com Recharts e PostgreSQL", language: "TypeScript", visibility: 'private', status: 'ativo', branches: 3, stars: 21, forks: 1, lastCommit: "5 dias atrás", openPRs: 0, contributors: ["G.H.", "M.L."], size: "2.1 MB" },
  { id: 5, name: "axis-integrations-sdk", description: "SDK público para integrações com a plataforma Axis", language: "TypeScript", visibility: 'public', status: 'ativo', branches: 2, stars: 33, forks: 8, lastCommit: "2 semanas atrás", openPRs: 0, contributors: ["M.L."], size: "0.8 MB" },
  { id: 6, name: "axis-infra-terraform", description: "Infraestrutura como código — AWS + Terraform + CI/CD", language: "Go", visibility: 'private', status: 'ativo', branches: 5, stars: 7, forks: 0, lastCommit: "3 dias atrás", openPRs: 2, contributors: ["G.H.", "P.C."], size: "0.5 MB" },
  { id: 7, name: "axis-landing-builder", description: "Editor de landing pages drag-and-drop para campanhas", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 3, stars: 4, forks: 0, lastCommit: "6h atrás", openPRs: 2, contributors: ["T.S.", "L.M."], size: "3.7 MB" },
  { id: 8, name: "axis-legacy-v1", description: "Versão legada do sistema (descontinuada)", language: "JavaScript", visibility: 'private', status: 'arquivado', branches: 1, stars: 2, forks: 0, lastCommit: "1 ano atrás", openPRs: 0, contributors: ["G.H."], size: "8.9 MB" },
];

function rowToRepo(row: any): DevRepo {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    language: row.language || 'TypeScript',
    visibility: row.visibility as DevRepo['visibility'],
    status: row.status as DevRepo['status'],
    branches: row.branches || 1,
    stars: row.stars || 0,
    forks: row.forks || 0,
    lastCommit: row.last_commit || '',
    openPRs: row.open_prs || 0,
    contributors: row.contributors || [],
    size: row.size || '0 MB',
  };
}

export function useDevRepositorios() {
  const [repos, setRepos] = useState<DevRepo[]>(supabase ? [] : MOCK_REPOS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('dev_repositories')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data !== null) {
        setRepos(data.map(rowToRepo));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addRepo(payload: NovoRepositorioPayload) {
    const visibility = payload.visibility === 'Público' ? 'public' : 'private';
    if (!supabase) {
      setRepos(prev => [{ id: Date.now(), name: payload.name, description: payload.description, language: payload.language, visibility, status: 'em desenvolvimento', branches: 1, stars: 0, forks: 0, lastCommit: 'agora', openPRs: 0, contributors: [], size: '0 MB' }, ...prev]);
      toast.success('Repositório criado!');
      return;
    }
    const { data, error } = await supabase
      .from('dev_repositories')
      .insert({ name: payload.name, description: payload.description, language: payload.language, visibility })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao criar repositório'); return; }
    if (data) {
      setRepos(prev => [rowToRepo(data), ...prev]);
      toast.success('Repositório criado!');
    }
  }

  return { repos, loading, addRepo };
}
