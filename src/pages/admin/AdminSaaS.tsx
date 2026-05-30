import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { 
    Server, Users, HardDrive, Activity, Building2, Search, CheckCircle2, 
    AlertCircle, Download, Plus, Bell, Play, Pause, TerminalSquare, Shield, BarChart3, Settings, Database, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Check, X, ShieldAlert, Cpu
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { PageContainer } from "../../components/PageContainer";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { revenueData, planDistribution, COLORS, tenantsData, recentLogs, CustomTooltip } from "./constants/saasData";
import { ModuleConfigModal } from "./components/ModuleConfigModal";

export default function AdminSaaS() {
  const [activeTab, setActiveTab] = useState('overview');
  const { getTenantModules, updateTenantModules } = useAuth();
  
  // Modals for module management
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [crmEnabled, setCrmEnabled] = useState(true);
  const [sdrEnabled, setSdrEnabled] = useState(false);
  const [advDashboardEnabled, setAdvDashboardEnabled] = useState(false);

  const handleOpenModules = (tenantName: string) => {
    setSelectedTenant(tenantName);
    const mods = getTenantModules(tenantName);
    setCrmEnabled(mods.crm);
    setSdrEnabled(mods.sdr);
    setAdvDashboardEnabled(mods.advDashboard);
  };

  const handleSaveModules = () => {
    if (selectedTenant) {
      updateTenantModules(selectedTenant, {
        crm: crmEnabled,
        sdr: sdrEnabled,
        advDashboard: advDashboardEnabled
      });
      toast.success(`Módulos do tenant "${selectedTenant}" atualizados com sucesso!`);
      setSelectedTenant(null);
    }
  };

  return (
    <PageContainer 
      title="Gestão de Infraestrutura Axis" 
      description="Controle centralizado de instâncias, faturamento e saúde global da plataforma."
      actions={
        <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 bg-[#111827] text-white hover:bg-white/5 h-10 px-4">
                <Bell className="w-4 h-4 mr-2" />
                Alertas
            </Button>
            <Button className="bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-lg shadow-cyan-500/20 h-10 px-4 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Novo Tenant
            </Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 mb-8 pb-2 overflow-x-auto scrollbar-none">
          {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'tenants', label: 'Tenants & Instâncias', icon: Server },
              { id: 'billing', label: 'Faturamento', icon: DollarSign },
              { id: 'logs', label: 'Logs do Sistema', icon: TerminalSquare },
          ].map((tab) => {
              const Icon = tab.icon;
              return (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id 
                              ? 'bg-[#06B6D4]/10 text-[#06B6D4]' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                  </button>
              );
          })}
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Global SaaS Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-[#06B6D4]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Building2 className="w-12 h-12 text-[#06B6D4]" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total de Empresas</span>
                </div>
                <h3 className="text-3xl font-extrabold text-white">542</h3>
                <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +12 este mês
                </p>
                </Card>

                <Card className="p-5 border-[#2563EB]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="w-12 h-12 text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">MRR Global (SaaS)</span>
                </div>
                <h3 className="text-3xl font-extrabold text-[#2563EB]">R$ 1.25M</h3>
                <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +R$ 50k vs Mai
                </p>
                </Card>

                <Card className="p-5 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Usuários Ativos (MAU)</span>
                </div>
                <h3 className="text-3xl font-extrabold text-emerald-400">8,450</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-500" /> 1,204 online agora
                </p>
                </Card>

                <Card className="p-5 border-purple-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HardDrive className="w-12 h-12 text-purple-400" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Storage System</span>
                </div>
                <h3 className="text-3xl font-extrabold text-purple-400">4.2 TB</h3>
                <p className="text-[10px] text-rose-400 font-bold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> 82% da cota global
                </p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#06B6D4]" /> Evolução de MRR
                        </h3>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Ver detalhes</Button>
                    </div>
                    <div className="flex-1 min-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
                                <CartesianGrid vertical={false} stroke="#1e293b" />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="mrr" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-5 bg-[#111827]/80 border-white/10 h-[calc(50%-12px)] flex flex-col">
                        <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-blue-400" /> Distribuição de Planos
                        </h4>
                        <div className="flex-1 flex items-center justify-center relative min-h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {planDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute right-0 flex flex-col gap-1 z-10 bg-black/40 backdrop-blur p-2 rounded-lg border border-white/5">
                                {planDistribution.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></span>
                                        <span className="text-[9px] text-slate-300 font-medium uppercase tracking-tighter">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 bg-[#111827]/80 border-white/10 h-[calc(50%-12px)] overflow-hidden relative">
                        <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> Instâncias Core
                        </h4>
                        <div className="space-y-3 relative z-10">
                            {[
                                { label: "API Gateway", load: "34%", status: "Healthy", color: "bg-emerald-500" },
                                { label: "PostgreSQL Master", load: "62%", status: "Healthy", color: "bg-emerald-500" },
                                { label: "Worker Nodes", load: "89%", status: "Warning", color: "bg-yellow-400" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white font-medium">{item.label}</p>
                                        <p className="text-[10px] text-slate-500">Load: {item.load}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`}></div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
            
            {/* Quick Tenants View */}
            <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B1120]/50">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#06B6D4]" /> Tenants Recentes
                    </h3>
                    <Button variant="ghost" size="sm" className="text-[#06B6D4] hover:text-cyan-400" onClick={() => setActiveTab('tenants')}>
                        Ver todos
                    </Button>
                </div>
                <div className="divide-y divide-white/5">
                    {tenantsData.slice(0, 4).map((tenant, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4 w-1/3">
                                <div className="w-9 h-9 rounded bg-[#1E293B] flex items-center justify-center font-mono text-[10px] text-slate-400 border border-white/5">
                                    {tenant.id}
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{tenant.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tenant.plan}</p>
                                </div>
                            </div>
                            <div className="w-1/4">
                                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Status</p>
                                <div className="flex items-center gap-1.5">
                                    {tenant.status === 'Healthy' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />}
                                    <span className={`text-[11px] font-medium ${tenant.status === 'Healthy' ? 'text-emerald-400' : 'text-yellow-400'}`}>{tenant.status}</span>
                                </div>
                            </div>
                            <div className="w-1/4 text-right hidden sm:block">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">MRR</p>
                                <p className="text-xs font-mono text-slate-200">{tenant.mrr}</p>
                            </div>
                            <div className="flex items-center justify-end w-1/6">
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Acessar</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
          </div>
      )}

      {activeTab === 'tenants' && (
          <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
                  <div className="relative w-full sm:w-96">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" placeholder="Buscar tenant por ID, Nome ou Domínio..." className="w-full bg-[#111827] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#06B6D4]" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                      <select className="bg-[#111827] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#06B6D4] w-full sm:w-auto outline-none">
                          <option value="all">Todos os Planos</option>
                          <option value="enterprise">Enterprise</option>
                          <option value="pro">Pro</option>
                          <option value="standard">Standard</option>
                      </select>
                  </div>
              </div>

              <div className="bg-[#111827]/80 rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-[#0B1120] text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                              <tr>
                                  <th className="px-6 py-4">Tenant</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Módulos Ativos</th>
                                  <th className="px-6 py-4">Usuários</th>
                                  <th className="px-6 py-4">Banco de Dados</th>
                                  <th className="px-6 py-4">MRR</th>
                                  <th className="px-6 py-4 text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {tenantsData.map((tenant, idx) => {
                                  const mods = getTenantModules(tenant.name);
                                  return (
                                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded bg-[#1E293B] flex items-center justify-center font-mono text-[10px] text-slate-400">
                                                      {tenant.id}
                                                  </div>
                                                  <div>
                                                      <p className="font-semibold text-white">{tenant.name}</p>
                                                      <p className="text-[10px] text-slate-500">{tenant.plan}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-1.5">
                                                  {tenant.status === 'Healthy' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : 
                                                   tenant.status === 'Suspended' ? <Pause className="w-3 h-3 text-rose-500" /> : <AlertCircle className="w-3 h-3 text-yellow-500" />}
                                                  <span className={`text-[11px] font-medium 
                                                      ${tenant.status === 'Healthy' ? 'text-emerald-500' : 
                                                        tenant.status === 'Suspended' ? 'text-rose-500' : 'text-yellow-500'}`
                                                  }>{tenant.status}</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex flex-wrap gap-1">
                                                  {mods.crm && (
                                                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded text-[9px] font-extrabold uppercase tracking-wide">CRM</span>
                                                  )}
                                                  {mods.sdr && (
                                                      <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/25 rounded text-[9px] font-extrabold uppercase tracking-wide">SDR</span>
                                                  )}
                                                  {mods.advDashboard && (
                                                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded text-[9px] font-extrabold uppercase tracking-wide">BI Avançado</span>
                                                  )}
                                                  {!mods.crm && !mods.sdr && !mods.advDashboard && (
                                                      <span className="text-slate-500 text-[10px]">Nenhum recurso liberado</span>
                                                  )}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 font-medium">{tenant.users}</td>
                                          <td className="px-6 py-4">
                                              <span className="font-mono text-[11px] text-slate-400">{tenant.dbSize}</span>
                                          </td>
                                          <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                                              {tenant.mrr}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 mr-2">Login SSO</Button>
                                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => handleOpenModules(tenant.name)}><Settings className="w-4 h-4"/></Button>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-[#0B1120] to-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">ARPU (Ticket Médio)</p>
                      <h3 className="text-2xl font-bold text-white">R$ 2.306,00</h3>
                      <p className="text-[11px] text-emerald-400 mt-2">+4.2% vs mês anterior</p>
                  </Card>
                  <Card className="p-6 bg-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Churn Rate</p>
                      <h3 className="text-2xl font-bold text-white">0.8%</h3>
                      <p className="text-[11px] text-emerald-400 mt-2">-0.2% vs mês anterior</p>
                  </Card>
                  <Card className="p-6 bg-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">LTV Estimado</p>
                      <h3 className="text-2xl font-bold text-blue-400">R$ 48.500,00</h3>
                      <p className="text-[11px] text-slate-400 mt-2">Baseado em vida útil de 21 meses</p>
                  </Card>
              </div>

              <Card className="p-5 bg-[#111827]/80 border-white/10">
                  <h3 className="font-semibold text-lg mb-6">Receita vs Churn (Q2 2026)</h3>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData.slice(2)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                              <CartesianGrid vertical={false} stroke="#1e293b" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10}/>
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`}/>
                              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
                              <Bar dataKey="mrr" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={60} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
      )}

      {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex gap-2">
                  <Button className="bg-[#1E293B] hover:bg-[#334155] text-white">
                      <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button variant="outline" className="border-white/10 text-slate-400">
                      Limpar Console
                  </Button>
              </div>
              <div className="bg-[#040810] border border-white/10 rounded-xl font-mono text-[11px] sm:text-[12px] p-4 sm:p-6 shadow-2xl overflow-hidden relative min-h-[400px]">
                  <div className="absolute top-0 left-0 w-full h-8 bg-[#0B1120] border-b border-white/5 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                      <span className="text-[10px] text-slate-500 ml-2 font-sans tracking-widest">systemd-journal</span>
                  </div>
                  <div className="mt-6 space-y-1.5 opacity-90 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-white/10">
                      {recentLogs.map((log, i) => (
                          <div key={i} className={`flex ${log.includes('ERROR') ? 'text-rose-400 font-bold' : log.includes('WARN') ? 'text-yellow-400' : 'text-slate-300'}`}>
                              <span className="mr-2 opacity-50">&gt;</span> {log}
                          </div>
                      ))}
                      <div className="text-emerald-400 flex items-center">
                          <span className="mr-2 opacity-50">&gt;</span> 
                          <span>Listening for new events</span>
                          <span className="w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* G-Tech Admin Modularity Config Modal */}
      {selectedTenant && (
          <ModuleConfigModal
              selectedTenant={selectedTenant}
              setSelectedTenant={setSelectedTenant}
              crmEnabled={crmEnabled}
              setCrmEnabled={setCrmEnabled}
              sdrEnabled={sdrEnabled}
              setSdrEnabled={setSdrEnabled}
              advDashboardEnabled={advDashboardEnabled}
              setAdvDashboardEnabled={setAdvDashboardEnabled}
              handleSaveModules={handleSaveModules}
          />
      )}
    </PageContainer>
  );
}
