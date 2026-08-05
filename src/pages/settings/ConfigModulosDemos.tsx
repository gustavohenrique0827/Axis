import { useState, useEffect } from 'react';
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import {
  Cpu, Activity, Layers, Database, UserCheck,
  Target, Award, DollarSign, Package, MessageSquare, Users, Columns3, Clock, Code2,
  Plus, X, Building2, RefreshCw, ChevronDown, Megaphone, Pencil, Trash2, AlertTriangle
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { createTenantAdmin, fetchTenants, fetchTenantsDetailed, updateTenantInfo, deactivateTenant, fetchTenantAdminUser, updateTenantUserCredentials } from "../../lib/supabase";

const NICHES = ["Parceira", "Solar", "Imobiliária", "Clínica", "Tecnologia", "Educação", "Agronegócio", "Varejo"];

export default function ConfigModulosDemos() {
  const { login, user, allTenantModules, updateTenantModules, getTenantModules } = useAuth();
  const { setSidebarModules } = useData();

  const DEFAULT_MODULES = {
    crm: true,
    educacao: true,
    produtividade: true,
    financeiro: true,
    catalogo: true,
    marketing: true,
    engajamento: true,
    rh: true,
    bi: true,
    clinica: true,
    dev: true,
    imobiliario: false,
  };

  const [selectedTenant, setSelectedTenant] = useState<string>(() => user?.tenantName || "G-Tech Master");
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>(DEFAULT_MODULES);
  const [tenantOptions, setTenantOptions] = useState<string[]>(Object.keys(allTenantModules));
  const [simulationRole, setSimulationRole] = useState("Administrador / Sócio");

  // Add partner state
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantNiche, setNewTenantNiche] = useState("Parceira");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantPassword, setNewTenantPassword] = useState("");
  const [savingTenant, setSavingTenant] = useState(false);
  const [reloading, setReloading] = useState(false);

  // Edit/Delete partner state — id + nicho não vêm de fetchTenants (só nome),
  // por isso a lista detalhada separada.
  const [tenantDetails, setTenantDetails] = useState<{ id: string; name: string; niche: string }[]>([]);
  const [showEditTenant, setShowEditTenant] = useState(false);
  const [editTenantName, setEditTenantName] = useState("");
  const [editTenantNiche, setEditTenantNiche] = useState("Parceira");
  const [editAdminUserId, setEditAdminUserId] = useState<string | null>(null);
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [loadingAdminUser, setLoadingAdminUser] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState(false);

  const loadTenantDetails = async () => {
    const details = await fetchTenantsDetailed();
    setTenantDetails(details);
  };

  // Busca direta ao montar — não depende do timing do AuthContext
  useEffect(() => {
    const loadDirect = async () => {
      const dbTenants = await fetchTenants();
      if (Object.keys(dbTenants).length > 0) {
        const merged: Record<string, any> = {
          "G-Tech Master": allTenantModules["G-Tech Master"] || {},
          ...dbTenants
        };
        setTenantOptions(Object.keys(merged));
      }
    };
    loadDirect();
    loadTenantDetails();
  }, []);

  // Sincroniza quando AuthContext atualiza também
  useEffect(() => {
    setTenantOptions(Object.keys(allTenantModules));
  }, [allTenantModules]);

  useEffect(() => {
    const modules = getTenantModules(selectedTenant);
    setActiveModules({ ...DEFAULT_MODULES, ...modules });
  }, [selectedTenant, allTenantModules]);

  const handleToggleModule = async (key: string) => {
    const updated = { ...activeModules, [key]: !activeModules[key] };
    setActiveModules(updated);
    await updateTenantModules(selectedTenant, updated as any);
    if (selectedTenant === user?.tenantName) {
      setSidebarModules(updated);
    }
    toast.success(`Módulo "${key.toUpperCase()}" ${updated[key] ? 'ATIVADO' : 'OCULTADO'} para ${selectedTenant}!`);
  };

  const handleSwitchRole = (role: string) => {
    setSimulationRole(role);
    if (user) login({ ...user, role });
    toast.info(`Simulando visualização para a função: ${role}`);
  };

  const applyPreset = async (presetName: string) => {
    let preset: typeof activeModules;
    switch (presetName) {
      case "ALL_ACTIVE":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: true, engajamento: true, rh: true, bi: true, clinica: true, marketing: true, dev: true, imobiliario: true };
        toast.info("Aplicado Preset: Ecossistema Global (Todos Ativos)");
        break;
      case "EDUCACAO":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: false, engajamento: true, rh: true, bi: true, clinica: false, marketing: true, dev: false };
        toast.info("Aplicado Preset: Admissão & Educação");
        break;
      case "SDR_CLOSER":
        preset = { crm: true, educacao: false, produtividade: true, financeiro: false, catalogo: false, engajamento: true, rh: false, bi: true, clinica: false, marketing: true, dev: false };
        toast.info("Aplicado Preset: Agência SDR & Closers");
        break;
      default:
        return;
    }
    setActiveModules(preset);
    await updateTenantModules(selectedTenant, preset as any);
    if (selectedTenant === user?.tenantName) {
      setSidebarModules(preset);
    }
  };

  const handleReloadTenants = async () => {
    setReloading(true);
    const dbTenants = await fetchTenants();
    if (Object.keys(dbTenants).length > 0) {
      const merged: Record<string, any> = { "G-Tech Master": allTenantModules["G-Tech Master"] || {}, ...dbTenants };
      setTenantOptions(Object.keys(merged));
      toast.success(`${Object.keys(dbTenants).length} empresa(s) carregada(s) do banco.`);
    } else {
      toast.error("Nenhuma empresa parceira encontrada no banco.");
    }
    await loadTenantDetails();
    setReloading(false);
  };

  const openEditTenant = async (tenantName: string) => {
    const willShow = !(showEditTenant && selectedTenant === tenantName);
    const current = tenantDetails.find(t => t.name === tenantName);
    setSelectedTenant(tenantName);
    setEditTenantName(current?.name || tenantName);
    setEditTenantNiche(current?.niche || "Parceira");
    setEditAdminUserId(null);
    setEditAdminEmail("");
    setEditAdminPassword("");
    setConfirmingDelete(false);
    setShowEditTenant(willShow);

    if (willShow && current) {
      setLoadingAdminUser(true);
      const result = await fetchTenantAdminUser(current.id);
      if (result.success && result.user) {
        setEditAdminUserId(result.user.id);
        setEditAdminEmail(result.user.email);
      } else {
        toast.error(result.error || "Não foi possível carregar o administrador desta empresa.");
      }
      setLoadingAdminUser(false);
    }
  };

  const openDeleteConfirm = (tenantName: string) => {
    setSelectedTenant(tenantName);
    setShowEditTenant(false);
    setConfirmingDelete(v => !(v && selectedTenant === tenantName));
  };

  const handleSaveEditTenant = async () => {
    const current = tenantDetails.find(t => t.name === selectedTenant);
    if (!current) {
      toast.error("Empresa não encontrada no banco de dados.");
      return;
    }
    if (!editTenantName.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    if (editAdminPassword && editAdminPassword.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSavingEdit(true);
    const result = await updateTenantInfo(current.id, { name: editTenantName.trim(), niche: editTenantNiche });
    if (!result.success) {
      toast.error(`Erro: ${result.error}`);
      setSavingEdit(false);
      return;
    }

    if (editAdminUserId && (editAdminEmail.trim() || editAdminPassword)) {
      const credUpdates: { email?: string; password?: string } = {};
      if (editAdminEmail.trim()) credUpdates.email = editAdminEmail.trim();
      if (editAdminPassword) credUpdates.password = editAdminPassword;
      const credResult = await updateTenantUserCredentials(editAdminUserId, credUpdates);
      if (!credResult.success) {
        toast.error(`Empresa salva, mas falha ao atualizar credenciais: ${credResult.error}`);
        setSavingEdit(false);
        return;
      }
    }

    toast.success(`Empresa "${editTenantName.trim()}" atualizada com sucesso.`);
    setShowEditTenant(false);
    setEditAdminPassword("");
    setSelectedTenant(editTenantName.trim());
    await handleReloadTenants();
    setSavingEdit(false);
  };

  const handleDeleteTenant = async () => {
    const current = tenantDetails.find(t => t.name === selectedTenant);
    if (!current) {
      toast.error("Empresa não encontrada no banco de dados.");
      return;
    }
    setDeletingTenant(true);
    const result = await deactivateTenant(current.id);
    if (result.success) {
      toast.success(`Empresa "${current.name}" removida da lista de parceiros ativos.`);
      setConfirmingDelete(false);
      setShowEditTenant(false);
      setSelectedTenant("G-Tech Master");
      await handleReloadTenants();
    } else {
      toast.error(`Erro: ${result.error}`);
    }
    setDeletingTenant(false);
  };

  const handleAddTenant = async () => {
    if (!newTenantName.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    if (!newTenantEmail.trim()) {
      toast.error("Informe o e-mail do administrador da empresa.");
      return;
    }
    if (newTenantPassword.length < 6) {
      toast.error("A senha do administrador precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSavingTenant(true);
    const result = await createTenantAdmin(newTenantName.trim(), newTenantNiche, newTenantEmail.trim(), newTenantPassword);
    if (result.success) {
      toast.success(`Empresa "${newTenantName}" cadastrada — acesso criado para ${newTenantEmail}.`);
      setNewTenantName("");
      setNewTenantNiche("Parceira");
      setNewTenantEmail("");
      setNewTenantPassword("");
      setShowAddTenant(false);
      await handleReloadTenants();
    } else {
      toast.error(`Erro: ${result.error}`);
    }
    setSavingTenant(false);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20">

      {/* Header Panel */}
      <div className="border border-white/5 bg-[var(--color-surface-elevated)]/40 p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-[#06B6D4]/13 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-extrabold uppercase tracking-wide">
              <Cpu className="w-3.5 h-3.5" /> Arquitetura Multitenant Modular
            </div>
            <h1 className="text-3xl font-black italic text-white tracking-tighter">Gestão de Empresas & Módulos</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Cadastre e gerencie as empresas parceiras da plataforma e configure os módulos visíveis para cada uma.
            </p>
          </div>
          <Card className="p-4 bg-[var(--color-surface)]/90 border border-white/10 flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tenant Ativo</p>
              <h4 className="text-sm font-black text-white max-w-[200px] truncate">{user?.tenantName || "G-Tech Master"}</h4>
              <p className="text-[9px] text-[#06B6D4] font-black uppercase tracking-widest mt-0.5">Nicho: {user?.tenantNiche || "Master"}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* EMPRESAS PARCEIRAS — gestão centralizada (listar, adicionar, editar, excluir) */}
      {(user?.isMaster || user?.tenantName?.includes("G-Tech")) && (
        <div className="border border-white/5 bg-[var(--color-surface-elevated)]/40 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Empresas Parceiras
              </h2>
              <p className="text-xs text-slate-400 mt-1">Cadastre, edite e gerencie o acesso de cada empresa parceira. A selecionada abaixo é a que você está configurando.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReloadTenants}
                disabled={reloading}
                title="Recarregar parceiros do banco"
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => { setShowAddTenant(v => !v); setShowEditTenant(false); setConfirmingDelete(false); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                {showAddTenant ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddTenant ? "Cancelar" : "Nova Empresa"}
              </button>
            </div>
          </div>

          {/* Company list */}
          {tenantOptions.length <= 1 ? (
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs text-yellow-400/80 flex items-center gap-2">
              <span>⚠️</span>
              <span>Nenhum parceiro cadastrado ainda. Clique em <strong>Nova Empresa</strong> para adicionar.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {tenantOptions.map((name) => {
                const detail = tenantDetails.find(t => t.name === name);
                const isMaster = name === "G-Tech Master";
                const isSelected = selectedTenant === name;
                return (
                  <div
                    key={name}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isSelected ? 'bg-blue-600/[0.06] border-blue-500/40' : 'bg-slate-900/50 border-white/5 hover:border-white/10'}`}
                  >
                    <button
                      onClick={() => setSelectedTenant(name)}
                      className="flex-1 min-w-0 flex items-center gap-3 text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                        {name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{isMaster ? "Master" : detail?.niche || "—"}</p>
                      </div>
                      {isSelected && (
                        <span className="ml-auto shrink-0 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
                          Gerenciando
                        </span>
                      )}
                    </button>
                    {!isMaster && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openEditTenant(name)}
                          title="Editar empresa"
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                          {showEditTenant && isSelected ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(name)}
                          title="Excluir empresa"
                          className="p-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/25 rounded-lg text-rose-400 hover:text-rose-300 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add tenant inline form */}
            {showAddTenant && (
              <div className="overflow-hidden">
                <div className="p-4 bg-[var(--color-surface)] border border-blue-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest">
                    <Building2 className="w-4 h-4" /> Cadastrar Nova Empresa Parceira
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome da Empresa</label>
                      <input
                        value={newTenantName}
                        onChange={e => setNewTenantName(e.target.value)}
                        placeholder="Ex: Empresa ABC Ltda"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nicho</label>
                      <div className="relative">
                        <select
                          value={newTenantNiche}
                          onChange={e => setNewTenantNiche(e.target.value)}
                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 pr-8"
                        >
                          {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acesso do administrador da empresa</p>
                    <p className="text-[10px] text-slate-600">Esse e-mail e senha serão usados para o primeiro login do cliente.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">E-mail</label>
                      <input
                        type="email"
                        value={newTenantEmail}
                        onChange={e => setNewTenantEmail(e.target.value)}
                        placeholder="admin@empresa.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Senha</label>
                      <input
                        type="password"
                        value={newTenantPassword}
                        onChange={e => setNewTenantPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddTenant}
                    disabled={savingTenant}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    {savingTenant ? "Cadastrando..." : "Cadastrar Empresa"}
                  </button>
                </div>
              </div>
            )}

          {/* Delete confirmation */}
                  {confirmingDelete && (
                    <div className="overflow-hidden">
                      <div className="p-4 bg-rose-500/5 border border-rose-500/25 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
                          <AlertTriangle className="w-4 h-4" /> Excluir "{selectedTenant}"?
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          A empresa deixa de aparecer na lista de parceiros ativos e seus usuários perdem acesso. O histórico (leads, contratos etc.) é preservado, não é apagado.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmingDelete(false)}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleDeleteTenant}
                            disabled={deletingTenant}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                          >
                            {deletingTenant ? "Excluindo..." : "Confirmar exclusão"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Edit tenant inline form */}
                  {showEditTenant && (
                    <div className="overflow-hidden">
                      <div className="p-4 bg-[var(--color-surface)] border border-blue-500/20 rounded-xl space-y-3">
                          <Pencil className="w-4 h-4" /> Editar "{selectedTenant}"
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome da Empresa</label>
                            <input
                              value={editTenantName}
                              onChange={e => setEditTenantName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nicho</label>
                            <div className="relative">
                              <select
                                value={editTenantNiche}
                                onChange={e => setEditTenantNiche(e.target.value)}
                                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 pr-8"
                              >
                                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acesso do administrador da empresa</p>
                          <p className="text-[10px] text-slate-600">
                            {loadingAdminUser ? "Carregando administrador..." : editAdminUserId ? "Altere o e-mail e/ou defina uma nova senha. Deixe a senha em branco para mantê-la." : "Nenhum administrador encontrado para editar credenciais."}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">E-mail</label>
                            <input
                              type="email"
                              value={editAdminEmail}
                              onChange={e => setEditAdminEmail(e.target.value)}
                              disabled={!editAdminUserId || loadingAdminUser}
                              placeholder="admin@empresa.com"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nova Senha</label>
                            <input
                              type="password"
                              value={editAdminPassword}
                              onChange={e => setEditAdminPassword(e.target.value)}
                              disabled={!editAdminUserId || loadingAdminUser}
                              placeholder="Deixe em branco para manter"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 disabled:opacity-40"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSaveEditTenant}
                          disabled={savingEdit}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                        >
                          {savingEdit ? "Salvando..." : "Salvar Alterações"}
                        </button>
                      </div>
                  )}

          {/* Module flags */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" /> Módulos de "{selectedTenant}"
                </h3>
                <p className="text-xs text-slate-400">Ative ou desative seções inteiras da barra lateral para simplificar a interface e moldar o CRM para a operação desta empresa.</p>
              </div>

              {/* Quick Presets */}
              <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">🎯 Presets Estratégicos de Operação</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => applyPreset("ALL_ACTIVE")}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    🌐 Geral Full
                  </button>
                  <button
                    onClick={() => applyPreset("EDUCACAO")}
                    className="px-3 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    🎓 Escola/Edu
                  </button>
                  <button
                    onClick={() => applyPreset("SDR_CLOSER")}
                    className="px-3 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    ⚡ SDR & Closers
                  </button>
                </div>
              </div>

              {/* Individual toggles list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {[
                  { id: 'crm', title: "Motor de CRM & Pipeline", desc: "Leads, Funil Comercial e SDR IA", icon: Target },
                  { id: 'educacao', title: "Educação & Admissão", desc: "Turmas, Matrículas, Alunos e Acadêmico", icon: Award },
                  { id: 'produtividade', title: "Tarefas & Produtividade", desc: "Quadro Kanban de afazeres diários", icon: Clock },
                  { id: 'financeiro', title: "Cofre & Financeiro", desc: "Painel Financeiro, Entradas, Saídas e DRE", icon: DollarSign },
                  { id: 'catalogo', title: "Catálogo de Produtos", desc: "Rastreamento, estoque, iPhones e SKUs", icon: Package },
                  { id: 'engajamento', title: "Engajamento & Mensagens", desc: "Central de WhatsApp, E-mail e Automações", icon: MessageSquare },
                  { id: 'marketing', title: "Marketing & Conteúdo", desc: "Campanhas, Social Media, Landing Pages e Métricas", icon: Megaphone },
                  { id: 'rh', title: "RH & Colaboradores", desc: "Equipe interna, comissões de corretores/closers", icon: Users },
                  { id: 'clinica', title: "Clínica & Saúde", desc: "Prontuários, Telemedicina e Agendamento", icon: Activity },
                  { id: 'bi', title: "BI & Indicadores Relatórios", desc: "Melhores estatísticas de faturamento e OTE", icon: Columns3 },
                  { id: 'dev', title: "Dev & Tecnologia", desc: "Projetos, Sprints, Issues, Repositórios e Equipe Dev", icon: Code2 },
                  { id: 'imobiliario', title: "Imobiliário & Corretores", desc: "Portfólio de imóveis, corretores, visitas e leads imobiliários", icon: UserCheck }
                ].map((mod) => {
                  const isEnabled = activeModules[mod.id] ?? true;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-4 bg-[var(--color-surface)] border rounded-2xl flex items-center justify-between gap-4 cursor-pointer select-none transition-all duration-300 ${isEnabled
                          ? 'border-blue-500/40 bg-blue-600/[0.02] shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                          : 'border-white/5 opacity-55 hover:opacity-85'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${isEnabled ? 'bg-blue-600/10 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                          <mod.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-black text-white uppercase tracking-wider block">{mod.title}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight block truncate mt-0.5">{mod.desc}</span>
                        </div>
                      </div>
                      <div>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
                          <div className="w-3 h-3 rounded-full bg-white transition-transform shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulador de Usuário & Permissões */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" /> Cargos & Permissões
              </h2>
              <p className="text-xs text-slate-400">Varie os níveis de autorização para simular a visão de cada usuário.</p>
            </div>

            <Card className="p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl rounded-2xl space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Modificando a função do usuário atual do Axis, certas rotas de administrador ou configurações gerais podem se ocultar ou necessitar de re-autorização no Middleware.
              </p>

              <div className="space-y-2.5">
                {[
                  { title: "Administrador / Sócio", desc: "Acesso total irrestrito a configurações de infraestrutura e relatórios de DRE." },
                  { title: "Médico / Clínico Closer", desc: "Permissões restritas focadas em prontuários EHR e telemedicina médica." },
                  { title: "SDR / Analista de Marketing", desc: "Liberado apenas para triagem de leads, conteúdo e campanhas." },
                  { title: "Professor / Mentor de Turmas", desc: "Focado em gerenciar certificados, alunos e base acadêmica." },
                ].map((role) => {
                  const isSelected = simulationRole === role.title;
                  return (
                    <button
                      key={role.title}
                      onClick={() => handleSwitchRole(role.title)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 relative overflow-hidden group ${isSelected
                          ? "bg-blue-600/10 border-blue-500/40 text-white font-bold"
                          : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />
                      )}
                      <div className="mt-0.5 shrink-0">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-blue-500 text-blue-500" : "border-slate-700"}`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-200">{role.title}</h5>
                        <span className="text-[10px] text-slate-500 block leading-normal mt-1">{role.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[10px] text-blue-400/90 leading-relaxed">
                <strong>Regra de Infraestrutura:</strong> Quando logado como Master, o menu lateral libera painéis de servidores globais no SaaS. Alternando sua empresa por demo acima, o banco de dados reseta instantaneamente.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
