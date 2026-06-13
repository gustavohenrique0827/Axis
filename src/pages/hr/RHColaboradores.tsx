import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { UserPlus, PlusCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useData } from "../../contexts/DataContext";
import { useRHColaboradores } from "./hooks/useRHColaboradores";
import { SquadsTabContent } from "./components/SquadsTabContent";
import { NovoMembroModal } from "../../components/ui/NovoMembroModal";
import { EditarColabModal } from "../../components/ui/EditarColabModal";
import { supabase, hashPassword } from "../../lib/supabase";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { MembrosSection } from "./components/RHColaboradores/MembrosSection";
import { NewSquadModal } from "./components/RHColaboradores/NewSquadModal";
import { ColaboradorPerfilModal } from "./components/RHColaboradores/ColaboradorPerfilModal";

export default function RHColaboradores() {
  const {
    squads, colaboradores, activeTab, setActiveTab,
    search, setSearch, isNewSquadOpen, setIsNewSquadOpen,
    newSquadName, setNewSquadName, newSquadDepartamento, setNewSquadDepartamento,
    newSquadFoco, setNewSquadFoco, newSquadCor, setNewSquadCor,
    newSquadLogo, setNewSquadLogo, newSquadLeader, setNewSquadLeader,
    oteBaseSalary, setOteBaseSalary, oteCommPercentage, setOteCommPercentage,
    oteVendasRealizadas, setOteVendasRealizadas, oteAtingimentoMeta, setOteAtingimentoMeta,
    handleCreateSquad, handleDeleteSquad, filtered,
    calcVariable, calcBonus, totalOTE,
  } = useRHColaboradores();

  const { addColaborador, updateColaborador, deleteColaborador } = useData();
  const { user } = useAuth();
  const [isMembroModalOpen, setIsMembroModalOpen] = useState(false);
  const [perfilColab, setPerfilColab] = useState<any | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingColab, setEditingColab] = useState<any | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const menus = document.querySelectorAll("[data-menu-ref]");
      let inside = false;
      menus.forEach(m => { if (m.contains(target)) inside = true; });
      if (!inside) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSaveMembro = async (data: any) => {
    if (!supabase) { toast.error("Supabase não configurado."); return; }
    const dataAdmissao = new Date().toLocaleDateString("pt-BR");
    const { data: tenantRow, error: tenantErr } = await supabase.from("tenants").select("id").eq("name", user?.tenantName || "").maybeSingle();
    if (tenantErr) { console.error("[RH] Erro ao buscar tenant:", tenantErr.message); toast.error("Erro ao buscar dados do tenant."); return; }
    if (!tenantRow?.id) { console.error("[RH] Tenant não encontrado para:", user?.tenantName); toast.error("Tenant não encontrado. Verifique o login."); return; }
    const { data: newUser, error: userErr } = await supabase.from("users").insert({
      tenant_id: tenantRow.id, name: data.nome, email: data.email,
      password_hash: hashPassword(data.senha || "123456"), role: data.cargo, is_master: false, active: true,
    }).select("id").maybeSingle();
    if (userErr) { console.error("[RH] Erro ao criar usuário:", userErr.message); toast.error(`Erro ao criar login: ${userErr.message}`); return; }
    addColaborador({
      id: Date.now().toString(), nome: data.nome, email: data.email, phone: data.phone || "",
      cargo: data.cargo, departamento: data.departamento, squad: data.squad || "",
      status: "Ativo", dataAdmissao, desempenho: 0,
      tenant_id: tenantRow.id, user_id: newUser?.id ?? null,
    });
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
          {activeTab === "squads" ? (
            <Button onClick={() => setIsNewSquadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20">
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
        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
          {[
            { key: "membros", label: `👥 Membros da Equipe (${filtered.length})` },
            { key: "squads", label: "🎯 Squads da Empresa" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === key ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "membros" ? (
          <MembrosSection
            filtered={filtered} search={search} onSearchChange={setSearch}
            menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId}
            onVerPerfil={setPerfilColab} onEditColab={setEditingColab}
            onChangeStatus={handleChangeStatus} onDesligar={handleDesligar}
          />
        ) : (
          <SquadsTabContent
            squads={squads} handleDeleteSquad={handleDeleteSquad}
            oteBaseSalary={oteBaseSalary} setOteBaseSalary={setOteBaseSalary}
            oteCommPercentage={oteCommPercentage} setOteCommPercentage={setOteCommPercentage}
            oteVendasRealizadas={oteVendasRealizadas} setOteVendasRealizadas={setOteVendasRealizadas}
            oteAtingimentoMeta={oteAtingimentoMeta} setOteAtingimentoMeta={setOteAtingimentoMeta}
            calcVariable={calcVariable} calcBonus={calcBonus} totalOTE={totalOTE}
          />
        )}
      </div>

      {isNewSquadOpen && (
        <NewSquadModal
          colaboradores={colaboradores}
          newSquadName={newSquadName} setNewSquadName={setNewSquadName}
          newSquadDepartamento={newSquadDepartamento} setNewSquadDepartamento={setNewSquadDepartamento}
          newSquadFoco={newSquadFoco} setNewSquadFoco={setNewSquadFoco}
          newSquadCor={newSquadCor} setNewSquadCor={setNewSquadCor}
          newSquadLogo={newSquadLogo} setNewSquadLogo={setNewSquadLogo}
          newSquadLeader={newSquadLeader} setNewSquadLeader={setNewSquadLeader}
          onSubmit={handleCreateSquad}
          onClose={() => setIsNewSquadOpen(false)}
        />
      )}

      <NovoMembroModal isOpen={isMembroModalOpen} onClose={() => setIsMembroModalOpen(false)} onSave={handleSaveMembro} />
      <EditarColabModal
        colab={editingColab} onClose={() => setEditingColab(null)}
        onSave={(id, updates) => { updateColaborador(id, updates); toast.success(`${updates.nome} atualizado com sucesso!`); }}
      />
      <ColaboradorPerfilModal colab={perfilColab} onClose={() => setPerfilColab(null)} />
    </PageContainer>
  );
}
