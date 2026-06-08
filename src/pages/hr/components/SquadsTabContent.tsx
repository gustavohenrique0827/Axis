import { useState, useEffect } from "react";
import {
  Brain, Wallet, Sparkles, Trophy,
  Pencil, Trash2, UserPlus, X, Users, ImagePlus
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";
import { Squad } from "../../../types";
import { useData } from "../../../contexts/DataContext";
import { supabase } from "../../../lib/supabase";

interface SquadsTabContentProps {
  squads: Squad[];
  handleDeleteSquad: (id: string) => void;
  oteBaseSalary: string;
  setOteBaseSalary: (val: string) => void;
  oteCommPercentage: string;
  setOteCommPercentage: (val: string) => void;
  oteVendasRealizadas: string;
  setOteVendasRealizadas: (val: string) => void;
  oteAtingimentoMeta: string;
  setOteAtingimentoMeta: (val: string) => void;
  calcVariable: number;
  calcBonus: number;
  totalOTE: number;
}

export function SquadsTabContent({
  squads,
  handleDeleteSquad,
  oteBaseSalary,
  setOteBaseSalary,
  oteCommPercentage,
  setOteCommPercentage,
  oteVendasRealizadas,
  setOteVendasRealizadas,
  oteAtingimentoMeta,
  setOteAtingimentoMeta,
  calcVariable,
  calcBonus,
  totalOTE,
}: SquadsTabContentProps) {
  const { colaboradores, updateSquad } = useData();
  const [clienteBase, setClienteBase] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) console.error("[SquadsTab] clientes load error:", error.message);
      else if (data) setClienteBase(data);
    });
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"membros" | "clientes">("membros");
  const [addMemberName, setAddMemberName] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<"Membro" | "Gestor">("Membro");
  const [addClientId, setAddClientId] = useState("");

  // Edit modal state
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDepartamento, setEditDepartamento] = useState("");
  const [editFoco, setEditFoco] = useState("");
  const [editCor, setEditCor] = useState("#6366f1");
  const [editLeader, setEditLeader] = useState("");
  const [editLogo, setEditLogo] = useState("");

  const PRESET_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];

  const openEdit = (sq: Squad) => {
    setEditingSquad(sq);
    setEditNome(sq.nome);
    setEditDepartamento(sq.departamento || "");
    setEditFoco(sq.focoComercial || "");
    setEditCor(sq.cor || "#6366f1");
    setEditLeader(sq.leader || "");
    setEditLogo(sq.logo || "");
  };

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 2MB."); return; }
    const reader = new FileReader();
    reader.onload = ev => setEditLogo((ev.target?.result as string) || "");
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = () => {
    if (!editingSquad || !editNome.trim()) { toast.error("Nome do squad é obrigatório!"); return; }
    updateSquad(editingSquad.id, {
      nome: editNome.trim(),
      departamento: editDepartamento || "Geral",
      focoComercial: editFoco,
      cor: editCor,
      leader: editLeader,
      logo: editLogo,
    });
    toast.success("Squad atualizado!");
    setEditingSquad(null);
  };

  useEffect(() => {
    if (selectedId === null && squads.length > 0) {
      setSelectedId(squads[0].id);
    }
  }, [squads]);

  const selectedSquad = squads.find(s => s.id === selectedId) ?? null;

  const handleAddMember = async () => {
    if (!addMemberName || !selectedSquad) return;
    const membros = [...(selectedSquad.membros ?? [])];
    if (!membros.includes(addMemberName)) membros.push(addMemberName);
    const membrosFuncoes = { ...(selectedSquad.membrosFuncoes ?? {}), [addMemberName]: addMemberRole };
    updateSquad(selectedSquad.id, { membros, membrosFuncoes });
    setAddMemberName("");
    toast.success(`${addMemberName} adicionado ao squad!`);
  };

  const handleRemoveMember = async (nome: string) => {
    if (!selectedSquad) return;
    const membros = selectedSquad.membros.filter(m => m !== nome);
    const membrosFuncoes = { ...(selectedSquad.membrosFuncoes ?? {}) };
    delete membrosFuncoes[nome];
    updateSquad(selectedSquad.id, { membros, membrosFuncoes });
  };

  const handleAddClient = async () => {
    if (!addClientId || !selectedSquad) return;
    const clientes = [...(selectedSquad.clientes ?? [])];
    if (!clientes.includes(addClientId)) clientes.push(addClientId);
    updateSquad(selectedSquad.id, { clientes });
    setAddClientId("");
    toast.success("Cliente atribuído ao squad!");
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!selectedSquad) return;
    const clientes = (selectedSquad.clientes ?? []).filter(c => c !== clientId);
    updateSquad(selectedSquad.id, { clientes });
  };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-400" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Estrutura de Squads sob Medida</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Organize times por área, atribua membros com funções e controle quais clientes cada squad atende.</p>
          </div>
        </div>
      </div>

      {/* Main layout: cards + detail panel */}
      <div className="flex gap-5 min-h-[520px]">

        {/* Left: Squad cards */}
        <div className="w-64 flex-shrink-0 space-y-3 overflow-y-auto pr-1">
          {squads.length === 0 ? (
            <div className="text-center py-16 text-slate-600 italic text-sm">
              Nenhum squad criado ainda.<br />
              <span className="text-[10px]">Clique em "Criar Squad" para começar.</span>
            </div>
          ) : (
            squads.map(sq => {
              const cor = sq.cor || "#6366f1";
              const isSelected = selectedId === sq.id;
              return (
                <div
                  key={sq.id}
                  onClick={() => setSelectedId(sq.id)}
                  className="relative h-48 rounded-2xl overflow-hidden cursor-pointer transition-all group"
                  style={{
                    background: `linear-gradient(145deg, #0f172a 0%, #1e293b 55%, ${cor}20 100%)`,
                    border: `2px solid ${isSelected ? "#3b82f6" : "rgba(255,255,255,0.05)"}`,
                    boxShadow: isSelected ? `0 0 24px ${cor}30` : "none",
                  }}
                >
                  {/* Color radial glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 75% 40%, ${cor}25, transparent 65%)` }}
                  />

                  {/* Logo image if exists */}
                  {sq.logo && (
                    <img
                      src={sq.logo}
                      alt="logo"
                      className="absolute right-3 top-3 w-14 h-14 rounded-xl object-cover opacity-75"
                    />
                  )}

                  {/* Trophy badge */}
                  <div
                    className="absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cor}30`, border: `1px solid ${cor}50` }}
                  >
                    <Trophy className="w-4 h-4" style={{ color: cor }} />
                  </div>

                  {/* Action buttons */}
                  <div
                    className={`absolute top-3 right-3 flex gap-1 transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    } ${sq.logo ? "mt-16" : ""}`}
                    style={sq.logo ? { top: "4.5rem" } : {}}
                  >
                    <button
                      className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                      onClick={e => { e.stopPropagation(); openEdit(sq); }}
                    >
                      <Pencil className="w-3 h-3 text-white" />
                    </button>
                    <button
                      className="w-7 h-7 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg flex items-center justify-center transition-colors"
                      onClick={e => { e.stopPropagation(); handleDeleteSquad(sq.id); }}
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>

                  {/* Avatar silhouette */}
                  <div className="absolute right-1 bottom-0 opacity-15 pointer-events-none">
                    <Users className="w-28 h-28" style={{ color: cor }} />
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${cor}30`, color: cor }}
                      >
                        {(sq.departamento || "GERAL").toUpperCase()}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <h3 className="text-[15px] font-black text-white uppercase tracking-tight truncate leading-tight">{sq.nome}</h3>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detail panel */}
        <div className="flex-1 bg-[#0B1120]/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
          {selectedSquad ? (
            <>
              {/* Panel header */}
              <div
                className="px-6 pt-5 pb-4 border-b border-white/5"
                style={{ borderLeft: `4px solid ${selectedSquad.cor || "#6366f1"}` }}
              >
                <div className="flex items-center gap-3">
                  {selectedSquad.logo ? (
                    <img src={selectedSquad.logo} className="w-10 h-10 rounded-xl object-cover" alt="logo" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedSquad.cor || "#6366f1"}20`, border: `1px solid ${selectedSquad.cor || "#6366f1"}40` }}
                    >
                      <Trophy className="w-5 h-5" style={{ color: selectedSquad.cor || "#6366f1" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-black text-white uppercase tracking-tight truncate">{selectedSquad.nome}</h2>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: selectedSquad.cor || "#6366f1" }}
                    >
                      {selectedSquad.departamento || "Geral"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Gestor</div>
                    <div className="text-sm font-bold text-slate-200">{selectedSquad.leader || "—"}</div>
                  </div>
                </div>
                {selectedSquad.focoComercial && (
                  <p className="text-xs text-slate-400 mt-3 italic leading-relaxed">"{selectedSquad.focoComercial}"</p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 px-6">
                {(["membros", "clientes"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`py-3.5 px-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                      detailTab === tab
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab === "membros"
                      ? `Membros (${(selectedSquad.membros ?? []).length})`
                      : `Clientes (${(selectedSquad.clientes ?? []).length})`}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
                {detailTab === "membros" ? (
                  <>
                    {(selectedSquad.membros ?? []).length === 0 ? (
                      <p className="text-sm text-slate-600 italic text-center py-8">Nenhum membro adicionado ainda.</p>
                    ) : (
                      (selectedSquad.membros ?? []).map((nome, idx) => {
                        const funcao = (selectedSquad.membrosFuncoes ?? {})[nome] || "Membro";
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 group transition-all hover:border-white/10"
                          >
                            <span className="text-sm font-bold text-white">{nome}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                                  funcao === "Gestor"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {funcao}
                              </span>
                              <button
                                onClick={() => handleRemoveMember(nome)}
                                className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Add member form */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adicionar Membro</p>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3">
                          <select
                            value={addMemberName}
                            onChange={e => setAddMemberName(e.target.value)}
                            className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                          >
                            <option value="">Usuário...</option>
                            {colaboradores
                              .filter((c: any) => !(selectedSquad.membros ?? []).includes(c.nome))
                              .map((c: any) => (
                                <option key={c.id} value={c.nome}>{c.nome}</option>
                              ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <select
                            value={addMemberRole}
                            onChange={e => setAddMemberRole(e.target.value as "Membro" | "Gestor")}
                            className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                          >
                            <option value="Membro">Membro</option>
                            <option value="Gestor">Gestor</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={handleAddMember}
                        disabled={!addMemberName}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Adicionar à Equipe
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {(selectedSquad.clientes ?? []).length === 0 ? (
                      <p className="text-sm text-slate-600 italic text-center py-8">Nenhum cliente atribuído ainda.</p>
                    ) : (
                      (selectedSquad.clientes ?? []).map((clientId, idx) => {
                        const cliente = clienteBase.find((c: any) => c.id === clientId);
                        if (!cliente) return null;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 group transition-all hover:border-white/10"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white truncate">{cliente.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{cliente.industry} · {cliente.city}, {cliente.state}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                cliente.status === 'Ativo'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
                              }`}>
                                {cliente.status}
                              </span>
                              <button
                                onClick={() => handleRemoveClient(clientId)}
                                className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Add client form */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atribuir Cliente</p>
                      <select
                        value={addClientId}
                        onChange={e => setAddClientId(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                      >
                        <option value="">Selecionar cliente...</option>
                        {clienteBase
                          .filter((c: any) => !(selectedSquad.clientes ?? []).includes(c.id))
                          .map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name} — {c.industry}</option>
                          ))}
                      </select>
                      <button
                        onClick={handleAddClient}
                        disabled={!addClientId}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                      >
                        Atribuir ao Squad
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
              <Users className="w-12 h-12 opacity-20" />
              <p className="italic text-sm">Selecione um squad para ver os detalhes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Squad Modal */}
      {editingSquad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingSquad(null)} />
          <div
            className="relative w-full max-w-md bg-[#0B1120] border border-white/10 rounded-3xl p-7 shadow-2xl"
            style={{ borderLeft: `4px solid ${editCor}` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Editar Squad</h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{editingSquad.nome}</p>
              </div>
              <button
                onClick={() => setEditingSquad(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do Squad</label>
                <Input
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl text-sm text-white"
                  placeholder="Ex: Code Titans"
                />
              </div>

              {/* Departamento + Foco */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Departamento</label>
                  <Input
                    value={editDepartamento}
                    onChange={e => setEditDepartamento(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-sm text-white"
                    placeholder="Ex: Comercial"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gestor</label>
                  <select
                    value={editLeader}
                    onChange={e => setEditLeader(e.target.value)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Sem gestor</option>
                    {colaboradores.map((c: any) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Foco Comercial */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foco Comercial</label>
                <Input
                  value={editFoco}
                  onChange={e => setEditFoco(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl text-sm text-white"
                  placeholder="Ex: Prospecção outbound B2B"
                />
              </div>

              {/* Cor */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cor de Identificação</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCor(c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        backgroundColor: c,
                        outline: editCor === c ? `2px solid white` : "none",
                        outlineOffset: "2px",
                        transform: editCor === c ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={editCor}
                    onChange={e => setEditCor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                    title="Cor personalizada"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emblema / Logo</label>
                <label className="flex items-center gap-3 p-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors group">
                  {editLogo ? (
                    <img src={editLogo} className="w-10 h-10 rounded-lg object-cover" alt="logo" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-300">{editLogo ? "Trocar imagem" : "Carregar imagem"}</p>
                    <p className="text-[9px] text-slate-500">PNG, JPG — máx. 2MB</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditLogoUpload} />
                </label>
                {editLogo && (
                  <button
                    type="button"
                    onClick={() => setEditLogo("")}
                    className="text-[9px] text-rose-400 hover:text-rose-300 uppercase tracking-widest font-black"
                  >
                    Remover logo
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSquad(null)}
                className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-black text-slate-400 hover:text-white hover:border-white/20 transition-all uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 rounded-xl text-sm font-black text-white transition-all uppercase tracking-wider"
                style={{ backgroundColor: editCor, boxShadow: `0 4px 20px ${editCor}50` }}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTE Calculator */}
      <Card className="p-6 sm:p-10 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Wallet className="w-40 h-40 text-white" />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Ferramenta Integrada de RH & Planejamento</span>
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-1">Calculadora de OTE & Comissões</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Simule o On-Target Earnings de qualquer colaborador baseando-se no salário base, comissão e metas do squad.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Salário Base Mensal (R$)</label>
                <Input type="number" value={oteBaseSalary} onChange={e => setOteBaseSalary(e.target.value)} className="bg-white/5 border-white/5 h-11 text-sm rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Taxa de Comissão (% sobre vendas)</label>
                <Input type="number" value={oteCommPercentage} onChange={e => setOteCommPercentage(e.target.value)} className="bg-white/5 border-white/5 h-11 text-sm rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Volume de Vendas Faturado (R$)</label>
                <Input type="number" value={oteVendasRealizadas} onChange={e => setOteVendasRealizadas(e.target.value)} className="bg-white/5 border-white/5 h-11 text-sm rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Atingimento da Meta Squad (%)</label>
                <Input type="number" value={oteAtingimentoMeta} onChange={e => setOteAtingimentoMeta(e.target.value)} className="bg-white/5 border-white/5 h-11 text-sm rounded-xl" />
                <span className="text-[8px] text-slate-500 font-bold block">Meta &gt;= 100% libera Bônus Superador de 25% do Base!</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { l: "Analista Jr.", s: "2500", c: "2", v: "30000" },
                { l: "Especialista", s: "5000", c: "4", v: "80000" },
                { l: "Líder de Squad", s: "7000", c: "6", v: "150000" },
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
                  <span className={`font-semibold ${calcBonus > 0 ? "text-indigo-400 animate-pulse" : "text-slate-600"}`}>
                    {calcBonus > 0 ? `+ R$ ${calcBonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Não Qualificado"}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <Button
                onClick={() => toast.success(`Parâmetros de comissionamento de R$ ${totalOTE.toLocaleString()} salvos!`)}
                className="w-full bg-[#2563EB] hover:bg-blue-600 font-black text-[9px] uppercase tracking-widest h-11 rounded-xl"
              >
                Aplicar Modelo Salarial
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
