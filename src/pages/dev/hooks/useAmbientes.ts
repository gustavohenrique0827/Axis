import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export type EnvStatus = 'operacional' | 'degradado' | 'offline' | 'em deploy';

export interface DevEnvironment {
  id: string;
  name: string;
  type: string;
  status: EnvStatus;
  url: string;
  version: string;
  lastDeploy: string;
  uptime: string;
  region: string;
  metrics: { cpu: number; memory: number; requests: string; latency: string };
  services: { name: string; status: EnvStatus }[];
}

const MOCK_ENVIRONMENTS: DevEnvironment[] = [
  {
    id: 'prod',
    name: 'Produção',
    type: 'Production',
    status: 'operacional',
    url: 'app.axiscrm.com.br',
    version: 'v2.4.1',
    lastDeploy: '2 dias atrás',
    uptime: '99.98%',
    region: 'sa-east-1 (São Paulo)',
    metrics: { cpu: 34, memory: 61, requests: '1.2k/min', latency: '142ms' },
    services: [
      { name: 'API REST', status: 'operacional' },
      { name: 'Banco de Dados', status: 'operacional' },
      { name: 'Autenticação', status: 'operacional' },
      { name: 'Storage', status: 'operacional' },
      { name: 'Email SMTP', status: 'operacional' },
    ],
  },
  {
    id: 'staging',
    name: 'Staging',
    type: 'Staging',
    status: 'em deploy',
    url: 'staging.axiscrm.com.br',
    version: 'v2.4.2-rc1',
    lastDeploy: '45 min atrás',
    uptime: '99.2%',
    region: 'sa-east-1 (São Paulo)',
    metrics: { cpu: 18, memory: 42, requests: '84/min', latency: '198ms' },
    services: [
      { name: 'API REST', status: 'em deploy' },
      { name: 'Banco de Dados', status: 'operacional' },
      { name: 'Autenticação', status: 'operacional' },
      { name: 'Storage', status: 'operacional' },
      { name: 'Email SMTP', status: 'degradado' },
    ],
  },
  {
    id: 'dev',
    name: 'Desenvolvimento',
    type: 'Development',
    status: 'operacional',
    url: 'dev.axiscrm.com.br',
    version: 'v2.5.0-dev',
    lastDeploy: '2h atrás',
    uptime: '95.4%',
    region: 'us-east-1 (N. Virgínia)',
    metrics: { cpu: 8, memory: 29, requests: '12/min', latency: '310ms' },
    services: [
      { name: 'API REST', status: 'operacional' },
      { name: 'Banco de Dados', status: 'operacional' },
      { name: 'Autenticação', status: 'operacional' },
      { name: 'Storage', status: 'operacional' },
      { name: 'Email SMTP', status: 'offline' },
    ],
  },
  {
    id: 'qa',
    name: 'QA / Testes',
    type: 'QA',
    status: 'degradado',
    url: 'qa.axiscrm.com.br',
    version: 'v2.4.2-qa',
    lastDeploy: '1 dia atrás',
    uptime: '88.7%',
    region: 'us-east-1 (N. Virgínia)',
    metrics: { cpu: 45, memory: 72, requests: '320/min', latency: '520ms' },
    services: [
      { name: 'API REST', status: 'degradado' },
      { name: 'Banco de Dados', status: 'operacional' },
      { name: 'Autenticação', status: 'degradado' },
      { name: 'Storage', status: 'operacional' },
      { name: 'Email SMTP', status: 'operacional' },
    ],
  },
];

function rowToEnv(row: any): DevEnvironment {
  return {
    id: row.env_id,
    name: row.name,
    type: row.type,
    status: row.status as EnvStatus,
    url: row.url || '',
    version: row.version || 'v1.0.0',
    lastDeploy: row.last_deploy || '-',
    uptime: row.uptime || '-',
    region: row.region || '',
    metrics: row.metrics || { cpu: 0, memory: 0, requests: '0/min', latency: '0ms' },
    services: row.services || [],
  };
}

export function useAmbientes() {
  const [environments, setEnvironments] = useState<DevEnvironment[]>(supabase ? [] : MOCK_ENVIRONMENTS);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('dev_environments')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data !== null) {
      setEnvironments(data.map(rowToEnv));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { environments, loading, refetch: load };
}
