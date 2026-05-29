import React, { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { 
  Users, Search, Plus, Filter, UserPlus, 
  MapPin, Phone, Mail, Award, Clock,
  Calendar, Briefcase, MoreVertical, ChevronRight,
  TrendingUp, Download, ShieldCheck, Target, Layers, Settings, Brain, BarChart3, Wallet, PlusCircle, Sparkles
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { Colaborador, Squad } from "../../types";

const INITIAL_COLABORADORES: Colaborador[] = [
  {
    id: "1",
    nome: "Eduardo Meirelles",
    cargo: "Desenvolvedor Backend Sr",
    departamento: "Tecnologia",
    status: 'Ativo',
    dataAdmissao: "12 Mar 2021",
    email: "eduardo.m@empresa.com",
    desempenho: 94
  },
  {
    id: "2",
    nome: "Beatriz Oliveira",
    cargo: "Product Manager",
    departamento: "Produtos",
    status: 'Ativo',
    dataAdmissao: "05 Jan 2022",
    email: "beatriz.o@empresa.com",
    desempenho: 88
  },
  {
    id: "3",
    nome: "Rodrigo Santos",
    cargo: "UX/UI Designer",
    departamento: "Design",
    status: 'Férias',
    dataAdmissao: "22 Set 2020",
    email: "rodrigo.s@empresa.com",
    desempenho: 91
  },
  {
    id: "4",
    nome: "Mariana Costa",
    cargo: "Analista de RH",
    departamento: "Pessoas & Cultura",
    status: 'Ativo',
    dataAdmissao: "15 Mai 2023",
    email: "mariana.c@empresa.com",
    desempenho: 82
  },
  {
    id: "5",
    nome: "Roberto Ramos",
    cargo: "SDR Comercial Executivo",
    departamento: "Vendas / SDR",
    status: 'Ativo',
    dataAdmissao: "10 Ago 2022",
    email: "roberto.ramos@axis.com",
    desempenho: 96
  },
  {
    id: "6",
    nome: "Carlos Eduardo Mendes",
    cargo: "Closer Comercial Sênior",
    departamento: "Vendas / Closers",
    status: 'Ativo',
    dataAdmissao: "15 Jan 2022",
    email: "carlos.mendes@axis.com",
    desempenho: 92
  },
  {
    id: "7",
    nome: "Ana Silva",
    cargo: "Closer Closer Specialist",
    departamento: "Vendas / Closers",
    status: 'Ativo',
    dataAdmissao: "20 Mar 2023",
    email: "ana.silva@axis.com",
    desempenho: 89
  }
];

export default function RHColaboradores() {
  const { squads, addSquad, updateSquad, deleteSquad, leads } = useData();
  const [colaboradores] = useState<Colaborador[]>(INITIAL_COLABORADORES);

  const [activeTab, setActiveTab] = useState<'membros' | 'squads'>('membros');
  const [search, setSearch] = useState("");
  
  // Squad modal creation states
  const [isNewSquadOpen, setIsNewSquadOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadMeta, setNewSquadMeta] = useState("100000");
  const [newSquadBudget, setNewSquadBudget] = useState("10000");
  const [newSquadFoco, setNewSquadFoco] = useState("");

  // OTE Calculator states
  const [oteBaseSalary, setOteBaseSalary] = useState("3500");
  const [oteCommPercentage, setOteCommPercentage] = useState("5");
  const [oteVendasRealizadas, setOteVendasRealizadas] = useState("80000");
  const [oteAtingimentoMeta, setOteAtingimentoMeta] = useState("105");

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) {
      toast.error("Insira o nome do Squad comercial!");
      return;
    }
    const created = {
      nome: newSquadName,
      meta: parseFloat(newSquadMeta) || 100000,
      orcamentoMensal: parseFloat(newSquadBudget) || 10000,
      faturamentoAlcancado: 0,
      sdrCount: 1,
      closersCount: 1,
      focoComercial: newSquadFoco || "Prospecção Geral e Contatos Comerciais",
      membros: ["Roberto Ramos (SDR)", "Carlos Mendes (Closer)"]
    };
    addSquad(created);
    setIsNewSquadOpen(false);
    setNewSquadName("");
    setNewSquadFoco("");
  };

  const handleDeleteSquad = (id: string) => {
    deleteSquad(id);
  };

  const filtered = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo.toLowerCase().includes(search.toLowerCase())
  );

  // OTE Calculations: Base + (Vendas * %comissao) + Performance_Bonus (if meta > 100%, +20% base)
  const calcVariable = (parseFloat(oteVendasRealizadas) || 0) * ((parseFloat(oteCommPercentage) || 0) / 100);
  const calcBonus = (parseFloat(oteAtingimentoMeta) || 0) >= 100 ? (parseFloat(oteBaseSalary) || 0) * 0.25 : 0;
  const totalOTE = (parseFloat(oteBaseSalary) || 0) + calcVariable + calcBonus;

  return (
    <PageContainer
      title="Equipe & Squads Comerciais"
      description="Gerenciamento estratégico de colaboradores, composição de squads (SDR/Closers) e acompanhamento de OTE de vendas."
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'squads' ? (
            <Button 
              onClick={() => setIsNewSquadOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Criar Squad Comercial
            </Button>
          ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20">
              <UserPlus className="w-4 h-4 mr-2" /> Novo Registro
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-8">
        
        {/* Navigation Selector Tab */}
        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab('membros')}
            className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'membros' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Membros da Equipe ({colaboradores.length})
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'squads' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Squads Comerciais (SDRs & Closers)
          </button>
        </div>

        {activeTab === 'membros' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total de Colaboradores", value: colaboradores.length, icon: Users, color: "text-indigo-500" },
                { label: "Vendas & SDRs Ativos", value: "3", icon: UserPlus, color: "text-emerald-500" },
                { label: "Engajamento Médio", value: "94.5%", icon: TrendingUp, color: "text-blue-500" },
                { label: "Meta Geral Batida", value: "88%", icon: ShieldCheck, color: "text-rose-500" },
              ].map((stat, i) => (
                <Card key={i} className="p-6 bg-[#111827]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                  <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-[#111827]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, cargo ou departamento..." 
                  className="w-full bg-transparent border-white/5 pl-12 h-12 rounded-xl text-sm italic"
                />
              </div>
              <div className="flex items-center gap-3">
                {['Todos', 'Tecnologia', 'Produtos', 'Vendas'].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setSearch(cat === 'Todos' ? "" : cat)} 
                    className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((colab) => (
                <Card key={colab.id} className="group overflow-hidden bg-[#111827]/60 border-white/5 hover:border-indigo-500/30 transition-all p-0">
                   <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 flex items-end justify-center p-0">
                      <div className="w-20 h-20 rounded-2xl bg-[#0B1120] border-4 border-[#111827] -mb-10 flex items-center justify-center text-indigo-500">
                         <Users className="w-8 h-8 opacity-40" />
                      </div>
                   </div>

                   <div className="p-6 pt-12 text-center">
                      <Badge className={`${
                        colab.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : 
                        colab.status === 'Férias' ? 'bg-blue-500/10 text-blue-500' : 
                        'bg-rose-500/10 text-rose-500'
                      } font-black uppercase tracking-widest text-[8px] px-2.5 py-0.5 border-none mb-3`}>
                        {colab.status}
                      </Badge>
                      
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{colab.nome}</h3>
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">{colab.cargo}</div>

                      <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 mb-6">
                         <div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Departamento</div>
                            <div className="text-[10px] font-bold text-slate-300">{colab.departamento}</div>
                         </div>
                         <div>
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Desempenho</div>
                            <div className="text-[10px] font-bold text-emerald-500">{colab.desempenho}%</div>
                         </div>
                      </div>

                      <div className="space-y-3 text-left">
                         <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium truncate">{colab.email}</span>
                         </div>
                         <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">Admissão: {colab.dataAdmissao}</span>
                         </div>
                      </div>

                      <div className="mt-8 flex gap-2">
                         <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 rounded-xl font-black uppercase tracking-widest text-[9px]">
                            Ver Perfil
                         </Button>
                         <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5">
                            <MoreVertical className="w-4 h-4" />
                         </Button>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* SQUADS tab content */
          <div className="space-y-6">
            
            {/* Context Notice Banner */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-400" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Estrutura de Squads sob Medida</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Agrupe Closers e SDRs de alta performance, atribua metas regionais e automatize a passagem de bastão de leads de iPhones.</p>
                </div>
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 font-black uppercase tracking-widest text-[9px]">
                Nicho: Revendedores Apple Palmas / Educação
              </Badge>
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map((sq) => {
                const percent = Math.min(100, Math.round((sq.faturamentoAlcancado / sq.meta) * 100));
                
                // Calculate CAC: Monthly Budget / Number of Leads attributed to this squad (simulating by filtering leads by tenant or seller if available)
                // For simplicity, let's assume a random factor or mock active leads count
                const squadLeadsCount = leads.filter(l => sq.membros.some(m => l.seller && m.includes(l.seller))).length || 1;
                const cac = sq.orcamentoMensal / squadLeadsCount;

                return (
                  <Card key={sq.id} className="p-6 bg-[#111827]/70 border border-white/10 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                          <h3 className="font-bold text-white text-md tracking-tight uppercase">{sq.nome}</h3>
                        </div>
                        <Button 
                          onClick={() => handleDeleteSquad(sq.id)}
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-full p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                         <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Orçamento</span>
                            <span className="text-xs font-bold text-white tracking-tight">R$ {sq.orcamentoMensal.toLocaleString()}</span>
                         </div>
                         <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">CAC Estimado</span>
                            <span className="text-xs font-bold text-blue-400 tracking-tight italic">R$ {cac.toFixed(2)}</span>
                         </div>
                      </div>

                      <div className="text-[10px] text-slate-400 bg-white/5 p-3.5 rounded-2xl border border-white/5 mb-5 leading-normal italic font-medium">
                        "{sq.focoComercial}"
                      </div>

                      {/* Squad composition details */}
                      <div className="mb-5 space-y-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Membros Conectados</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sq.membros.map((m, idx) => (
                            <div key={idx} className="inline-flex items-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[8px] px-2.5 py-1">
                              {m}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meta Progress bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-black text-slate-500 uppercase tracking-widest">Meta de Faturamento</span>
                          <span className="font-extrabold text-blue-400">{percent}% atingido</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                          <span>Realizado: R$ {sq.faturamentoAlcancado.toLocaleString()}</span>
                          <span className="text-slate-400">Objetivo: R$ {sq.meta.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-black uppercase text-[8px]">SDRs: {sq.sdrCount}</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-black uppercase text-[8px]">Closers: {sq.closersCount}</Badge>
                      </div>
                      <button 
                        onClick={() => {
                          const value = Math.round(Math.random() * 25000);
                          updateSquad(sq.id, { faturamentoAlcancado: sq.faturamentoAlcancado + value });
                          toast.success(`+R$ ${value.toLocaleString()} injetados no faturamento de ${sq.nome}!`);
                        }}
                        className="text-[9px] font-black text-blue-500 hover:text-white hover:bg-blue-600 bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3 h-3" /> Simular Venda
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* OTE (On-Target Earnings) Real Time Calculator Section */}
            <Card className="p-6 sm:p-10 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Wallet className="w-40 h-40 text-white" />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Ferramenta Integrada de RH & Planejamento</span>
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-1">Calculadora de OTE & Comissões (SDR / Closer)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Simule o On-Target Earnings de corretores ou assessores da sua operação baseando-se nas metas comerciais recomendadas.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Salário Base Mensal (R$)</label>
                      <Input 
                        type="number"
                        value={oteBaseSalary}
                        onChange={(e) => setOteBaseSalary(e.target.value)}
                        className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Taxa de Comissão (% sobre vendas)</label>
                      <Input 
                        type="number"
                        value={oteCommPercentage}
                        onChange={(e) => setOteCommPercentage(e.target.value)}
                        className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Volume de Vendas Faturado (R$)</label>
                      <Input 
                        type="number"
                        value={oteVendasRealizadas}
                        onChange={(e) => setOteVendasRealizadas(e.target.value)}
                        className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Atingimento da Meta Squad (%)</label>
                      <Input 
                        type="number"
                        value={oteAtingimentoMeta}
                        onChange={(e) => setOteAtingimentoMeta(e.target.value)}
                        className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                      />
                      <span className="text-[8px] text-slate-500 font-bold block">Meta &gt;= 100% libera Bônus Superador de 25% do Base!</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {[
                      { l: "SDR Comercial", s: "2200", c: "2", v: "50000" },
                      { l: "Closer Closer", s: "4500", c: "5", v: "120000" },
                      { l: "Líder de Squad", s: "6000", c: "6.5", v: "180000" }
                    ].map((loader, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setOteBaseSalary(loader.s);
                          setOteCommPercentage(loader.c);
                          setOteVendasRealizadas(loader.v);
                          setOteAtingimentoMeta("100");
                          toast.info(`Simulador pré-carregado para: ${loader.l}`);
                        }}
                        className="p-2 py-2.5 bg-slate-900 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider text-center"
                      >
                        💼 {loader.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated OTE Outputs Card */}
                <div className="lg:col-span-5 p-6 bg-slate-950/80 border border-[#2563EB]/25 rounded-[2rem] flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#2563EB]">ESTRUTURA DE GANHOS ESTIMADOS</span>
                    
                    <div className="border-b border-white/5 pb-3">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">On-Target Earnings (OTE Total)</div>
                      <div className="text-3xl font-display font-black text-white italic mt-1 font-mono">
                        R$ {totalOTE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Fixo Mensal Garantido:</span>
                        <span className="font-semibold text-white">R$ {parseFloat(oteBaseSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Comissão Variável Estimada:</span>
                        <span className="font-semibold text-emerald-400">+ R$ {calcVariable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Acelerador de Alto Desempenho:</span>
                        <span className={`font-semibold ${calcBonus > 0 ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`}>
                          {calcBonus > 0 ? `+ R$ ${calcBonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Não Qualificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <Button 
                      onClick={() => {
                        toast.success(`Parâmetros de comissionamento de R$ ${totalOTE.toLocaleString()} salvos para o colaborador!`);
                      }}
                      className="w-full bg-[#2563EB] hover:bg-blue-600 font-black text-[9px] uppercase tracking-widest h-11 rounded-xl"
                    >
                      Aplicar Modelo Salarial
                    </Button>
                  </div>
                </div>

              </div>
            </Card>

          </div>
        )}

      </div>

      {/* NEW SQUAD FORM MODAL */}
      {isNewSquadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0B1120] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 overflow-hidden relative shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-md font-bold text-white uppercase tracking-widest">🚀 Novo Squad de Vendas</h3>
              <button 
                onClick={() => setIsNewSquadOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Squad</label>
                <Input 
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="Ex: Squad Apple Palmas Elite"
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meta Mensal (R$)</label>
                <Input 
                  type="number"
                  value={newSquadMeta}
                  onChange={(e) => setNewSquadMeta(e.target.value)}
                  placeholder="Ex: 300000"
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orçamento Mensal para CAC (R$)</label>
                <Input 
                  type="number"
                  value={newSquadBudget}
                  onChange={(e) => setNewSquadBudget(e.target.value)}
                  placeholder="Ex: 10000"
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Foco Comercial & Notas</label>
                <textarea 
                  value={newSquadFoco}
                  onChange={(e) => setNewSquadFoco(e.target.value)}
                  placeholder="Foco em revendedores de iPhones em Palmas, comissões aceleradas, etc."
                  className="w-full h-24 bg-white/5 border border-white/5 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none text-white italic leading-relaxed"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button"
                  onClick={() => setIsNewSquadOpen(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/5 h-11 font-black text-[9px] uppercase tracking-widest rounded-xl"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Lançar Squad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
