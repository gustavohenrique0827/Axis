import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Store, Users, ExternalLink, Briefcase, Pencil, Trash2, ShieldCheck, Check, ChevronDown } from "lucide-react";
import { NovaFilialModal } from "../../../components/ui/NovaFilialModal";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";

const ALL_MODULES: { id: string; label: string; desc: string }[] = [
  { id: "crm",          label: "CRM & Pipeline",        desc: "Leads, funil e SDR IA" },
  { id: "financeiro",   label: "Financeiro",             desc: "Painel, entradas, saídas e DRE" },
  { id: "engajamento",  label: "Engajamento",            desc: "WhatsApp, e-mail e automações" },
  { id: "marketing",    label: "Marketing",              desc: "Campanhas, conteúdo e social" },
  { id: "educacao",     label: "Educação",               desc: "Turmas, alunos e certificados" },
  { id: "clinica",      label: "Clínica & Saúde",        desc: "Prontuários e agendamento" },
  { id: "rh",           label: "RH & Colaboradores",     desc: "Equipe interna e comissões" },
  { id: "bi",           label: "BI & Indicadores",       desc: "Relatórios e estatísticas" },
  { id: "produtividade",label: "Tarefas & Kanban",       desc: "Afazeres e produtividade" },
  { id: "catalogo",     label: "Catálogo de Produtos",   desc: "Estoque, SKUs e iPhones" },
  { id: "dev",          label: "Dev & Tecnologia",       desc: "Projetos, sprints e repositórios" },
];

function ModulesCombobox({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const displayText = selected.length === 0 ? "Selecione os módulos..." : selected.length === ALL_MODULES.length ? "Todos os módulos" : `${selected.length} módulo${selected.length !== 1 ? "s" : ""} selecionado${selected.length !== 1 ? "s" : ""}`;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none transition-all flex items-center justify-between text-left">
        <span className={selected.length === 0 ? "text-slate-600" : "text-white"}>{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <button type="button" onClick={() => onChange(ALL_MODULES.map(m => m.id))} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">Todos</button>
            <span className="text-slate-700">·</span>
            <button type="button" onClick={() => onChange([])} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Limpar</button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {ALL_MODULES.map(mod => {
              const checked = selected.includes(mod.id);
              return (
                <button key={mod.id} type="button" onClick={() => toggle(mod.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.04] ${checked ? "bg-blue-600/[0.06]" : ""}`}>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${checked ? "bg-blue-600 border-blue-600" : "border-white/20"}`}>
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[11px] font-black text-white">{mod.label}</div>
                    <div className="text-[9px] text-slate-500 font-bold truncate">{mod.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PermissaoModal({
  isOpen, onClose, onSave, editing, cargos,
}: { isOpen: boolean; onClose: () => void; onSave: (cargoId: string, modulos: string[]) => void; editing: any | null; cargos: any[] }) {
  const [cargoId, setCargoId] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);

  React.useEffect(() => {
    if (!isOpen) return;
    setCargoId(editing?.id ?? "");
    setModulos(editing?.modulos ?? []);
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const selectClass = "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none transition-all";
  const labelCls = "text-[10px] font-black uppercase tracking-wider text-slate-400";
  const disponíveis = editing ? cargos : cargos.filter(c => !c.modulos || c.modulos.length === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0B1120] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-base font-black text-white">{editing ? "Editar Permissões" : "Nova Permissão"}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Módulos de acesso por cargo</div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 space-y-5">
          <div className="space-y-2">
            <label className={labelCls}>Cargo</label>
            {editing ? (
              <div className={`${selectClass} opacity-60 cursor-not-allowed`}>{editing.nome}</div>
            ) : (
              <select value={cargoId} onChange={e => setCargoId(e.target.value)} className={selectClass}>
                <option value="">Selecione um cargo...</option>
                {disponíveis.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
            {!editing && disponíveis.length === 0 && (
              <p className="text-[11px] text-amber-400 font-semibold">Todos os cargos já têm permissões configuradas.</p>
            )}
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Módulos de Acesso</label>
            <ModulesCombobox selected={modulos} onChange={setModulos} />
          </div>
          {modulos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modulos.map(id => {
                const mod = ALL_MODULES.find(m => m.id === id);
                return (
                  <span key={id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-600/10 text-blue-300 text-[10px] font-bold">
                    {mod?.label ?? id}
                    <button type="button" onClick={() => setModulos(prev => prev.filter(x => x !== id))} className="text-blue-500 hover:text-white leading-none ml-0.5">×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">Cancelar</button>
          <button
            onClick={() => { const id = editing?.id ?? cargoId; if (id && modulos.length > 0) { onSave(id, modulos); onClose(); } }}
            className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/20"
          >
            {editing ? "Salvar" : "Criar Permissão"}
          </button>
        </div>
      </div>
    </div>
  );
}

const MODULE_LABELS: Record<string, string> = {
  crm: "CRM & Pipeline",
  financeiro: "Financeiro",
  engajamento: "Engajamento",
  marketing: "Marketing",
  educacao: "Educação",
  clinica: "Clínica",
  rh: "RH",
  bi: "BI",
  produtividade: "Tarefas",
  catalogo: "Catálogo",
  dev: "Dev",
};

const NIVEL_COLORS: Record<string, string> = {
  "Estratégico": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Tático": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Operacional": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function ConfigEmpresaFiliais() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filiais / Unidades</h1>
          <p className="text-sm text-slate-400">Cadastre múltiplas unidades da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Filial</Button>
      </div>

      <div className="grid gap-4">
        {[].map((filial: any, i) => (
          <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">{filial.nome}</h4>
                <div className="text-xs text-slate-400 mt-1 flex gap-3">
                  <span>CNPJ: {filial.cnpj}</span>
                  <span>{filial.cidade}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${filial.status === 'Principal' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'bg-emerald-500/20 text-emerald-400'}`}>{filial.status}</span>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <NovaFilialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          toast.success(`Filial ${data.nome} cadastrada!`);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export function ConfigEmpresaEquipe() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe & Convites</h1>
          <p className="text-sm text-slate-400">Convide novos membros para sua empresa no Axis.</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Users className="w-4 h-4 mr-2" /> Convidar Membro</Button>
      </div>
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <p className="text-slate-400">Gerenciamento de equipe movido para o menu principal. Acesse "Equipe" na barra lateral esquerda.</p>
        <Button onClick={() => window.location.href = '/app/equipe'} className="mt-4 bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Gestão de Equipe <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>
    </div>
  );
}

export function ConfigEmpresaPermissoes() {
  const { cargos, updateCargo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any | null>(null);

  const comPermissao = cargos.filter(c => Array.isArray(c.modulos) && c.modulos.length > 0);

  const handleSave = (cargoId: string, modulos: string[]) => {
    updateCargo(cargoId, { modulos });
    const cargo = cargos.find(c => c.id === cargoId);
    toast.success(`Permissões de "${cargo?.nome}" salvas!`);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis & Permissões</h1>
          <p className="text-sm text-slate-400">Acesso de cada cargo aos módulos do sistema.</p>
        </div>
        <Button
          onClick={() => { setEditingCargo(null); setIsModalOpen(true); }}
          className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"
          disabled={cargos.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Permissão
        </Button>
      </div>

      {cargos.length === 0 ? (
        <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">Nenhum cargo cadastrado ainda.</p>
          <Button onClick={() => window.location.href = '/app/configuracoes/empresa/cargos'} variant="ghost" className="text-[#2563EB] hover:text-blue-400 text-xs font-bold uppercase tracking-widest">
            Cadastrar primeiro cargo →
          </Button>
        </Card>
      ) : comPermissao.length === 0 ? (
        <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">Nenhuma permissão configurada ainda.</p>
          <p className="text-slate-500 text-xs">Clique em "Nova Permissão" para definir quais módulos cada cargo acessa.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {comPermissao.map((cargo) => {
            const nivelClass = NIVEL_COLORS[cargo.nivel as string] ?? NIVEL_COLORS["Operacional"];
            const modulosList: string[] = cargo.modulos;
            return (
              <Card key={cargo.id} className="p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-base text-white">{cargo.nome}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${nivelClass}`}>
                    {cargo.nivel || "Operacional"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {modulosList.map(id => (
                    <span key={id} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400">
                      {MODULE_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={() => { setEditingCargo(cargo); setIsModalOpen(true); }}
                    className="text-xs font-bold text-[#2563EB] hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    Editar Permissões
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PermissaoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCargo(null); }}
        editing={editingCargo}
        cargos={cargos}
        onSave={handleSave}
      />
    </div>
  );
}

const inputClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all";
const labelClass = "text-[10px] font-black uppercase tracking-wider text-slate-400";

type CargoFormData = { nome: string; nivel: string; descricao: string };

function CargoModal({
  isOpen, onClose, onSave, editing,
}: { isOpen: boolean; onClose: () => void; onSave: (d: CargoFormData) => void; editing: any | null }) {
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("Operacional");
  const [descricao, setDescricao] = useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    setNome(editing?.nome ?? "");
    setNivel(editing?.nivel ?? "Operacional");
    setDescricao(editing?.descricao ?? "");
  }, [isOpen, editing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0B1120] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-base font-black text-white">{editing ? "Editar Cargo" : "Novo Cargo"}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cadastro de cargo</div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nome do Cargo</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className={inputClass} placeholder="Ex.: Vendedor, Gerente..." />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Nível</label>
            <select value={nivel} onChange={e => setNivel(e.target.value)} className={inputClass}>
              <option value="Operacional">Operacional</option>
              <option value="Tático">Tático</option>
              <option value="Estratégico">Estratégico</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Descrição</label>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} className={inputClass} placeholder="Opcional..." />
          </div>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (nome.trim()) { onSave({ nome: nome.trim(), nivel, descricao: descricao.trim() }); onClose(); } }}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20"
          >
            {editing ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfigEmpresaCargos() {
  const { cargos, addCargo, updateCargo, deleteCargo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any | null>(null);

  const handleSave = (data: CargoFormData) => {
    if (editingCargo) {
      updateCargo(editingCargo.id, { nome: data.nome, nivel: data.nivel, descricao: data.descricao });
      toast.success(`Cargo "${data.nome}" atualizado!`);
    } else {
      addCargo({ nome: data.nome, nivel: data.nivel, descricao: data.descricao, modulos: [] });
      toast.success(`Cargo "${data.nome}" cadastrado!`);
    }
    setEditingCargo(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cargos</h1>
          <p className="text-sm text-slate-400">Cadastre os cargos da empresa.</p>
        </div>
        <Button onClick={() => { setEditingCargo(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Novo Cargo
        </Button>
      </div>

      {cargos.length === 0 ? (
        <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">Nenhum cargo cadastrado ainda.</p>
          <p className="text-slate-500 text-xs">Clique em "Novo Cargo" para começar.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cargos.map((cargo) => {
            const nivelClass = NIVEL_COLORS[cargo.nivel as string] ?? NIVEL_COLORS["Operacional"];
            return (
              <Card key={cargo.id} className="px-5 py-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{cargo.nome}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${nivelClass}`}>
                      {cargo.nivel || "Operacional"}
                    </span>
                  </div>
                  {cargo.descricao && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{cargo.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { setEditingCargo(cargo); setIsModalOpen(true); }}
                    className="w-8 h-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { deleteCargo(cargo.id); toast.success(`Cargo "${cargo.nome}" removido.`); }}
                    className="w-8 h-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CargoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCargo(null); }}
        editing={editingCargo}
        onSave={handleSave}
      />
    </div>
  );
}
