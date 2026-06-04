import React, { useState } from 'react';
import {
  Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Activity, Clock, Cpu, Database, Globe, Lock,
  ArrowUpRight, Zap, HardDrive, Wifi, MoreHorizontal,
  Rocket, GitBranch, Shield
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";

type EnvStatus = 'operacional' | 'degradado' | 'offline' | 'em deploy';

interface Environment {
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

const STATUS_CONFIG: Record<EnvStatus, { label: string; color: string; dot: string; badge: string }> = {
  operacional: { label: 'Operacional', color: 'text-emerald-400', dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  degradado: { label: 'Degradado', color: 'text-amber-400', dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  offline: { label: 'Offline', color: 'text-red-400', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
  'em deploy': { label: 'Em Deploy', color: 'text-blue-400', dot: 'bg-blue-500 animate-pulse', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

const ENVIRONMENTS: Environment[] = [
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

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-black text-white w-8 text-right">{value}%</span>
    </div>
  );
}

export default function Ambientes() {
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const handleRefresh = (id: string) => {
    setRefreshing(id);
    setTimeout(() => setRefreshing(null), 1800);
  };

  return (
    <PageContainer
      title="Ambientes"
      description="Status em tempo real dos ambientes de produção, staging, desenvolvimento e QA."
      breadcrumb={[{ label: "Dev & Tecnologia", path: "/app/dev/painel" }, { label: "Ambientes" }]}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">3/4 Operacionais</span>
          </div>
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
            <RefreshCw className="w-4 h-4" /> Atualizar Todos
          </Button>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-6 pb-10">
        {ENVIRONMENTS.map(env => {
          const cfg = STATUS_CONFIG[env.status];
          const isRefreshing = refreshing === env.id;

          return (
            <Card key={env.id} className={`bg-[#111827]/80 border-white/5 overflow-hidden ${env.status === 'em deploy' ? 'ring-1 ring-blue-500/20' : ''}`}>
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white/5`}>
                      <Server className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{env.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{env.type} · {env.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${cfg.badge}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => handleRefresh(env.id)}
                      className="text-slate-600 hover:text-white transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold">URL</p>
                    <p className="text-xs font-mono text-blue-400 mt-0.5">{env.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">Versão</p>
                    <p className="text-xs font-mono text-white mt-0.5">{env.version}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">Uptime</p>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">{env.uptime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">Deploy</p>
                    <p className="text-xs text-slate-300 mt-0.5">{env.lastDeploy}</p>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="p-6 border-b border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Métricas</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                    </div>
                    <MetricBar value={env.metrics.cpu} color={env.metrics.cpu > 80 ? 'bg-red-500' : env.metrics.cpu > 60 ? 'bg-amber-500' : 'bg-blue-500'} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><HardDrive className="w-3 h-3" /> Memória</span>
                    </div>
                    <MetricBar value={env.metrics.memory} color={env.metrics.memory > 80 ? 'bg-red-500' : env.metrics.memory > 60 ? 'bg-amber-500' : 'bg-emerald-500'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Wifi className="w-3 h-3" /> Requisições</span>
                    <span className="text-[10px] font-black text-white">{env.metrics.requests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Latência</span>
                    <span className={`text-[10px] font-black ${parseInt(env.metrics.latency) > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>{env.metrics.latency}</span>
                  </div>
                </div>
              </div>

              {/* Serviços */}
              <div className="p-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Serviços</p>
                <div className="grid grid-cols-2 gap-2">
                  {env.services.map(svc => {
                    const sc = STATUS_CONFIG[svc.status];
                    return (
                      <div key={svc.name} className="flex items-center gap-2 p-2 bg-white/[0.02] rounded-lg">
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} shrink-0`} />
                        <span className="text-[10px] font-bold text-slate-300 truncate">{svc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
