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
        <Card className={`p-5 flex flex-col justify-between transition-all duration-500 ${metaConnected ? 'bg-gradient-to-br from-blue-600/20 to-[var(--color-surface-elevated)] border-blue-500/30' : 'bg-[var(--color-surface-elevated)] border-white/5 opacity-70 grayscale'}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metaConnected ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                 <Facebook className={`w-5 h-5 ${metaConnected ? 'text-blue-400' : 'text-slate-500'}`} />
              </div>
              {metaConnected ? (
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Conectado</span>
              ) : (
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">Desconectado</span>
              )}
            </div>
            <h4 className="text-white font-bold mb-1">Meta Ads (Facebook/Insta)</h4>
            <p className="text-xs text-slate-400">{metaConnected ? 'Conta conectada e sincronizando' : 'Nenhuma conta ativa'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {metaConnected ? 'Sincronizado' : 'Aguardando conexão'}
            </span>
            {metaConnected ? (
              <Button onClick={() => handleDisconnect('meta')} variant="ghost" size="sm" className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Desconectar</Button>
            ) : (
              <Button onClick={() => setMetaConnected(true)} variant="ghost" size="sm" className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5">Conectar</Button>
            )}
          </div>
        </Card>
        
        <Card className={`p-5 flex flex-col justify-between transition-all duration-500 ${googleConnected ? 'bg-gradient-to-br from-emerald-600/20 to-[var(--color-surface-elevated)] border-emerald-500/30' : 'bg-[var(--color-surface-elevated)] border-white/5 opacity-70 grayscale'}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${googleConnected ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                 <Search className={`w-5 h-5 ${googleConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              {googleConnected ? (
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Conectado</span>
              ) : (
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">Desconectado</span>
              )}
            </div>
            <h4 className="text-white font-bold mb-1">Google Ads</h4>
            <p className="text-xs text-slate-400">{googleConnected ? 'Conta conectada e sincronizando' : 'Nenhuma conta conectada'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {googleConnected ? 'Sincronizado' : 'Aguardando conexão'}
            </span>
            {googleConnected ? (
              <Button onClick={() => handleDisconnect('google')} variant="ghost" size="sm" className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Desconectar</Button>
            ) : (
              <Button 
                onClick={handleConnectGoogle} 
                disabled={isConnecting}
                size="sm" 
                className="h-7 text-[10px] font-black uppercase tracking-widest gap-2 bg-white text-slate-900 hover:bg-slate-200"
              >
                 <Link2 className="w-3 h-3" /> {isConnecting ? 'Conectando...' : 'Conectar'}
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-[var(--color-surface-elevated)] border-white/5 border-dashed flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/5 transition-all">
           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
             <Plus className="w-6 h-6 text-slate-400" />
           </div>
           <h4 className="text-white font-bold mb-1">Nova Integração</h4>
           <p className="text-xs text-slate-400">TikTok, LinkedIn, Taboola...</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl text-sm justify-center">
        <Zap className="w-4 h-4 shrink-0" />
        <p><strong>Dados em Tempo Real:</strong> Os KPIs abaixo são calculados a partir dos leads e lançamentos financeiros cadastrados no sistema.</p>
      </div>

      {/* Real KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Investido", value: fmt(totalSpent), icon: DollarSign, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20" },
          { label: "Receita Gerada", value: fmt(totalRevenue), icon: ArrowUpRight, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20" },
          { label: "CPA Médio", value: cpa > 0 ? fmt(cpa) : '—', icon: Target, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20" },
          { label: "Leads Gerados", value: totalLeads.toString(), icon: Users, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/20" },
        ].map((kpi, i) => (
          <Card key={i} className={`p-6 bg-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center border ${kpi.border}`}>
                 <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{kpi.label}</h4>
            <p className="text-3xl font-black text-white">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" /> Leads por Dia da Semana
          </h3>
          {totalLeads === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4 opacity-40">
              <Inbox className="w-8 h-8 text-slate-500" />
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum lead cadastrado ainda.</p>
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
        
        <Card className="p-6 bg-[var(--color-surface-elevated)] border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-blue-500" /> Volume de Leads (Bar)
          </h3>
          {totalLeads === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4 opacity-40">
              <Inbox className="w-8 h-8 text-slate-500" />
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Cadastre leads para ver o gráfico.</p>
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
      <Card className="bg-[var(--color-surface-elevated)] border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
             <Target className="w-4 h-4 text-emerald-400" /> Origens de Leads (Fonte)
          </h3>
        </div>
        {totalLeads === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <Inbox className="w-10 h-10 text-slate-500" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
              Nenhum lead cadastrado ainda.<br/>Cadastre leads com 'fonte' para ver as campanhas aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fonte</th>
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Leads</th>
                  <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fechados</th>
                  <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversão</th>
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
                          <p className="text-sm font-black text-white">{source}</p>
                        </td>
                        <td className="p-6 text-xs text-blue-400 font-mono font-bold">{data.leads}</td>
                        <td className="p-6 text-xs text-emerald-400 font-mono font-bold">{data.closed}</td>
                        <td className="p-6 text-right text-xs text-purple-400 font-mono font-black">
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
