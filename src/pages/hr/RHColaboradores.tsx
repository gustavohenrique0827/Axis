import React, { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import {
  Users, Search, PlusCircle, UserPlus,
  Mail, Calendar, MoreVertical, TrendingUp, ShieldCheck
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useData } from "../../contexts/DataContext";
import { useRHColaboradores } from "./hooks/useRHColaboradores";
import { SquadsTabContent } from "./components/SquadsTabContent";
import { NovoMembroModal } from "../../components/ui/NovoMembroModal";
import { toast } from "sonner";

export default function RHColaboradores() {
  const {
    squads,
    updateSquad,
    leads,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    isNewSquadOpen,
    setIsNewSquadOpen,
    newSquadName,
    setNewSquadName,
    newSquadMeta,
    setNewSquadMeta,
    newSquadBudget,
    setNewSquadBudget,
    newSquadFoco,
    setNewSquadFoco,
    oteBaseSalary,
    setOteBaseSalary,
    oteCommPercentage,
    setOteCommPercentage,
    oteVendasRealizadas,
    setOteVendasRealizadas,
    oteAtingimentoMeta,
    setOteAtingimentoMeta,
    handleCreateSquad,
    handleDeleteSquad,
    filtered,
    calcVariable,
    calcBonus,
    totalOTE
  } = useRHColaboradores();

  const { addColaborador } = useData();
  const [isMembroModalOpen, setIsMembroModalOpen] = useState(false);

  const handleSaveMembro = (data: any) => {
    addColaborador({ ...data, id: Date.now().toString(), status: "Ativo", dataAdmissao: new Date().toLocaleDateString('pt-BR'), desempenho: 0 });
    toast.success(`${data.nome} adicionado à equipe com sucesso!`);
  };

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
            <Button onClick={() => setIsMembroModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20">
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
            className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'membros'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            👥 Membros da Equipe ({filtered.length})
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'squads'
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
                { label: "Total de Colaboradores", value: filtered.length, icon: Users, color: "text-indigo-500" },
                { label: "Vendas & SDRs Ativos", value: "0", icon: UserPlus, color: "text-emerald-500" },
                { label: "Engajamento Médio", value: "0%", icon: TrendingUp, color: "text-blue-500" },
                { label: "Meta Geral Batida", value: "0%", icon: ShieldCheck, color: "text-rose-500" },
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
                    <Badge className={`${colab.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
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
          <SquadsTabContent
            squads={squads}
            leads={leads}
            handleDeleteSquad={handleDeleteSquad}
            updateSquad={updateSquad}
            oteBaseSalary={oteBaseSalary}
            setOteBaseSalary={setOteBaseSalary}
            oteCommPercentage={oteCommPercentage}
            setOteCommPercentage={setOteCommPercentage}
            oteVendasRealizadas={oteVendasRealizadas}
            setOteVendasRealizadas={setOteVendasRealizadas}
            oteAtingimentoMeta={oteAtingimentoMeta}
            setOteAtingimentoMeta={setOteAtingimentoMeta}
            calcVariable={calcVariable}
            calcBonus={calcBonus}
            totalOTE={totalOTE}
          />
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

      <NovoMembroModal
        isOpen={isMembroModalOpen}
        onClose={() => setIsMembroModalOpen(false)}
        onSave={handleSaveMembro}
      />

    </PageContainer>
  );
}
