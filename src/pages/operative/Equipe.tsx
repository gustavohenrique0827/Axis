import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Mail, Settings2, Users, ChevronDown, ChevronUp, BarChart3, Users2, History, LayoutDashboard, Target, TrendingUp } from "lucide-react";
import { ActionModal } from "../../components/ui/ActionModal";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  deals: number | string;
  revenue: string;
  status: string;
  squad: string;
}

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-white/10 text-white">
          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div>
          <h3 className="font-bold text-white group-hover:text-[#2563EB]">{member.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#2563EB] font-bold uppercase">{member.role}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] text-slate-400">{member.email}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] text-cyan-400 font-bold">{member.squad}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${member.status === 'Ativo' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-yellow-500/20 text-yellow-500'}`}>
            {member.status}
         </span>
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Settings2 className="w-4 h-4" /></Button>
      </div>
    </Card>
  );
}

export default function Equipe() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [memberSearch, setMemberSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [newSquadExpanded, setNewSquadExpanded] = useState(false);
  const [newSquadData, setNewSquadData] = useState({ name: "", leader: "" });
  const [expandedSquads, setExpandedSquads] = useState<string[]>([]);
  const [squads, setSquads] = useState<{name: string, leader: string}[]>([
    { name: "Squad Alpha", leader: "Carlos Eduardo Mendes" },
    { name: "Squad Beta", leader: "Juliana Costa" },
    { name: "Growth Team", leader: "N/A" }
  ]);
  const [team, setTeam] = useState<TeamMember[]>([
    { name: "Carlos Eduardo Mendes", role: "Vendedor Sênior", email: "carlos@g-tech.com", deals: 34, revenue: "R$ 450.000", status: "Ativo", squad: "Squad Alpha" },
    { name: "Ana Silva", role: "Vendedora Pleno", email: "ana@g-tech.com", deals: 28, revenue: "R$ 320.000", status: "Ativo", squad: "Squad Alpha" },
    { name: "Roberto Ramos", role: "Pré-Vendas (SDR)", email: "roberto@g-tech.com", deals: 89, revenue: "-", status: "Ocupado", squad: "Squad Beta" },
    { name: "Juliana Costa", role: "Gerente Comercial", email: "juliana@g-tech.com", deals: 0, revenue: "R$ 1.2M", status: "Ativo", squad: "Squad Beta" }
  ]);
  const [logs, setLogs] = useState<{name: string, from: string, to: string, date: string}[]>([
    {name: "Ana Silva", from: "Squad Beta", to: "Squad Alpha", date: "2026-05-20"}
  ]);

  const toggleSquad = (squadName: string) => {
    setExpandedSquads(prev => 
      prev.includes(squadName) ? prev.filter(n => n !== squadName) : [...prev, squadName]
    );
  };

  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredLogs = logs.filter(l => 
    l.name.toLowerCase().includes(filter.toLowerCase()) || 
    l.date.includes(filter)
  );

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.squad.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const moveMember = (name: string, newSquad: string) => {
    const member = team.find(m => m.name === name);
    if (!member || member.squad === newSquad) return;
    
    setLogs(prev => [{name, from: member.squad, to: newSquad, date: new Date().toISOString().split('T')[0]}, ...prev]);
    setTeam(prev => prev.map(m => m.name === name ? {...m, squad: newSquad} : m));
  };

  return (
    <div className="flex flex-col lg:flex-row h-full -m-4 lg:-m-8">
      {/* Sub-Sidebar Navigation */}
      <nav className="w-full lg:w-64 bg-[#0B1120] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col pt-4 lg:pt-6 shrink-0 z-20 lg:sticky lg:top-0 lg:h-[calc(100vh-80px)] print:hidden">
        <div className="px-4 lg:px-6 mb-2 lg:mb-4 pb-2 lg:pb-0 hidden lg:block">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gestão de Equipe</h2>
        </div>
        
        <div className="px-2 pb-2 lg:pb-0 space-y-0 lg:space-y-0.5 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible::-webkit-scrollbar { display: none; } shrink-0">
          {[
            { label: "Visão Geral", id: "visao-geral", icon: LayoutDashboard },
            { label: "Performance", id: "performance", icon: TrendingUp },
            { label: "Squads", id: "squads", icon: Users2 },
            { label: "Membros", id: "membros", icon: Users },
            { label: "Audit Logs", id: "logs", icon: History },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-fit lg:w-full flex shrink-0 items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? "bg-blue-600/10 text-white" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors ${activeTab === item.id ? "text-blue-500" : "text-slate-600 group-hover:text-slate-500"}`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-8 px-6 hidden lg:block">
           <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Ações Rápidas</h2>
           <div className="space-y-2">
              <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${newSquadExpanded ? 'border-white/10 bg-white/5' : 'border-white/5 bg-transparent'}`}>
                <button 
                  onClick={() => setNewSquadExpanded(!newSquadExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Squad</span>
                  </div>
                  {newSquadExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {newSquadExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3 pb-3 space-y-2"
                    >
                      <input 
                        placeholder="Nome da Squad" 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-white outline-none focus:border-blue-500 transition-colors"
                        value={newSquadData.name}
                        onChange={(e) => setNewSquadData({...newSquadData, name: e.target.value})}
                      />
                      <select 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-white outline-none focus:border-blue-500 transition-colors"
                        value={newSquadData.leader}
                        onChange={(e) => setNewSquadData({...newSquadData, leader: e.target.value})}
                      >
                         <option value="">Líder...</option>
                         {team.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                      <Button 
                        size="sm" 
                        className="w-full h-8 text-[11px] font-bold bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (newSquadData.name) {
                            setSquads([...squads, { name: newSquadData.name, leader: newSquadData.leader }]);
                            setNewSquadData({ name: "", leader: "" });
                            setNewSquadExpanded(false);
                          }
                        }}
                      >
                        Confirmar
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </div>
      </nav>

      <main className="flex-1 min-w-0 p-10 pb-24 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === "visao-geral" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-10"
            >
              <div className="flex items-end justify-between">
                <div>
                  <div className="p-2 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                    <LayoutDashboard className="w-5 h-5 text-blue-500" />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter text-white">Equipe & Estrutura</h1>
                  <p className="text-sm text-slate-400 mt-2 max-w-md">Gerencie capital humano, squads de vendas e audite mudanças de hierarquia institucional.</p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setIsModalOpen(true)} className="gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 font-bold rounded-2xl">
                    <Plus className="w-5 h-5" /> Admitir Membro
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Membros Ativos", val: team.length, color: "text-blue-500" },
                  { label: "Squads Operantes", val: squads.length, color: "text-cyan-500" },
                  { label: "Líderes Alocados", val: squads.filter(s => s.leader).length, color: "text-emerald-500" },
                  { label: "Efficiency Rate", val: "94.2%", color: "text-amber-500" },
                ].map((stat, i) => (
                  <Card key={i} className="p-6 bg-white/[0.02] border-white/5 backdrop-blur-3xl hover:bg-white/[0.04] transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                    <div className={`text-3xl font-black mt-2 ${stat.color} tracking-tighter`}>{stat.val}</div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="p-8 bg-[#111827]/30 border-white/5 col-span-2">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-white tracking-tight">Densidade Populacional por Squad</h3>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500">Média: {(team.length / squads.length).toFixed(1)} / squad</div>
                   </div>
                   <div className="grid gap-6">
                      {squads.map(s => (
                        <div key={s.name} className="space-y-2 group">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0)] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all" />
                                 <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{s.name}</span>
                              </div>
                              <span className="text-xs font-black text-white">{team.filter(m => m.squad === s.name).length}</span>
                           </div>
                           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(team.filter(m => m.squad === s.name).length / team.length) * 100}%` }}
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>

                <Card className="p-8 bg-[#111827]/30 border-white/5">
                   <h3 className="text-lg font-black text-white tracking-tight mb-8">Fluxo Institucional</h3>
                   <div className="space-y-6">
                      {logs.slice(0, 4).map((l, i) => (
                        <div key={i} className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
                           <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#111827] border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
                           <div className="text-xs">
                              <span className="text-white font-black">{l.name}</span>
                              <span className="text-slate-500 mx-1.5 ml-2 mr-2">transferido para</span>
                              <span className="text-blue-400 font-bold bg-blue-400/5 px-2 py-0.5 rounded-lg border border-blue-400/10">{l.to}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                   {logs.length > 4 && (
                     <button onClick={() => setActiveTab("logs")} className="w-full mt-6 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white border-t border-white/5 transition-all">Ver Histórico Completo →</button>
                   )}
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Ranking & Performance</h2>
                  <p className="text-sm text-slate-400 mt-1">Análise volumétrica de conversão e receita por células.</p>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-xl">
                   <button className="px-4 py-1.5 text-[10px] font-bold text-white bg-white/10 rounded-lg shadow-inner">Mensal</button>
                   <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300">Trimestral</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-8 bg-[#111827]/40 border-white/5 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-32 h-32 text-blue-500" />
                  </div>
                  <h3 className="text-md font-black text-white mb-8 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/20">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                    </div>
                    Receita Gerada (Total kR$)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={squads.map(s => ({
                        name: s.name,
                        value: Math.floor(Math.random() * 800) + 200,
                        leads: Math.floor(Math.random() * 60) + 20
                      }))}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={9} fontVariant="bold" axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip 
                           cursor={{fill: '#ffffff05'}}
                           contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                           itemStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '11px' }}
                           labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', marginBottom: '8px' }}
                        />
                        <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-8 bg-[#111827]/40 border-white/5 backdrop-blur-xl group">
                  <h3 className="text-md font-black text-white mb-8 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20">
                      <Target className="w-4 h-4 text-emerald-400" />
                    </div>
                    Top Performers (Membro)
                  </h3>
                  <div className="space-y-5">
                    {team.sort((a,b) => b.deals - a.deals).slice(0, 5).map((m, i) => (
                      <div key={m.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white/5">
                              {i + 1}
                           </div>
                           <div>
                              <div className="text-xs font-black text-white">{m.name}</div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{m.squad}</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-black text-emerald-500">{m.deals} leads</div>
                           <div className="text-[9px] text-slate-600 font-bold">FECHADOS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "squads" && (
            <motion.div
              key="squads"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Gestão de Squads</h2>
                <p className="text-sm text-slate-400 mt-2">Células dinâmicas de conversão e atendimento especializado.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {squads.map(squad => {
                  const members = team.filter(m => m.squad === squad.name);
                  const isExpanded = expandedSquads.includes(squad.name);
                  return (
                    <div key={squad.name} className={`bg-[#111827]/40 border rounded-3xl overflow-hidden transition-all duration-500 ${isExpanded ? 'border-blue-500/20 shadow-2xl shadow-blue-500/5' : 'border-white/5'}`}>
                      <button 
                        className={`w-full flex items-center justify-between p-6 transition-all ${isExpanded ? 'bg-blue-600/[0.03]' : 'hover:bg-white/[0.02]'}`}
                        onClick={() => toggleSquad(squad.name)}
                      >
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 rotate-0' : 'bg-slate-800 text-slate-600 border border-white/5 rotate-[-10deg]'}`}>
                              {squad.name[0]}
                           </div>
                           <div className="text-left">
                              <span className="text-xl font-black text-white block tracking-tight">{squad.name}</span>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] flex items-center gap-1.5"><Users2 className="w-3 h-3"/> {members.length} membros</span>
                                <span className="text-slate-700">&bull;</span>
                                <span className="text-[10px] text-blue-500 opacity-80 uppercase font-black tracking-[0.15em] flex items-center gap-1.5"><Target className="w-3 h-3"/> {members.reduce((acc, curr) => acc + curr.deals, 0)} conversões</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right hidden sm:block">
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Squad Lead</span>
                              <span className="text-xs text-white font-bold">{squad.leader}</span>
                           </div>
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-blue-600/10 text-blue-500' : ''}`}>
                             <ChevronDown className="w-5 h-5" />
                           </div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="border-t border-white/5"
                          >
                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                              <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Composição Atual</h4>
                                <div className="space-y-2">
                                  {members.map(m => (
                                    <div key={m.name} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                                            {m.name.split(' ').map(n=>n[0]).join('')}
                                          </div>
                                          <div>
                                             <div className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">{m.name}</div>
                                             <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{m.role}</div>
                                          </div>
                                       </div>
                                       <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-white/10"><Settings2 className="w-4 h-4 text-slate-500" /></Button>
                                    </div>
                                  ))}
                                  {members.length === 0 && (
                                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                                       <Users className="w-8 h-8 text-slate-700 mb-2" />
                                       <span className="text-xs text-slate-600 font-bold">Nenhum membro alocado</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                                  Reorganização Operacional
                                  <span className="text-[9px] lowercase font-medium text-slate-600">Mover membros de outras squads</span>
                                </h4>
                                <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                                   <select 
                                     className="w-full bg-[#0B1120] text-xs font-bold border border-white/10 p-3 rounded-2xl text-white outline-none focus:border-blue-500 transition-all appearance-none"
                                     onChange={(e) => {
                                       const name = e.target.value;
                                       if (name && name !== 'Selecionar colaborador...') moveMember(name, squad.name);
                                     }}
                                   >
                                     <option value="">Selecionar colaborador...</option>
                                     {team.filter(m => m.squad !== squad.name).map(m => m.name).map(n => <option key={n} value={n}>{n}</option>)}
                                   </select>
                                   <p className="text-[10px] text-slate-500 leading-relaxed italic px-2">Ao mover um colaborador, a alteração será imediatamente refletida nos KPIs da squad e registrada no log de auditoria global.</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "membros" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Membros do Time</h2>
                  <p className="text-sm text-slate-400 mt-1">Visibilidade total de hierarquia e acessos.</p>
                </div>
                <div className="flex gap-4">
                   <div className="relative group">
                     <BarChart3 className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                     <input 
                       placeholder="Filtrar por nome, cargo ou squad..."
                       className="bg-[#111827]/40 border border-white/5 pl-11 pr-6 py-3 rounded-2xl text-xs text-white outline-none focus:border-blue-500/50 w-80 transition-all shadow-2xl"
                       value={memberSearch}
                       onChange={(e) => setMemberSearch(e.target.value)}
                     />
                   </div>
                   <Button onClick={() => setIsModalOpen(true)} className="gap-2 h-12 bg-blue-600 hover:bg-blue-700 font-bold px-6 rounded-2xl shadow-xl shadow-blue-600/20">
                     <Plus className="w-5 h-5" /> Adicionar
                   </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredTeam.map((member, i) => (
                  <TeamMemberCard key={i} member={member} />
                ))}
                {filteredTeam.length === 0 && (
                   <div className="py-24 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4">
                         <BarChart3 className="w-8 h-8 text-slate-700" />
                      </div>
                      <h3 className="text-white font-black">Nenhum colaborador encontrado</h3>
                      <p className="text-xs text-slate-500 mt-1">Refine seus termos de busca ou filtros.</p>
                   </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Logs de Auditoria</h2>
                <p className="text-sm text-slate-400 mt-1">Rastreabilidade completa de governança e movimentações de squad.</p>
              </div>

              <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl overflow-hidden rounded-3xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Histórico Governamental</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Visualização de mudanças globais de organização.</p>
                  </div>
                  <div className="relative">
                    <input 
                      placeholder="Pesquisar logs..." 
                      className="bg-black/20 text-xs border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-blue-500 w-64 transition-all"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                    <History className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-400">
                    <thead className="text-slate-500 uppercase font-black tracking-[0.2em] bg-white/[0.02]">
                      <tr>
                        <th className="px-8 py-5">Data da Ocorrência</th>
                        <th className="px-8 py-5">Participante</th>
                        <th className="px-8 py-5">Origem (From)</th>
                        <th className="px-8 py-5">Destino (To)</th>
                        <th className="px-8 py-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {paginatedLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5 text-slate-500 font-mono scale-95 group-hover:scale-100 transition-transform origin-left">{new Date(log.date).toLocaleDateString("pt-BR")}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                               <span className="text-white font-black">{log.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-500 border border-white/5">{log.from}</span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-blue-400 font-black">
                                <span className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 italic">{log.to}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10 tracking-widest">VALIDADO</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-8 flex justify-between items-center border-t border-white/5">
                   <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Auditando {filteredLogs.length} incidentes encontrados</div>
                   <div className="flex items-center gap-4">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="border-white/5 bg-white/5 text-white disabled:opacity-20 rounded-xl h-10 px-6 font-black scale-95 hover:scale-100 transition-all"
                       disabled={currentPage === 1} 
                       onClick={() => setCurrentPage(p => p - 1)}
                     >
                       Anterior
                     </Button>
                     <span className="text-xs text-slate-500 font-mono tracking-tighter">
                       <span className="text-white">{currentPage}</span> / {totalPages || 1}
                     </span>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="border-white/5 bg-white/5 text-white disabled:opacity-20 rounded-xl h-10 px-6 font-black scale-95 hover:scale-100 transition-all"
                       disabled={currentPage === totalPages || totalPages === 0} 
                       onClick={() => setCurrentPage(p => p + 1)}
                     >
                       Próxima
                     </Button>
                   </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Membro"
        fields={[
          { name: "nome", label: "Nome Completo", type: "text", required: true },
          { name: "email", label: "E-mail Corporativo", type: "email", required: true },
          { name: "cargo", label: "Cargo / Papel", type: "select", options: ["Pré-Vendas (SDR)", "Vendedor Externo", "Vendedor Interno", "Gerente Comercial", "Administrador"] },
          { name: "squad", label: "Squad", type: "select", options: squads.map(s => s.name) }
        ]}
      />
    </div>
  );
}
