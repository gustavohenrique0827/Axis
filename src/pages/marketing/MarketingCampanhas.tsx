import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Users, MousePointerClick, DollarSign, Target, ArrowUpRight, Facebook, Search, Link2, Plus, Zap, Inbox } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useData } from "../../contexts/DataContext";

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function MarketingCampanhas() {
  const { leads, financeEntries } = useData();
  const [metaConnected, setMetaConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Compute real KPIs from leads data
  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;

  // Revenue from paid financeEntries
  const totalRevenue = useMemo(() => 
    financeEntries.filter(f => f.type === 'Receber' && f.status === 'Pago').reduce((s, f) => s + f.value, 0),
  [financeEntries]);

  // Total spent (despesas pagas)
  const totalSpent = useMemo(() =>
    financeEntries.filter(f => f.type === 'Pagar' && f.status === 'Pago').reduce((s, f) => s + f.value, 0),
  [financeEntries]);

  const cpa = totalLeads > 0 ? totalSpent / totalLeads : 0;

  // Leads grouped by weekday for traffic chart
  const trafficData = useMemo(() => {
    return WEEKDAYS.map(day => {
      const dayLeads = leads.filter(l => {
        try {
          const d = new Date(l.date || '');
          return !isNaN(d.getTime()) && WEEKDAYS[d.getDay()] === day;
        } catch { return false; }
      });
      return { name: day, leads: dayLeads.length, spend: 0 };
    });
  }, [leads]);

  const handleConnectGoogle = () => {
    setIsConnecting(true);
    toast.promise(new Promise(res => setTimeout(res, 2000)), {
      loading: 'Conectando ao Google Ads API...',
      success: () => {
        setGoogleConnected(true);
        setIsConnecting(false);
        return 'Conta Google Ads conectada com sucesso!';
      },
      error: 'Erro na autenticação.',
    });
  };

  const handleDisconnect = (platform: string) => {
    if (platform === 'meta') setMetaConnected(false);
    if (platform === 'google') setGoogleConnected(false);
    toast.info(`Conta ${platform} desconectada.`);
  };

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  return (
    <PageContainer
      title="Gestão de Campanhas (Tráfego)"
      subtitle="Acompanhe o ROI e performance dos seus anúncios Meta e Google."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`p-5 flex flex-col justify-between ${!metaConnected ? 'opacity-70' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                 <Facebook className="w-5 h-5 text-slate-400" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${metaConnected ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>
                {metaConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <h4 className="text-white font-medium mb-1">Meta Ads (Facebook/Insta)</h4>
            <p className="text-xs text-slate-400">{metaConnected ? 'Conta conectada e sincronizando' : 'Nenhuma conta ativa'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {metaConnected ? 'Sincronizado' : 'Aguardando conexão'}
            </span>
            {metaConnected ? (
              <Button onClick={() => handleDisconnect('meta')} variant="ghost" size="sm">Desconectar</Button>
            ) : (
              <Button onClick={() => setMetaConnected(true)} variant="ghost" size="sm">Conectar</Button>
            )}
          </div>
        </Card>

        <Card className={`p-5 flex flex-col justify-between ${!googleConnected ? 'opacity-70' : ''}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                 <Search className="w-5 h-5 text-slate-400" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${googleConnected ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>
                {googleConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <h4 className="text-white font-medium mb-1">Google Ads</h4>
            <p className="text-xs text-slate-400">{googleConnected ? 'Conta conectada e sincronizando' : 'Nenhuma conta conectada'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {googleConnected ? 'Sincronizado' : 'Aguardando conexão'}
            </span>
            {googleConnected ? (
              <Button onClick={() => handleDisconnect('google')} variant="ghost" size="sm">Desconectar</Button>
            ) : (
              <Button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                size="sm"
                className="gap-2"
              >
                 <Link2 className="w-3 h-3" /> {isConnecting ? 'Conectando...' : 'Conectar'}
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5 border-dashed flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/5 transition-all">
           <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
             <Plus className="w-6 h-6 text-slate-400" />
           </div>
           <h4 className="text-white font-medium mb-1">Nova Integração</h4>
           <p className="text-xs text-slate-400">TikTok, LinkedIn, Taboola...</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 text-slate-400 p-3 rounded-xl text-sm justify-center">
        <Zap className="w-4 h-4 shrink-0" />
        <p><strong className="text-white font-medium">Dados em Tempo Real:</strong> Os KPIs abaixo são calculados a partir dos leads e lançamentos financeiros cadastrados no sistema.</p>
      </div>

      {/* Real KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Investido", value: fmt(totalSpent), icon: DollarSign },
          { label: "Receita Gerada", value: fmt(totalRevenue), icon: ArrowUpRight },
          { label: "CPA Médio", value: cpa > 0 ? fmt(cpa) : '—', icon: Target },
          { label: "Leads Gerados", value: totalLeads.toString(), icon: Users },
        ].map((kpi, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <kpi.icon className="w-4 h-4" />
              <span className="text-xs">{kpi.label}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" /> Leads por Dia da Semana
          </h3>
          {totalLeads === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4">
              <Inbox className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-500 text-center">Nenhum lead cadastrado ainda.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1E293B', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff' }} name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-slate-400" /> Volume de Leads (Bar)
          </h3>
          {totalLeads === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4">
              <Inbox className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-500 text-center">Cadastre leads para ver o gráfico.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="leads" fill="url(#colorLeads)" radius={[6, 6, 0, 0]} name="Leads" maxBarSize={40} />
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Campaigns table — empty state or summary from leads sources */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-sm text-slate-400 flex items-center gap-2">
             <Target className="w-4 h-4 text-slate-400" /> Origens de Leads (Fonte)
          </h3>
        </div>
        {totalLeads === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Inbox className="w-10 h-10 text-slate-500" />
            <p className="text-xs text-slate-500 text-center">
              Nenhum lead cadastrado ainda.<br/>Cadastre leads com 'fonte' para ver as campanhas aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-6 text-xs text-slate-500">Fonte</th>
                  <th className="text-left p-6 text-xs text-slate-500">Leads</th>
                  <th className="text-left p-6 text-xs text-slate-500">Fechados</th>
                  <th className="text-right p-6 text-xs text-slate-500">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(() => {
                  const bySource: Record<string, { leads: number; closed: number }> = {};
                  leads.forEach(l => {
                    const src = l.source || 'Orgânico';
                    if (!bySource[src]) bySource[src] = { leads: 0, closed: 0 };
                    bySource[src].leads++;
                    if (l.status === 'Fechado') bySource[src].closed++;
                  });
                  return Object.entries(bySource)
                    .sort((a, b) => b[1].leads - a[1].leads)
                    .map(([source, data], i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                          <p className="text-sm text-white">{source}</p>
                        </td>
                        <td className="p-6 text-xs text-slate-300 font-mono">{data.leads}</td>
                        <td className="p-6 text-xs text-slate-300 font-mono">{data.closed}</td>
                        <td className="p-6 text-right text-xs text-slate-300 font-mono">
                          {data.leads > 0 ? `${Math.round((data.closed / data.leads) * 100)}%` : '0%'}
                        </td>
                      </tr>
                    ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
