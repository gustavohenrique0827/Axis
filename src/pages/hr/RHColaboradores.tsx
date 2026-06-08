import { useRef, useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import {
  Users, Search, PlusCircle, UserPlus,
  Mail, Calendar, MoreVertical, TrendingUp, ShieldCheck,
  X, UserX, Coffee, Plane, Pencil, ImagePlus
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useData } from "../../contexts/DataContext";
import { useRHColaboradores } from "./hooks/useRHColaboradores";
import { SquadsTabContent } from "./components/SquadsTabContent";
import { NovoMembroModal } from "../../components/ui/NovoMembroModal";
import { EditarColabModal } from "../../components/ui/EditarColabModal";
import { supabase, hashPassword } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

export default function RHColaboradores() {
  const {
    squads,
    colaboradores,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    isNewSquadOpen,
    setIsNewSquadOpen,
    newSquadName,
    setNewSquadName,
    newSquadDepartamento,
    setNewSquadDepartamento,
    newSquadFoco,
    setNewSquadFoco,
    newSquadCor,
    setNewSquadCor,
    newSquadLogo,
    setNewSquadLogo,
    newSquadLeader,
    setNewSquadLeader,
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

  const { addColaborador, updateColaborador, deleteColaborador } = useData();
  const { user } = useAuth();
  const [isMembroModalOpen, setIsMembroModalOpen] = useState(false);
  const [perfilColab, setPerfilColab] = useState<any | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editingColab, setEditingColab] = useState<any | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSaveMembro = async (data: any) => {
    if (!supabase) {
      toast.error("Supabase não configurado.");
      return;
    }

    const dataAdmissao = new Date().toLocaleDateString('pt-BR');

    // Busca o tenant pelo nome do usuário logado
    const { data: tenantRow, error: tenantErr } = await supabase
      .from("tenants")
      .select("id")
      .eq("name", user?.tenantName || "")
      .maybeSingle();

    if (tenantErr) {
      console.error("[RH] Erro ao buscar tenant:", tenantErr.message);
      toast.error("Erro ao buscar dados do tenant.");
      return;
    }

    if (!tenantRow?.id) {
      console.error("[RH] Tenant não encontrado para:", user?.tenantName);
      toast.error("Tenant não encontrado. Verifique o login.");
      return;
    }

    // 1. Cria o usuário de login
    const { data: newUser, error: userErr } = await supabase
      .from("users")
      .insert({
        tenant_id: tenantRow.id,
        name: data.nome,
        email: data.email,
        password_hash: hashPassword(data.senha || "123456"),
        role: data.cargo,
        is_master: false,
        active: true
      })
      .select("id")
      .maybeSingle();

    if (userErr) {
      console.error("[RH] Erro ao criar usuário:", userErr.message);
      toast.error(`Erro ao criar login: ${userErr.message}`);
      return;
    }

    // 2. Cria o colaborador vinculado ao usuário e ao tenant
    const newColab = {
      id: Date.now().toString(),
      nome: data.nome,
      email: data.email,
      phone: data.phone || "",
      cargo: data.cargo,
      departamento: data.departamento,
      squad: data.squad || "",
      status: "Ativo",
      dataAdmissao,
      desempenho: 0,
      tenant_id: tenantRow.id,
      user_id: newUser?.id ?? null
    };

    // addColaborador já faz insert no banco + atualiza estado local
    addColaborador(newColab);
    toast.success(`${data.nome} adicionado à equipe com sucesso!`);
  };

  const handleChangeStatus = (colab: any, novoStatus: string) => {
    updateColaborador(colab.id, { status: novoStatus });
    setMenuOpenId(null);
    toast.success(`Status de ${colab.nome} alterado para ${novoStatus}.`);
  };

  const handleDesligar = (colab: any) => {
    deleteColaborador(colab.id);
    setMenuOpenId(null);
    toast.success(`${colab.nome} foi desligado da equipe.`);
  };

  return (
    <PageContainer
      title="Equipe & Squads"
      description="Gerencie colaboradores, organize squads por área e acompanhe metas e desempenho da equipe."
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'squads' ? (
            <Button
              onClick={() => setIsNewSquadOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Criar Squad
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
            🎯 Squads da Empresa
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
                      <Button
                        onClick={() => setPerfilColab(colab)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 rounded-xl font-black uppercase tracking-widest text-[9px]"
                      >
                        Ver Perfil
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingColab(colab)}
                        className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 border border-white/5"
                        title="Editar perfil"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <div className="relative" ref={menuOpenId === colab.id ? menuRef : null}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setMenuOpenId(menuOpenId === colab.id ? null : colab.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {menuOpenId === colab.id && (
                          <div className="absolute right-0 bottom-12 z-50 w-48 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            <button
                              onClick={() => handleChangeStatus(colab, 'Férias')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-blue-400 transition-colors text-left"
                            >
                              <Plane className="w-3.5 h-3.5" /> Marcar como Férias
                            </button>
                            <button
                              onClick={() => handleChangeStatus(colab, 'Afastado')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-amber-400 transition-colors text-left"
                            >
                              <Coffee className="w-3.5 h-3.5" /> Marcar como Afastado
                            </button>
                            <button
                              onClick={() => handleChangeStatus(colab, 'Ativo')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-emerald-400 transition-colors text-left"
                            >
                              <Users className="w-3.5 h-3.5" /> Marcar como Ativo
                            </button>
                            <div className="border-t border-white/5" />
                            <button
                              onClick={() => handleDesligar(colab)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                            >
                              <UserX className="w-3.5 h-3.5" /> Desligar Colaborador
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <SquadsTabContent
            squads={squads}
            handleDeleteSquad={handleDeleteSquad}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewSquadOpen(false)}>
          <div className="w-full max-w-xl bg-[#0B1120] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Header with squad color preview */}
            <div
              className="px-8 pt-8 pb-5 border-b border-white/5 flex items-center justify-between"
              style={{ borderLeft: `4px solid ${newSquadCor}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${newSquadCor}20`, border: `1px solid ${newSquadCor}40` }}
                >
                  🎯
                </div>
                <div>
                  <div className="text-base font-black text-white uppercase tracking-tight">Novo Squad</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Crie um time para qualquer área da empresa</div>
                </div>
              </div>
              <button
                onClick={() => setIsNewSquadOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSquad} className="px-8 py-6 space-y-5">
              {/* Nome + Departamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do Squad</label>
                  <Input
                    value={newSquadName}
                    onChange={e => setNewSquadName(e.target.value)}
                    placeholder="Ex: Squad Design, Squad Devs..."
                    className="bg-white/5 border-white/5 h-11 text-sm rounded-xl text-white placeholder:text-slate-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Departamento</label>
                  <select
                    value={newSquadDepartamento}
                    onChange={e => setNewSquadDepartamento(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 h-11 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Vendas">Vendas</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sucesso do Cliente">Sucesso do Cliente</option>
                    <option value="Produto">Produto</option>
                    <option value="Design">Design</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="RH">RH</option>
                    <option value="Operações">Operações</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              {/* Cor de identificação */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cor de Identificação</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#64748b"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSquadCor(c)}
                      className="w-8 h-8 rounded-xl transition-all"
                      style={{
                        backgroundColor: c,
                        outline: newSquadCor === c ? `3px solid white` : "3px solid transparent",
                        outlineOffset: "2px",
                        transform: newSquadCor === c ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                  <label
                    className="w-8 h-8 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-all overflow-hidden"
                    title="Cor personalizada"
                  >
                    <input
                      type="color"
                      value={newSquadCor}
                      onChange={e => setNewSquadCor(e.target.value)}
                      className="opacity-0 absolute w-0 h-0"
                    />
                    <span className="text-slate-400 text-[10px] font-black">+</span>
                  </label>
                </div>
              </div>

              {/* Gestor do Squad */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gestor do Squad</label>
                <select
                  value={newSquadLeader}
                  onChange={e => setNewSquadLeader(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 h-11 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="">Sem gestor definido</option>
                  {colaboradores.map((c: any) => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Emblema / Logo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Emblema / Logo <span className="text-slate-600 normal-case font-normal">(opcional)</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/40 transition-all group">
                  {newSquadLogo ? (
                    <img src={newSquadLogo} className="w-12 h-12 rounded-xl object-cover" alt="logo" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                      <ImagePlus className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                      {newSquadLogo ? "Trocar imagem" : "Carregar imagem"}
                    </p>
                    <p className="text-[11px] text-slate-500">JPG, PNG ou GIF até 2MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 2MB"); return; }
                      const reader = new FileReader();
                      reader.onload = ev => setNewSquadLogo(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição & Objetivo</label>
                <textarea
                  value={newSquadFoco}
                  onChange={e => setNewSquadFoco(e.target.value)}
                  placeholder="Descreva o objetivo, foco ou observações deste squad..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none text-white placeholder:text-slate-600 resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setIsNewSquadOpen(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5 h-11 font-black text-[9px] uppercase tracking-widest rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg"
                  style={{ backgroundColor: newSquadCor, boxShadow: `0 8px 24px ${newSquadCor}40` }}
                >
                  Criar Squad
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

      <EditarColabModal
        colab={editingColab}
        onClose={() => setEditingColab(null)}
        onSave={(id, updates) => {
          updateColaborador(id, updates);
          toast.success(`${updates.nome} atualizado com sucesso!`);
        }}
      />

      {/* MODAL VER PERFIL */}
      {perfilColab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPerfilColab(null)}>
          <div className="w-full max-w-md bg-[#0B1120] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-28 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 relative flex items-end justify-center">
              <button onClick={() => setPerfilColab(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="w-20 h-20 rounded-2xl bg-[#0B1120] border-4 border-[#0B1120] -mb-10 flex items-center justify-center text-indigo-500">
                <Users className="w-8 h-8 opacity-40" />
              </div>
            </div>
            <div className="px-8 pt-14 pb-8 text-center">
              <Badge className={`${perfilColab.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : perfilColab.status === 'Férias' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'} font-black uppercase tracking-widest text-[8px] px-3 py-1 border-none mb-3`}>
                {perfilColab.status}
              </Badge>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{perfilColab.nome}</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{perfilColab.cargo}</p>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-5 mt-6 mb-6 text-left">
                <div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Departamento</div>
                  <div className="text-sm font-bold text-slate-200">{perfilColab.departamento || "—"}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Desempenho</div>
                  <div className="text-sm font-bold text-emerald-400">{perfilColab.desempenho ?? 0}%</div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium truncate">{perfilColab.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">Admissão: {perfilColab.dataAdmissao || "—"}</span>
                </div>
              </div>

              <Button onClick={() => setPerfilColab(null)} className="w-full mt-8 h-11 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] rounded-xl">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
