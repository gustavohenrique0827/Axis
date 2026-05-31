import React, { useState, useMemo } from "react";
import { Card } from "../../components/ui/card";
import { 
    Server, Users, HardDrive, Activity, Building2, Search, CheckCircle2, 
    AlertCircle, Download, Plus, Bell, Play, Pause, TerminalSquare, Shield, BarChart3, Settings, Database, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Check, X, ShieldAlert, Cpu, Inbox
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { PageContainer } from "../../components/PageContainer";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { ModuleConfigModal } from "./components/ModuleConfigModal";
import { useData } from "../../contexts/DataContext";

const COLORS = ['#94A3B8', '#06B6D4', '#2563EB'];

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-[#06B6D4] font-bold text-sm">
            R$ {(payload[0].value / 1000).toFixed(0)}k
          </p>
        </div>
      );
    }
    return null;
};

export default function AdminSaaS() {
  const [activeTab, setActiveTab] = useState('overview');
  const { getTenantModules, updateTenantModules } = useAuth();
  const { financeEntries } = useData();
  
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

  // Derive MRR Chart Data
  const revenueData = useMemo(() => {
    const months: Record<string, { name: string, mrr: number }> = {};
    const receivables = financeEntries.filter(f => f.type === 'Receber' && f.status === 'Pago');
    
    receivables.forEach(f => {
      try {
        const d = new Date(f.date || '');
        if (isNaN(d.getTime())) return;
        const month = d.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!months[month]) {
          months[month] = { name: month, mrr: 0 };
        }
        months[month].mrr += f.value;
      } catch {}
    });

    return Object.values(months);
  }, [financeEntries]);

  const globalMrr = revenueData.reduce((acc, curr) => acc + curr.mrr, 0);

  // Empty mock for plans, tenants, logs as they're not in the db currently
  const planDistribution: any[] = [];
  const tenantsData: any[] = [];
  const recentLogs: string[] = [];

  return (
    <PageContainer 
      title="Gestão de Infraestrutura Axis" 
      description="Controle centralizado de instâncias, faturamento e saúde global da plataforma."
      actions={
        <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 bg-[#111827] text-white hover:bg-white/5 h-10 px-4" disabled>
                <Bell className="w-4 h-4 mr-2" />
                Alertas
            </Button>
            <Button className="bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-lg shadow-cyan-500/20 h-10 px-4 font-bold" disabled>
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
                <Card className="p-5 border-[#06B6D4]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Building2 className="w-12 h-12 text-[#06B6D4]" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total de Empresas</span>
                </div>
                <h3 className="text-3xl font-extrabold text-white">0</h3>
                </Card>

                <Card className="p-5 border-[#2563EB]/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="w-12 h-12 text-[#2563EB]" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">MRR Global (SaaS)</span>
                </div>
                <h3 className="text-3xl font-extrabold text-[#2563EB]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(globalMrr)}
                </h3>
                </Card>

                <Card className="p-5 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Usuários Ativos (MAU)</span>
                </div>
                <h3 className="text-3xl font-extrabold text-emerald-400">0</h3>
                </Card>

                <Card className="p-5 border-purple-500/20 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group opacity-50">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HardDrive className="w-12 h-12 text-purple-400" />
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Storage System</span>
                </div>
                <h3 className="text-3xl font-extrabold text-purple-400">0 GB</h3>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#06B6D4]" /> Evolução de MRR Global
                        </h3>
                    </div>
                    {revenueData.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4 min-h-[250px]">
                        <Inbox className="w-12 h-12 text-slate-500" />
                        <span className="text-xs uppercase font-black tracking-widest text-slate-500">Sem histórico financeiro</span>
                      </div>
                    ) : (
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
                    )}
                </Card>

                <div className="space-y-6">
                    <Card className="p-5 bg-[#111827]/80 border-white/10 h-[calc(50%-12px)] flex flex-col">
                        <h4 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-blue-400" /> Distribuição de Planos
                        </h4>
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40 gap-4 min-h-[140px]">
                            <PieChartIcon className="w-10 h-10 text-slate-500" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Nenhum plano ativo</span>
                        </div>
                    </Card>

                    <Card className="p-5 bg-[#111827]/80 border-white/10 h-[calc(50%-12px)] overflow-hidden relative">
                        <h4 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> Instâncias Core
                        </h4>
                        <div className="space-y-3 relative z-10 opacity-50">
                            {[
                                { label: "API Gateway", load: "0%", status: "Idle", color: "bg-slate-500" },
                                { label: "PostgreSQL Master", load: "0%", status: "Idle", color: "bg-slate-500" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-white font-medium">{item.label}</p>
                                        <p className="text-[10px] text-slate-500">Load: {item.load}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`}></div>
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
                </div>
                <div className="p-10 flex flex-col items-center justify-center gap-4 opacity-40">
                  <Building2 className="w-12 h-12 text-slate-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Base de Tenants em construção</span>
                </div>
            </Card>
          </div>
      )}

      {activeTab === 'tenants' && (
          <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
                  <div className="relative w-full sm:w-96 opacity-50">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input disabled type="text" placeholder="Buscar tenant por ID, Nome ou Domínio..." className="w-full bg-[#111827] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none cursor-not-allowed" />
                  </div>
              </div>

              <div className="bg-[#111827]/80 rounded-xl border border-white/10 overflow-hidden min-h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                      <Server className="w-16 h-16 text-slate-500" />
                      <span className="text-sm font-black uppercase tracking-widest text-slate-500">Módulo Multi-Tenant Pendente</span>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
                  <Card className="p-6 bg-gradient-to-br from-[#0B1120] to-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">ARPU (Ticket Médio)</p>
                      <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
                  </Card>
                  <Card className="p-6 bg-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Churn Rate</p>
                      <h3 className="text-2xl font-bold text-white">0%</h3>
                  </Card>
                  <Card className="p-6 bg-[#111827] border-white/10">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">LTV Estimado</p>
                      <h3 className="text-2xl font-bold text-blue-400">R$ 0,00</h3>
                  </Card>
              </div>

              <Card className="p-5 bg-[#111827]/80 border-white/10">
                  <h3 className="font-semibold text-lg mb-6">Receita vs Churn</h3>
                  {revenueData.length === 0 ? (
                      <div className="h-[300px] w-full flex flex-col items-center justify-center gap-4 opacity-40">
                          <DollarSign className="w-12 h-12 text-slate-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Sem dados para projeção</span>
                      </div>
                  ) : (
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                  <CartesianGrid vertical={false} stroke="#1e293b" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10}/>
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`}/>
                                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
                                  <Bar dataKey="mrr" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={60} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  )}
              </Card>
          </div>
      )}

      {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex gap-2 opacity-50">
                  <Button className="bg-[#1E293B] text-white" disabled>
                      <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
              </div>
              <div className="bg-[#040810] border border-white/10 rounded-xl font-mono text-[11px] sm:text-[12px] p-4 sm:p-6 shadow-2xl overflow-hidden relative min-h-[400px]">
                  <div className="absolute top-0 left-0 w-full h-8 bg-[#0B1120] border-b border-white/5 flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                      <span className="text-[10px] text-slate-500 ml-2 font-sans tracking-widest">systemd-journal</span>
                  </div>
                  <div className="mt-6 space-y-1.5 opacity-90 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-white/10 flex flex-col items-center justify-center py-20 text-slate-600 font-bold uppercase tracking-widest text-[10px]">
                      Nenhum evento registrado.
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
