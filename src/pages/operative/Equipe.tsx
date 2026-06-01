import React from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Settings2, Users, ChevronDown, ChevronUp, BarChart3, Users2, History, LayoutDashboard, Target, TrendingUp } from "lucide-react";
import { NovoMembroModal } from "../../components/ui/NovoMembroModal";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEquipe, TeamMember } from "./hooks/useEquipe";
import { SquadsTab } from "./components/SquadsTab";
import { LogsTab } from "./components/LogsTab";
import { toast } from "sonner";

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
  const {
    activeTab,
    setActiveTab,
    memberSearch,
    setMemberSearch,
    isModalOpen,
    setIsModalOpen,
    newSquadExpanded,
    setNewSquadExpanded,
    newSquadData,
    setNewSquadData,
    expandedSquads,
    squads,
    setSquads,
    team,
    setTeam,
    logs,
    toggleSquad,
    filter,
    setFilter,
    currentPage,
    setCurrentPage,
    filteredLogs,
    filteredTeam,
    paginatedLogs,
    totalPages,
    moveMember
  } = useEquipe();

  const handleSaveMember = (data: any) => {
    const newMember: TeamMember = {
      name: data.nome,
      role: data.cargo,
      email: data.email,
      deals: 0,
      revenue: "R$ 0",
      status: "Ativo",
      squad: data.squad || "Sem squad"
    };
    setTeam((prev) => [newMember, ...prev]);
    toast.success("Membro adicionado à equipe com sucesso!");
    setIsModalOpen(false);
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
                  { label: "Efficiency Rate", val: "0%", color: "text-amber-500" },
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
                        value: 0,
                        leads: 0
                      }))}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} dy={10} />
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
            <SquadsTab
              squads={squads}
              team={team}
              expandedSquads={expandedSquads}
              toggleSquad={toggleSquad}
              moveMember={moveMember}
            />
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
            <LogsTab
              paginatedLogs={paginatedLogs}
              filteredLogs={filteredLogs}
              filter={filter}
              setFilter={setFilter}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </AnimatePresence>
      </main>

      <NovoMembroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMember}
        initialValue={null}
      />
    </div>
  );
}
