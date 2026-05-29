import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Users, MousePointerClick, DollarSign, Target, ArrowUpRight, Facebook, Search, Link2, Plus, Zap, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

const trafficData = [
  { name: 'Seg', clicks: 400, leads: 24, spend: 120 },
  { name: 'Ter', clicks: 520, leads: 35, spend: 150 },
  { name: 'Qua', clicks: 350, leads: 18, spend: 100 },
  { name: 'Qui', clicks: 680, leads: 50, spend: 200 },
  { name: 'Sex', clicks: 800, leads: 65, spend: 250 },
  { name: 'Sáb', clicks: 950, leads: 82, spend: 300 },
  { name: 'Dom', clicks: 1200, leads: 110, spend: 400 },
];

export default function MarketingCampanhas() {
  const [metaConnected, setMetaConnected] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  return (
    <PageContainer
      title="Gestão de Campanhas (Tráfego)"
      subtitle="Acompanhe o ROI e performance dos seus anúncios Meta e Google."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`p-5 flex flex-col justify-between transition-all duration-500 ${metaConnected ? 'bg-gradient-to-br from-blue-600/20 to-[#111827] border-blue-500/30' : 'bg-[#111827] border-white/5 opacity-70 grayscale'}`}>
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
            <p className="text-xs text-slate-400">{metaConnected ? 'ID da Conta: 109283748291' : 'Nenhuma conta ativa'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {metaConnected ? 'Sincronizado há 5m' : 'Aguardando conexão'}
            </span>
            {metaConnected ? (
              <Button onClick={() => handleDisconnect('meta')} variant="ghost" size="sm" className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Desconectar</Button>
            ) : (
              <Button onClick={() => setMetaConnected(true)} variant="ghost" size="sm" className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5">Conectar</Button>
            )}
          </div>
        </Card>
        
        <Card className={`p-5 flex flex-col justify-between transition-all duration-500 ${googleConnected ? 'bg-gradient-to-br from-emerald-600/20 to-[#111827] border-emerald-500/30' : 'bg-[#111827] border-white/5 opacity-70 grayscale'}`}>
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
            <p className="text-xs text-slate-400">{googleConnected ? 'ID da Conta: 827-192-3847' : 'Nenhuma conta conectada'}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {googleConnected ? 'Sincronizado há 1m' : 'Aguardando conexão'}
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

        <Card className="p-5 bg-[#111827] border-white/5 border-dashed flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/5 transition-all">
           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
             <Plus className="w-6 h-6 text-slate-400" />
           </div>
           <h4 className="text-white font-bold mb-1">Nova Integração</h4>
           <p className="text-xs text-slate-400">TikTok, LinkedIn, Taboola...</p>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl text-sm justify-center">
        <Zap className="w-4 h-4 shrink-0" />
        <p><strong>Tracking Automático Ativo:</strong> Todos os leads capturados pelas Landing Pages estão associando a origem (UTMs) aos contratos reais gerados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
               <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-black text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1" /> +12%</span>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Investido</h4>
          <p className="text-3xl font-black text-white">R$ 1.520<span className="text-sm text-slate-500">,00</span></p>
        </Card>
        
        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Receita Estimada</h4>
          <p className="text-3xl font-black text-white">R$ 18.940</p>
        </Card>

        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
               <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">CPA Médio</h4>
          <p className="text-3xl font-black text-white">R$ 14<span className="text-sm text-slate-500">,80</span></p>
        </Card>

        <Card className="p-6 bg-[#111827] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
               <Users className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Leads Gerados</h4>
          <p className="text-3xl font-black text-white">384</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-[#111827] border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" /> Tendência de Leads vs Investimento
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1E293B', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff' }} name="Leads" />
                <Line yAxisId="right" type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#1E293B', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff' }} name="Gasto (R$)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-6 bg-[#111827] border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-blue-500" /> Volume de Cliques Semana
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Bar dataKey="clicks" fill="url(#colorClicks)" radius={[6, 6, 0, 0]} name="Cliques" maxBarSize={40} />
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-[#111827] border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
             <Target className="w-4 h-4 text-emerald-400" /> Campanhas Ativas
          </h3>
          <div className="flex bg-white/5 p-1 rounded-xl">
             <button className="px-3 py-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Ativas</button>
             <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-500">Pausadas</button>
             <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-500">Rascunhos</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Campanha</th>
                <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gastos</th>
                <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliques</th>
                <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Leads</th>
                <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Conversão 2026 - Master Class', platform: 'Meta Ads', spend: 'R$ 820,00', clicks: '4,280', leads: '152', cpa: 'R$ 5,39', status: 'Ativa', color: 'text-blue-400' },
                { name: 'Remarketing Institucional', platform: 'Google Search', spend: 'R$ 340,00', clicks: '840', leads: '42', cpa: 'R$ 8,09', status: 'Ativa', color: 'text-emerald-400' },
                { name: 'Vídeo Awareness - Junho', platform: 'Meta Ads', spend: 'R$ 150,00', clicks: '12,500', leads: '12', cpa: 'R$ 12,50', status: 'Pausada', color: 'text-slate-500' },
              ].map((campaign, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <p className="text-sm font-black text-white">{campaign.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{campaign.platform}</p>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                      campaign.status === 'Ativa' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/5 text-slate-500 border-white/5'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-6 text-xs text-white font-mono">{campaign.spend}</td>
                  <td className="p-6 text-xs text-slate-300 font-mono">{campaign.clicks}</td>
                  <td className="p-6 text-xs text-emerald-400 font-mono font-bold">{campaign.leads}</td>
                  <td className="p-6 text-right text-xs text-blue-400 font-mono font-black">{campaign.cpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
