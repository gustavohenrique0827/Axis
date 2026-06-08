import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Target, ExternalLink, Bot, Zap, ArrowRight, ChevronRight, ChevronDown, GripVertical, Save, ToggleLeft, ToggleRight, MessageSquare, Timer, Star, XCircle, Pencil, Trash2, Columns3, Users } from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import { useData } from "../../../contexts/DataContext";
import { NovoCampoCRMModal } from "../../../components/ui/NovoCampoCRMModal";
import { supabase } from "../../../lib/supabase";
import { NovaOrigemCRMModal } from "../../../components/ui/NovaOrigemCRMModal";
import { toast } from "sonner";

export function ConfigCRMCampos() {
  const { customLeadFields, setCustomLeadFields } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const handleSave = (field: any) => {
    if (editingField) {
      setCustomLeadFields(customLeadFields.map(f => f.id === editingField.id ? { ...field, id: editingField.id } : f));
    } else {
      setCustomLeadFields([...customLeadFields, { ...field, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingField(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campos Personalizados (CRM)</h1>
          <p className="text-sm text-slate-400">Defina campos adicionais e validações para seus leads.</p>
        </div>
        <Button onClick={() => { setEditingField(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <div className="space-y-3">
          {customLeadFields.map((field) => (
            <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
              <div className="flex flex-col">
                <span className="font-bold text-white">{field.name}</span>
                <div className="flex gap-4 mt-0.5">
                  <span className="text-xs text-slate-500 font-mono">Tipo: {field.type}</span>
                  {field.validationRegex && <span className="text-xs text-slate-500 font-mono italic">Regex: {field.validationRegex}</span>}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white group-hover:opacity-100 opacity-0" onClick={() => { setEditingField(field); setIsModalOpen(true); }}>Editar</Button>
            </div>
          ))}
        </div>
      </Card>

      <NovoCampoCRMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValue={editingField}
        title={editingField ? "Editar Campo" : "Novo Campo"}
        onSave={handleSave}
      />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageConfig {
  nome: string;
  cor: string;
  iniciarMinimizado: boolean;
}

interface Funil {
  id: string;
  nome: string;
  tipo: "sdr_ia" | "comercial";
  etapas: string[];
  etapasConfig?: StageConfig[];
  ativo: boolean;
  clientIds?: string[];
  sdrEtapaEntrada: string;
  sdrEtapaHandoff: string;
  sdrScoreMinimo: number;
  sdrDelayResposta: number;
  sdrMsgBoasVindas: string;
  sdrCriterioDesqualificacao: string;
}

const FUNIS_DEFAULT: Funil[] = [
  {
    id: "funil-comercial-default",
    nome: "Funil Comercial Principal",
    tipo: "comercial",
    etapas: ["Prospecção", "Qualificação", "Apresentação", "Negociação", "Fechamento"],
    ativo: true,
    sdrEtapaEntrada: "",
    sdrEtapaHandoff: "",
    sdrScoreMinimo: 65,
    sdrDelayResposta: 2,
    sdrMsgBoasVindas: "",
    sdrCriterioDesqualificacao: "sem_interesse",
  },
  {
    id: "funil-sdr-ia-default",
    nome: "Funil SDR IA — MIA-6",
    tipo: "sdr_ia",
    etapas: ["Triagem SDR", "Contato Efetuado", "Qualificação SDR", "Reunião Agendada", "Promovido Closer"],
    ativo: true,
    sdrEtapaEntrada: "Triagem SDR",
    sdrEtapaHandoff: "Promovido Closer",
    sdrScoreMinimo: 65,
    sdrDelayResposta: 2,
    sdrMsgBoasVindas: "Olá! Sou a MIA, assistente comercial da Axis. Poderia me contar um pouco sobre o seu desafio atual?",
    sdrCriterioDesqualificacao: "sem_interesse",
  },
];

// ─── Stage Colors ─────────────────────────────────────────────────────────────

const CORES_LISTA = ["blue", "orange", "cyan", "emerald", "purple", "rose", "amber", "indigo", "pink", "slate"];

const ETAPA_CORES: Record<string, { dot: string; top: string }> = {
  slate: { dot: "#64748b", top: "#334155" },
  blue: { dot: "#3b82f6", top: "#2563eb" },
  orange: { dot: "#f97316", top: "#ea580c" },
  cyan: { dot: "#06b6d4", top: "#0891b2" },
  emerald: { dot: "#10b981", top: "#059669" },
  purple: { dot: "#a855f7", top: "#9333ea" },
  rose: { dot: "#f43f5e", top: "#e11d48" },
  amber: { dot: "#f59e0b", top: "#d97706" },
  indigo: { dot: "#6366f1", top: "#4f46e5" },
  pink: { dot: "#ec4899", top: "#db2777" },
};

function initStageConfigs(etapas: string[], existing?: StageConfig[]): StageConfig[] {
  return etapas.map((nome, i) => {
    const ex = existing?.find(e => e.nome === nome);
    return ex ?? { nome, cor: CORES_LISTA[i % CORES_LISTA.length], iniciarMinimizado: false };
  });
}

// ─── Stage Card ───────────────────────────────────────────────────────────────

function EtapaCard({
  stage, idx, corInfo, dragHandleProps, onRename, onDelete, onUpdate, onColorChange,
}: {
  stage: StageConfig;
  idx: number;
  corInfo: { dot: string; top: string };
  dragHandleProps?: any;
  onRename: (nome: string) => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<StageConfig>) => void;
  onColorChange: (cor: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(stage.nome);
  const [showPicker, setShowPicker] = useState(false);

  const save = () => {
    if (nome.trim()) onRename(nome.trim());
    else setNome(stage.nome);
    setEditing(false);
  };

  return (
    <div
      className="flex-shrink-0 w-[200px] rounded-2xl border border-white/10 bg-[#0B1120] flex flex-col relative"
      style={{ borderTop: `4px solid ${corInfo.top}` }}
    >
      <div className="p-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span {...(dragHandleProps ?? {})} className="cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-600 hover:text-slate-400 transition-colors">
            <GripVertical className="w-4 h-4" />
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-shrink-0 z-20">
            <button
              onClick={() => setShowPicker(v => !v)}
              className="w-3 h-3 rounded-full transition-all hover:ring-2 hover:ring-white/30"
              style={{ backgroundColor: corInfo.dot }}
            />
            {showPicker && (
              <div className="absolute top-5 left-0 z-[100] p-2 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl grid grid-cols-5 gap-1.5 w-[116px]">
                {CORES_LISTA.map(cor => (
                  <button
                    key={cor}
                    onClick={() => { onColorChange(cor); setShowPicker(false); }}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                    style={{ backgroundColor: ETAPA_CORES[cor]?.dot, borderColor: stage.cor === cor ? "#fff" : "transparent" }}
                  />
                ))}
              </div>
            )}
          </div>
          {editing ? (
            <input
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              onBlur={save}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setNome(stage.nome); setEditing(false); } }}
              className="text-xs font-bold bg-transparent border-b border-blue-500 text-white outline-none flex-1 min-w-0"
            />
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs font-bold text-white truncate text-left hover:text-blue-300 transition-colors flex-1 min-w-0">
              {stage.nome}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 rounded-lg etapa-card-placeholder" />
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 px-3 py-2.5 flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Iniciar minimizado</span>
        <button
          onClick={() => onUpdate({ iniciarMinimizado: !stage.iniciarMinimizado })}
          className={`relative w-8 h-4 rounded-full transition-colors ${stage.iniciarMinimizado ? "bg-blue-500" : "etapa-toggle-off"}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${stage.iniciarMinimizado ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className="px-3 pb-2.5">
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Etapa {idx + 1}</span>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function FunilModal({ funil, onClose, onSave, availableClients }: { funil: Funil | null; onClose: () => void; onSave: (f: Funil) => void; availableClients: string[] }) {
  const isNew = funil === null;

  const [nome, setNome] = useState(funil?.nome ?? "");
  const [tipo, setTipo] = useState<"sdr_ia" | "comercial">(funil?.tipo ?? "comercial");
  const [etapasText, setEtapasText] = useState((funil?.etapas ?? []).join("\n"));
  const [ativo, setAtivo] = useState(funil?.ativo ?? true);
  const [clientIds, setClientIds] = useState<string[]>(funil?.clientIds ?? []);
  const [sdrEtapaEntrada, setSdrEtapaEntrada] = useState(funil?.sdrEtapaEntrada ?? "");
  const [sdrEtapaHandoff, setSdrEtapaHandoff] = useState(funil?.sdrEtapaHandoff ?? "");
  const [sdrScoreMinimo, setSdrScoreMinimo] = useState(funil?.sdrScoreMinimo ?? 65);
  const [sdrDelayResposta, setSdrDelayResposta] = useState(funil?.sdrDelayResposta ?? 2);
  const [sdrMsgBoasVindas, setSdrMsgBoasVindas] = useState(funil?.sdrMsgBoasVindas ?? "Olá! Sou a MIA, assistente comercial da Axis. Poderia me contar um pouco sobre o seu desafio atual?");
  const [sdrCriterioDesqualificacao, setSdrCriterioDesqualificacao] = useState(funil?.sdrCriterioDesqualificacao ?? "sem_interesse");
  const [saving, setSaving] = useState(false);

  const toggleClient = (t: string) =>
    setClientIds(prev => prev.includes(t) ? prev.filter((x: string) => x !== t) : [...prev, t]);

  const etapas = etapasText.split("\n").map(s => s.trim()).filter(Boolean);

  // keep sdrEtapaEntrada/Handoff in sync with etapas list
  useEffect(() => {
    if (tipo === "sdr_ia" && etapas.length > 0) {
      if (!etapas.includes(sdrEtapaEntrada)) setSdrEtapaEntrada(etapas[0]);
      if (!etapas.includes(sdrEtapaHandoff)) setSdrEtapaHandoff(etapas[Math.min(3, etapas.length - 1)]);
    }
  }, [etapasText, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    if (etapas.length === 0) return;
    setSaving(true);
    const result: Funil = {
      id: funil?.id ?? Math.random().toString(36).slice(2),
      nome: nome.trim(),
      tipo,
      etapas,
      ativo,
      clientIds,
      sdrEtapaEntrada,
      sdrEtapaHandoff,
      sdrScoreMinimo,
      sdrDelayResposta,
      sdrMsgBoasVindas,
      sdrCriterioDesqualificacao,
    };
    onSave(result);
    setSaving(false);
  };

  const inputClass = "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 transition-all";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block";

  return (
    <Modal
      isOpen
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
            {tipo === "sdr_ia" ? <Bot className="w-4 h-4 text-[#60A5FA]" /> : <Columns3 className="w-4 h-4 text-[#60A5FA]" />}
          </div>
          <div>
            <div className="text-base font-black text-white">{isNew ? "Novo Funil" : "Editar Funil"}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Pipeline de vendas</div>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancelar</Button>
          <Button type="submit" form="funil-form" disabled={saving || !nome.trim() || etapas.length === 0} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : isNew ? "Criar Funil" : "Salvar Alterações"}
          </Button>
        </div>
      }
    >
      <form id="funil-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo selection */}
        <div>
          <label className={labelClass}>Tipo de Funil</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setTipo("sdr_ia")}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${tipo === "sdr_ia" ? "bg-blue-500/10 border-blue-500/40 text-white" : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"}`}>
              <Bot className={`w-5 h-5 shrink-0 ${tipo === "sdr_ia" ? "text-blue-400" : "text-slate-600"}`} />
              <div>
                <div className="text-xs font-black uppercase tracking-tight">SDR IA</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Qualificação automática pela MIA</div>
              </div>
            </button>
            <button type="button" onClick={() => setTipo("comercial")}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${tipo === "comercial" ? "bg-blue-500/10 border-blue-500/40 text-white" : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"}`}>
              <Columns3 className={`w-5 h-5 shrink-0 ${tipo === "comercial" ? "text-blue-400" : "text-slate-600"}`} />
              <div>
                <div className="text-xs font-black uppercase tracking-tight">Comercial</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pipeline manual pelos vendedores</div>
              </div>
            </button>
          </div>
        </div>

        {/* Nome + status */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Nome do Funil</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className={inputClass} placeholder="Ex.: Funil Comercial B2B" required />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <button type="button" onClick={() => setAtivo(v => !v)}
              className={`w-full h-[42px] flex items-center justify-center gap-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ativo ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
              {ativo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {ativo ? "Ativo" : "Inativo"}
            </button>
          </div>
        </div>

        {/* Etapas */}
        <div>
          <label className={labelClass}>Etapas do funil (1 por linha)</label>
          <textarea value={etapasText} onChange={e => setEtapasText(e.target.value)} rows={5} className={inputClass}
            placeholder={"Novo Lead\nContato Feito\nQualificado\nReunião Agendada\nProposta\nNegociação\nGanho"} required />
          {etapas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {etapas.map((e, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400">
                  {i + 1}. {e}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Clientes atribuídos */}
        {availableClients.length > 0 && (
          <div>
            <label className={labelClass}>
              <Users className="w-3 h-3 inline mr-1 text-indigo-400" />
              Clientes atribuídos
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {availableClients.map(client => (
                <label
                  key={client}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${clientIds.includes(client)
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={clientIds.includes(client)}
                    onChange={() => toggleClient(client)}
                    className="accent-indigo-500 w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-xs font-bold truncate">{client}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              {clientIds.length === 0
                ? "Nenhum cliente selecionado — funil global (visível para todos)."
                : `Restrito a ${clientIds.length} cliente(s).`}
            </p>
          </div>
        )}

        {/* SDR IA specific fields */}
        {tipo === "sdr_ia" && (
          <div className="border border-blue-500/20 bg-blue-500/[0.03] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-black text-blue-300 uppercase tracking-widest">Configuração SDR IA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Etapa entrada */}
              <div>
                <label className={labelClass}><Zap className="w-3 h-3 inline mr-1 text-blue-400" />Etapa de entrada (MIA atua)</label>
                <select value={sdrEtapaEntrada} onChange={e => setSdrEtapaEntrada(e.target.value)} className={inputClass}>
                  {etapas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Etapa handoff */}
              <div>
                <label className={labelClass}><ArrowRight className="w-3 h-3 inline mr-1 text-amber-400" />Etapa de handoff (passa p/ humano)</label>
                <select value={sdrEtapaHandoff} onChange={e => setSdrEtapaHandoff(e.target.value)} className={inputClass}>
                  {etapas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Score mínimo */}
              <div>
                <label className={labelClass}><Star className="w-3 h-3 inline mr-1 text-purple-400" />Score mínimo — <span className="text-purple-300">{sdrScoreMinimo} pts</span></label>
                <input type="range" min={0} max={100} step={5} value={sdrScoreMinimo} onChange={e => setSdrScoreMinimo(Number(e.target.value))} className="w-full accent-[#2563EB] mt-1" />
                <div className="flex justify-between text-[9px] text-slate-600 font-bold mt-1">
                  <span>0 — Qualquer lead</span><span>100 — Apenas perfeitos</span>
                </div>
              </div>

              {/* Delay */}
              <div>
                <label className={labelClass}><Timer className="w-3 h-3 inline mr-1 text-emerald-400" />Delay de resposta (minutos)</label>
                <input type="number" min={0} max={60} value={sdrDelayResposta} onChange={e => setSdrDelayResposta(Number(e.target.value))} className={inputClass} placeholder="2" />
                <p className="text-[10px] text-slate-600 mt-1">0 = imediato. Recomendado: 1–5 min para parecer humano.</p>
              </div>

              {/* Critério de desqualificação */}
              <div>
                <label className={labelClass}><XCircle className="w-3 h-3 inline mr-1 text-rose-400" />Critério de desqualificação</label>
                <select value={sdrCriterioDesqualificacao} onChange={e => setSdrCriterioDesqualificacao(e.target.value)} className={inputClass}>
                  <option value="sem_interesse">Lead expressa falta de interesse</option>
                  <option value="sem_orcamento">Lead não tem orçamento</option>
                  <option value="sem_resposta_3">Sem resposta após 3 tentativas</option>
                  <option value="sem_resposta_5">Sem resposta após 5 tentativas</option>
                  <option value="score_baixo">Score abaixo do mínimo</option>
                  <option value="manual_apenas">Somente manual (humano decide)</option>
                </select>
              </div>

              {/* Msg abertura */}
              <div className="md:col-span-2">
                <label className={labelClass}><MessageSquare className="w-3 h-3 inline mr-1 text-cyan-400" />Mensagem de abertura da MIA</label>
                <textarea value={sdrMsgBoasVindas} onChange={e => setSdrMsgBoasVindas(e.target.value)} rows={3} className={inputClass}
                  placeholder="Primeira mensagem enviada ao lead..." />
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SDR_DEFAULT = FUNIS_DEFAULT.find(f => f.id === "funil-sdr-ia-default")!;
const COMERCIAL_DEFAULT = FUNIS_DEFAULT.find(f => f.id === "funil-comercial-default")!;

function migrateFunis(saved: Funil[]): Funil[] {
  let changed = false;
  const out = saved.map(f => {
    if (f.id === "funil-sdr-ia-default") {
      const expected = SDR_DEFAULT.etapas;
      const isCurrent = JSON.stringify(f.etapas) === JSON.stringify(expected);
      if (!isCurrent) { changed = true; return { ...SDR_DEFAULT, ativo: f.ativo }; }
    }
    return f;
  });
  const hasSdr = out.some(f => f.id === "funil-sdr-ia-default");
  const hasComercial = out.some(f => f.id === "funil-comercial-default");
  if (!hasSdr) { out.unshift(SDR_DEFAULT); changed = true; }
  if (!hasComercial) { out.unshift(COMERCIAL_DEFAULT); changed = true; }
  if (changed) localStorage.setItem("axis_funis_config", JSON.stringify(out));
  return out;
}

export function ConfigCRMFunis() {
  const { saveAppSetting } = useData();
  const [availableClients, setAvailableClients] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("name").order("name", { ascending: true }).then(({ data }) => {
      if (data) setAvailableClients(data.map((c: any) => c.name).filter(Boolean));
    });
  }, []);

  const [funis, setFunis] = useState<Funil[]>(() => {
    try {
      const saved = localStorage.getItem("axis_funis_config");
      return saved ? migrateFunis(JSON.parse(saved)) : FUNIS_DEFAULT;
    } catch { return FUNIS_DEFAULT; }
  });
  const [editingFunil, setEditingFunil] = useState<Funil | null | "new">(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const persistFunis = async (next: Funil[]) => {
    setFunis(next);
    localStorage.setItem("axis_funis_config", JSON.stringify(next));
    try { await saveAppSetting("axis_funis_config", next); } catch { }
  };

  const handleSave = async (f: Funil) => {
    const existing = funis.find(x => x.id === f.id);
    const mergedConfigs = initStageConfigs(f.etapas, existing?.etapasConfig);
    const funilWithConfigs = { ...f, etapasConfig: mergedConfigs };
    const next = existing
      ? funis.map(x => x.id === f.id ? funilWithConfigs : x)
      : [...funis, funilWithConfigs];
    await persistFunis(next);
    toast.success(existing ? `Funil "${f.nome}" atualizado!` : `Funil "${f.nome}" criado!`);
    setEditingFunil(null);
  };

  const handleDelete = async (id: string) => {
    await persistFunis(funis.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast.success("Funil removido.");
  };

  const handleToggle = async (id: string) => {
    await persistFunis(funis.map(f => f.id === id ? { ...f, ativo: !f.ativo } : f));
  };

  const handleStageUpdate = (funilId: string, idx: number, patch: Partial<StageConfig>) => {
    persistFunis(funis.map(f => {
      if (f.id !== funilId) return f;
      const configs = initStageConfigs(f.etapas, f.etapasConfig);
      return { ...f, etapasConfig: configs.map((c, i) => i === idx ? { ...c, ...patch } : c) };
    }));
  };

  const handleStageRename = (funilId: string, idx: number, newNome: string) => {
    persistFunis(funis.map(f => {
      if (f.id !== funilId) return f;
      const configs = initStageConfigs(f.etapas, f.etapasConfig);
      const oldNome = configs[idx].nome;
      return {
        ...f,
        etapas: f.etapas.map((e, i) => i === idx ? newNome : e),
        etapasConfig: configs.map((c, i) => i === idx ? { ...c, nome: newNome } : c),
        sdrEtapaEntrada: f.sdrEtapaEntrada === oldNome ? newNome : f.sdrEtapaEntrada,
        sdrEtapaHandoff: f.sdrEtapaHandoff === oldNome ? newNome : f.sdrEtapaHandoff,
      };
    }));
  };

  const handleStageDelete = (funilId: string, idx: number) => {
    persistFunis(funis.map(f => {
      if (f.id !== funilId) return f;
      const configs = initStageConfigs(f.etapas, f.etapasConfig);
      return {
        ...f,
        etapas: f.etapas.filter((_, i) => i !== idx),
        etapasConfig: configs.filter((_, i) => i !== idx),
      };
    }));
  };

  const handleStageAdd = (funilId: string) => {
    persistFunis(funis.map(f => {
      if (f.id !== funilId) return f;
      const configs = initStageConfigs(f.etapas, f.etapasConfig);
      const newNome = `Nova Etapa ${configs.length + 1}`;
      const newCor = CORES_LISTA[configs.length % CORES_LISTA.length];
      return {
        ...f,
        etapas: [...f.etapas, newNome],
        etapasConfig: [...configs, { nome: newNome, cor: newCor, iniciarMinimizado: false }],
      };
    }));
  };

  const handleStageReorder = (funilId: string, fromIdx: number, toIdx: number) => {
    persistFunis(funis.map(f => {
      if (f.id !== funilId) return f;
      const configs = initStageConfigs(f.etapas, f.etapasConfig);
      const newEtapas = [...f.etapas];
      const newConfigs = [...configs];
      const [etapa] = newEtapas.splice(fromIdx, 1);
      const [config] = newConfigs.splice(fromIdx, 1);
      newEtapas.splice(toIdx, 0, etapa);
      newConfigs.splice(toIdx, 0, config);
      return { ...f, etapas: newEtapas, etapasConfig: newConfigs };
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const funilId = result.source.droppableId;
    handleStageReorder(funilId, result.source.index, result.destination.index);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funis & Etapas</h1>
          <p className="text-sm text-slate-400">Configure os pipelines de vendas e o comportamento do SDR IA.</p>
        </div>
        <Button onClick={() => setEditingFunil("new")} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Novo Funil
        </Button>
      </div>

      {/* Funil cards */}
      <div className="space-y-3">
        {funis.map(f => {
          const isExpanded = expandedId === f.id;
          const stages = initStageConfigs(f.etapas, f.etapasConfig);

          return (
            <Card key={f.id} className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 hover:border-white/15 transition-all">
              {/* Header row */}
              <div className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.tipo === "sdr_ia" ? "bg-blue-500/10 border border-blue-500/20" : "bg-slate-500/10 border border-slate-500/20"}`}>
                  {f.tipo === "sdr_ia" ? <Bot className="w-5 h-5 text-blue-400" /> : <Columns3 className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white text-sm uppercase tracking-tight">{f.nome}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${f.tipo === "sdr_ia" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-slate-500/10 border-slate-500/20 text-slate-400"}`}>
                      {f.tipo === "sdr_ia" ? "SDR IA" : "Comercial"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {stages.slice(0, 5).map((s, i) => {
                      const cor = ETAPA_CORES[s.cor] ?? ETAPA_CORES.slate;
                      return (
                        <React.Fragment key={i}>
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-white/5 border-white/5 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cor.dot }} />
                            {s.nome}
                          </span>
                          {i < Math.min(stages.length, 5) - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-700 shrink-0" />}
                        </React.Fragment>
                      );
                    })}
                    {stages.length > 5 && <span className="text-[9px] text-slate-600 font-bold">+{stages.length - 5}</span>}
                  </div>
                  {/* Client assignment badges */}
                  {availableClients.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <Users className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                      {f.clientIds && f.clientIds.length > 0 ? (
                        <>
                          {f.clientIds.slice(0, 3).map((t: string) => (
                            <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                              {t}
                            </span>
                          ))}
                          {f.clientIds.length > 3 && (
                            <span className="text-[8px] text-slate-600 font-bold">+{f.clientIds.length - 3}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[8px] font-bold text-slate-600">Global — todos os clientes</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${f.ativo ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
                    {f.ativo ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {f.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => setEditingFunil(f)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(f.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-600 hover:text-rose-400 hover:border-rose-500/30 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : f.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isExpanded ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"}`}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Expanded stages view */}
              {isExpanded && (
                <div className="border-t border-white/5 overflow-x-auto">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={f.id} direction="horizontal">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex gap-3 p-4 min-w-max"
                        >
                          {stages.map((stage, idx) => {
                            const corInfo = ETAPA_CORES[stage.cor] ?? ETAPA_CORES.slate;
                            return (
                              <Draggable key={`${f.id}-${idx}`} draggableId={`${f.id}-${idx}`} index={idx}>
                                {(drag, snapshot) => (
                                  <div
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    className={snapshot.isDragging ? "opacity-80 rotate-1 scale-105" : ""}
                                  >
                                    <EtapaCard
                                      stage={stage}
                                      idx={idx}
                                      corInfo={corInfo}
                                      dragHandleProps={drag.dragHandleProps}
                                      onRename={(nome) => handleStageRename(f.id, idx, nome)}
                                      onDelete={() => handleStageDelete(f.id, idx)}
                                      onUpdate={(patch) => handleStageUpdate(f.id, idx, patch)}
                                      onColorChange={(cor) => handleStageUpdate(f.id, idx, { cor })}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}

                          {/* Add stage */}
                          <button
                            onClick={() => handleStageAdd(f.id)}
                            className="flex-shrink-0 w-[200px] rounded-2xl border border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[220px] gap-2 text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all"
                          >
                            <Plus className="w-6 h-6" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Etapa</span>
                          </button>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
            </Card>
          );
        })}

        {funis.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
            <Columns3 className="w-8 h-8 text-slate-600" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum funil cadastrado.<br />Clique em "Novo Funil" para começar.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editingFunil !== null && (
        <FunilModal
          funil={editingFunil === "new" ? null : editingFunil}
          onClose={() => setEditingFunil(null)}
          onSave={handleSave}
          availableClients={availableClients}
        />
      )}
    </div>
  );
}

export function ConfigCRMOrigens() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origens, setOrigens] = useState<string[]>(["Instagram", "WhatsApp", "Indicação", "Site", "Google Ads"]);

  const handleSave = (data: any) => {
    if (data.nome) {
      setOrigens([data.nome, ...origens]);
      toast.success("Origem cadastrada!");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Origens de Leads</h1>
          <p className="text-sm text-slate-400">Gerencie os canais de aquisição de leads da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Origem</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {origens.map((origem: any, i) => (
          <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex justify-between items-center gap-4 group">
            <span className="font-semibold text-slate-200">{origem}</span>
            <Target className="w-4 h-4 text-slate-500 group-hover:text-[#2563EB]" />
          </Card>
        ))}
      </div>

      <NovaOrigemCRMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export function ConfigCRMProdutos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-400">Personalize os dados de produtos e serviços.</p>
        </div>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <h3 className="font-bold text-lg mb-2">Acesso ao Catálogo</h3>
        <p className="text-slate-400 mb-4 text-sm">O catálogo principal foi movido para o menu lateral. Acesse "Produtos" na barra de navegação esquerda.</p>
        <Button onClick={() => window.location.href = '/app/produtos'} className="bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Produtos <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Campos Personalizados</h3>
            <p className="text-sm text-slate-400">Adicione mais detalhes aos produtos (SKU, dimensões, atributos específicos).</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold h-9 bg-transparent border border-white/10 shadow-none"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
        </div>

        <div className="space-y-3">
          {customFields.map((field) => (
            <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
              <div className="flex flex-col">
                <span className="font-bold text-white">{field.name}</span>
                <span className="text-xs text-slate-500 font-mono mt-0.5">Tipo: {field.type}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">Editar Campo</Button>
            </div>
          ))}
        </div>
      </Card>

      <NovoCampoCRMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Campo Personalizado"
        onSave={(data) => {
          setCustomFields([...customFields, { id: Date.now().toString(), name: data.name, type: data.type }]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
