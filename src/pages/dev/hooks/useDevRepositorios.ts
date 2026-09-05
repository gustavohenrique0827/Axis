import { useState, useEffect, useCallback } from 'react';
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
  githubUrl?: string;
  fromGitHub?: boolean;
}

export interface GitHubConnection {
  username: string;
  avatar: string;
  connected_at: string;
}

const MOCK_REPOS: DevRepo[] = [
  { id: 1, name: "spy-crm-platform", description: "Plataforma principal do CRM S.P.Y. — React + TypeScript + Supabase", language: "TypeScript", visibility: 'private', status: 'ativo', branches: 8, stars: 14, forks: 2, lastCommit: "2h atrás", openPRs: 3, contributors: ["G.H.", "M.L.", "A.R."], size: "4.2 MB" },
  { id: 2, name: "spy-api-gateway", description: "Gateway de APIs com autenticação, rate limiting e logging centralizado", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 4, stars: 5, forks: 0, lastCommit: "1 dia atrás", openPRs: 1, contributors: ["G.H.", "P.C."], size: "1.8 MB" },
  { id: 3, name: "spy-mobile-app", description: "App mobile para alunos — React Native + Expo", language: "TypeScript", visibility: 'private', status: 'em desenvolvimento', branches: 6, stars: 9, forks: 0, lastCommit: "4h atrás", openPRs: 5, contributors: ["A.R.", "L.M.", "T.S."], size: "12.4 MB" },
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 60) return `${m}m atrás`;
  if (h < 24) return `${h}h atrás`;
  if (d < 30) return `${d} dias atrás`;
  return `${Math.floor(d / 30)} meses atrás`;
}

function ghRepoToDevRepo(gh: any): DevRepo {
  return {
    id: `gh-${gh.id}`,
    name: gh.name,
    description: gh.description || '',
    language: gh.language || 'Unknown',
    visibility: gh.private ? 'private' : 'public',
    status: gh.archived ? 'arquivado' : 'ativo',
    branches: 1,
    stars: gh.stargazers_count || 0,
    forks: gh.forks_count || 0,
    lastCommit: gh.pushed_at ? timeAgo(gh.pushed_at) : '—',
    openPRs: 0,
    contributors: [],
    size: formatBytes((gh.size || 0) * 1024),
    githubUrl: gh.html_url,
    fromGitHub: true,
  };
}

export function useDevRepositorios() {
  const [repos, setRepos] = useState<DevRepo[]>(supabase ? [] : MOCK_REPOS);
  const [loading, setLoading] = useState(false);
  const [githubConn, setGithubConn] = useState<GitHubConnection | null>(null);

  const loadGithubRepos = useCallback(async (pat: string) => {
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `Bearer ${pat}`, 'X-GitHub-Api-Version': '2022-11-28' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setRepos(prev => {
        const manual = prev.filter(r => !r.fromGitHub);
        return [...data.map(ghRepoToDevRepo), ...manual];
      });
    } catch {
      // GitHub API unreachable — keep existing repos
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);

      const [{ data: repoData }, { data: ghData }] = await Promise.all([
        supabase!.from('dev_repositories').select('*').order('created_at', { ascending: false }),
        supabase!.from('app_settings').select('value').eq('key', 'github_config').maybeSingle(),
      ]);

      const manualRepos = repoData ? repoData.map(rowToRepo) : [];
      setRepos(manualRepos);

      if (ghData?.value) {
        const cfg = typeof ghData.value === 'string' ? JSON.parse(ghData.value) : ghData.value;
        if (cfg?.pat && cfg?.username) {
          setGithubConn({ username: cfg.username, avatar: cfg.avatar, connected_at: cfg.connected_at });
          await loadGithubRepos(cfg.pat);
        }
      }

      setLoading(false);
    }
    load();
  }, [loadGithubRepos]);

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

  async function disconnectGitHub() {
    if (supabase) {
      await supabase.from('app_settings').delete().eq('key', 'github_config');
    }
    setGithubConn(null);
    setRepos(prev => prev.filter(r => !r.fromGitHub));
    toast.success('GitHub desconectado.');
  }

  return { repos, loading, addRepo, githubConn, setGithubConn, disconnectGitHub, loadGithubRepos };
}
