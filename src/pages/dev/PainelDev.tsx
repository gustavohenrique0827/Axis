import React from 'react';
import {
  GitBranch, Bug, Rocket, Activity, Terminal,
  ArrowUpRight, Zap, Database, Server
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const velocityData: { sprint: string; pontos: number; bugs: number }[] = [];

const deployData: { dia: string; deploys: number }[] = [];

const recentActivity: { type: string; message: string; time: string; color: string; icon: React.ElementType }[] = [];

export default function PainelDev() {
  return (
    <PageContainer
      title="Painel Dev & Tecnologia"
      description="Visão geral da operação de desenvolvimento — sprints, deploys, issues e saúde dos ambientes."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Terminal className="w-4 h-4" /> Sprint Atual
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
            <Rocket className="w-4 h-4" /> Novo Deploy
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pontos no Sprint", value: "--", trend: "--", icon: Zap, color: "text-blue-400", bg: "bg-blue-600/10" },
            { label: "Issues em Aberto", value: "--", trend: "--", icon: Bug, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Deploys Hoje", value: "--", trend: "--", icon: Rocket, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Uptime Produção", value: "--", trend: "--", icon: Server, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.color}`}>
                  <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                </div>
              </div>
              <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-2">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Velocidade do Sprint */}
          <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Velocidade por Sprint
              </h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Últimos 6 Sprints</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="gPontos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="sprint" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="pontos" stroke="#2563EB" strokeWidth={2} fill="url(#gPontos)" name="Story Points" />
                <Area type="monotone" dataKey="bugs" stroke="#EF4444" strokeWidth={2} fill="url(#gBugs)" name="Bugs Abertos" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Deploys por Dia */}
          <Card className="p-8 bg-[#111827]/80 border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Deploys / Semana</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deployData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="dia" tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 700 }}
                />
                <Bar dataKey="deploys" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Deploys" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Atividade Recente */}
          <Card className="lg:col-span-2 bg-[#111827]/80 border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" /> Atividade Recente
              </h3>
              <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:underline">
                Ver tudo
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className={`p-2 rounded-xl bg-white/5 shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.message}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Status dos Ambientes */}
          <Card className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" /> Status dos Ambientes
            </h3>
            <div className="space-y-4">
              {[
                { name: "Produção", status: "Operacional", version: "v2.4.1", color: "bg-emerald-500" },
                { name: "Staging", status: "Operacional", version: "v2.4.2-rc1", color: "bg-emerald-500" },
                { name: "Desenvolvimento", status: "Em Build", version: "v2.5.0-dev", color: "bg-amber-500" },
                { name: "QA / Testes", status: "Operacional", version: "v2.4.2-qa", color: "bg-emerald-500" },
              ].map((env, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${env.color} animate-pulse`} />
                    <div>
                      <p className="text-xs font-black text-white">{env.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{env.version}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${env.status === 'Operacional' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {env.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
