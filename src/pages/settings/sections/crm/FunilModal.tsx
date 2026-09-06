import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import {
  Bot, Columns3, Save, ToggleLeft, ToggleRight, Zap, ArrowRight,
  Star, Timer, XCircle, MessageSquare, Users,
} from "lucide-react";
import { Funil } from "./funisTypes";

interface FunilModalProps {
  funil: Funil | null;
  onClose: () => void;
  onSave: (f: Funil) => void;
  availableClients: string[];
}

export function FunilModal({ funil, onClose, onSave, availableClients }: FunilModalProps) {
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
  const [sdrMsgBoasVindas, setSdrMsgBoasVindas] = useState(funil?.sdrMsgBoasVindas ?? "Olá! Sou a Aurora, assistente comercial da S.P.Y.. Poderia me contar um pouco sobre o seu desafio atual?");
  const [sdrCriterioDesqualificacao, setSdrCriterioDesqualificacao] = useState(funil?.sdrCriterioDesqualificacao ?? "sem_interesse");
  const [saving, setSaving] = useState(false);

  const toggleClient = (t: string) =>
    setClientIds(prev => prev.includes(t) ? prev.filter((x: string) => x !== t) : [...prev, t]);

  const etapas = etapasText.split("\n").map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    if (tipo === "sdr_ia" && etapas.length > 0) {
      if (!etapas.includes(sdrEtapaEntrada)) setSdrEtapaEntrada(etapas[0]);
      if (!etapas.includes(sdrEtapaHandoff)) setSdrEtapaHandoff(etapas[Math.min(3, etapas.length - 1)]);
    }
  }, [etapasText, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || etapas.length === 0) return;
    setSaving(true);
    const result: Funil = {
      id: funil?.id ?? Math.random().toString(36).slice(2),
      nome: nome.trim(), tipo, etapas, ativo, clientIds,
      sdrEtapaEntrada, sdrEtapaHandoff, sdrScoreMinimo,
      sdrDelayResposta, sdrMsgBoasVindas, sdrCriterioDesqualificacao,
    };
    onSave(result);
    setSaving(false);
  };

  const inputClass = "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 transition-all";
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
        <div>
          <label className={labelClass}>Tipo de Funil</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setTipo("sdr_ia")}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${tipo === "sdr_ia" ? "bg-blue-500/10 border-blue-500/40 text-white" : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"}`}>
              <Bot className={`w-5 h-5 shrink-0 ${tipo === "sdr_ia" ? "text-blue-400" : "text-slate-600"}`} />
              <div>
                <div className="text-xs font-black uppercase tracking-tight">SDR IA</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Qualificação automática pela Aurora</div>
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

        {availableClients.length > 0 && (
          <div>
            <label className={labelClass}>
              <Users className="w-3 h-3 inline mr-1 text-indigo-400" />
              Clientes atribuídos
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {availableClients.map(client => (
                <label key={client}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${clientIds.includes(client) ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"}`}>
                  <input type="checkbox" checked={clientIds.includes(client)} onChange={() => toggleClient(client)} className="accent-indigo-500 w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold truncate">{client}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              {clientIds.length === 0 ? "Nenhum cliente selecionado — funil global." : `Restrito a ${clientIds.length} cliente(s).`}
            </p>
          </div>
        )}

        {tipo === "sdr_ia" && (
          <div className="border border-blue-500/20 bg-blue-500/[0.03] rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-black text-blue-300 uppercase tracking-widest">Configuração SDR IA</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}><Zap className="w-3 h-3 inline mr-1 text-blue-400" />Etapa de entrada (Aurora atua)</label>
                <select value={sdrEtapaEntrada} onChange={e => setSdrEtapaEntrada(e.target.value)} className={inputClass}>
                  {etapas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}><ArrowRight className="w-3 h-3 inline mr-1 text-amber-400" />Etapa de handoff (passa p/ humano)</label>
                <select value={sdrEtapaHandoff} onChange={e => setSdrEtapaHandoff(e.target.value)} className={inputClass}>
                  {etapas.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}><Star className="w-3 h-3 inline mr-1 text-purple-400" />Score mínimo — <span className="text-purple-300">{sdrScoreMinimo} pts</span></label>
                <input type="range" min={0} max={100} step={5} value={sdrScoreMinimo} onChange={e => setSdrScoreMinimo(Number(e.target.value))} className="w-full accent-[#2563EB] mt-1" />
                <div className="flex justify-between text-[9px] text-slate-600 font-bold mt-1">
                  <span>0 — Qualquer lead</span><span>100 — Apenas perfeitos</span>
                </div>
              </div>
              <div>
                <label className={labelClass}><Timer className="w-3 h-3 inline mr-1 text-emerald-400" />Delay de resposta (minutos)</label>
                <input type="number" min={0} max={60} value={sdrDelayResposta} onChange={e => setSdrDelayResposta(Number(e.target.value))} className={inputClass} placeholder="2" />
                <p className="text-[10px] text-slate-600 mt-1">0 = imediato. Recomendado: 1–5 min para parecer humano.</p>
              </div>
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
              <div className="md:col-span-2">
                <label className={labelClass}><MessageSquare className="w-3 h-3 inline mr-1 text-cyan-400" />Mensagem de abertura da Aurora</label>
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
