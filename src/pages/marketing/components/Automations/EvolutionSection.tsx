import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  MessageSquare, RefreshCw, ArrowRight, Sliders, Activity,
  AlertCircle, Link2, Play, Trash2
} from "lucide-react";
import { toast } from "sonner";

export function EvolutionSection() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [instances] = useState<any[]>([]);
  const [evoRules, setEvoRules] = useState<any[]>([]);
  const [newRuleInstance, setNewRuleInstance] = useState("SDR Global");
  const [newRuleTrigger, setNewRuleTrigger] = useState("Ao receber nova mensagem");
  const [newRuleCondition, setNewRuleCondition] = useState("");
  const [newRuleAction, setNewRuleAction] = useState("Adicionar tag de interesse");
  const [associatedTag, setAssociatedTag] = useState("Interessado Comercial");

  const handleSyncInstances = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Instâncias do WhatsApp Evolution API sincronizadas!");
    }, 1200);
  };

  const handleAddEvoRule = (e: { preventDefault(): void }) => {
    e.preventDefault();
    let mappedCondition = newRuleCondition;
    if (newRuleTrigger === "Ao receber nova mensagem" && !mappedCondition) mappedCondition = "Todas as mensagens inbound";
    else if (newRuleTrigger === "Mensagem contendo palavra-chave") mappedCondition = newRuleCondition ? `Contendo '${newRuleCondition}'` : "Contendo qualquer interesse";
    let mappedAction = newRuleAction;
    if (newRuleAction === "Adicionar tag de interesse") mappedAction = `Adicionar tag: ${associatedTag}`;
    setEvoRules([{ id: 'er-' + Date.now(), instance: newRuleInstance, trigger: newRuleTrigger, condition: mappedCondition, action: mappedAction, active: true }, ...evoRules]);
    toast.success("Nova regra de gatilho vinculada ao WhatsApp!");
    setNewRuleCondition("");
  };

  const handleDeleteEvoRule = (id: string) => { setEvoRules(evoRules.filter(r => r.id !== id)); toast.error("Vínculo de regra removido."); };
  const toggleEvoRule = (id: string) => { setEvoRules(evoRules.map(r => r.id === id ? { ...r, active: !r.active } : r)); toast.info("Status da regra atualizado."); };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-400 w-5 h-5 animate-pulse" /> Gatilhos do WhatsApp Evolution API
          </h2>
          <Button onClick={handleSyncInstances} variant="outline" size="sm" disabled={isSyncing}
            className="gap-1 bg-[var(--color-surface-elevated)] border-white/10 hover:border-white/20 text-slate-300 text-[10px] h-8">
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Instâncias"}
          </Button>
        </div>
        <p className="text-slate-500 text-xs mt-1">Vincule regras diretamente a números de WhatsApp ativos no gateway Evolution API para engajamento instantâneo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {instances.map((inst: any) => (
          <Card key={inst.key} className="p-4 bg-[var(--color-surface-elevated)]/60 border border-white/5 flex items-center justify-between rounded-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">{inst.name}</span>
              <span className="text-[10px] font-mono text-slate-400 block">{inst.phone}</span>
              <span className="text-[9px] text-[#22C55E] bg-emerald-500/10 border border-emerald-500/20 rounded px-1 w-fit block mt-1.5 font-bold">{inst.messagesReceived} msgs processadas</span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded font-black ${inst.status === "ONLINE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/25"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inst.status === "ONLINE" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {inst.status}
              </span>
              <span className="text-[9px] font-mono text-slate-600 block mt-1">v2.1.0</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 border border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl rounded-2xl flex flex-col justify-between">
          <form onSubmit={handleAddEvoRule} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5"><Sliders className="w-4 h-4 text-emerald-400" /> Vincular Nova Regra</h3>
              <p className="text-xs text-slate-400">Preencha os passos de input para cadastrar novos triggers.</p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">1. Selecionar Instância</label>
                <select value={newRuleInstance} onChange={(e) => setNewRuleInstance(e.target.value)}
                  className="bg-[var(--color-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full font-semibold">
                  {instances.filter((i: any) => i.status === "ONLINE").map((i: any) => <option key={i.key} value={i.name}>{i.name} (Ativa)</option>)}
                  {instances.filter((i: any) => i.status === "OFFLINE").map((i: any) => <option key={i.key} value={i.name} disabled>{i.name} (OFFLINE)</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">2. Tipo de Gatilho (WhatsApp)</label>
                <select value={newRuleTrigger} onChange={(e) => setNewRuleTrigger(e.target.value)}
                  className="bg-[var(--color-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full font-semibold">
                  <option value="Ao receber nova mensagem">Ao receber qualquer mensagem</option>
                  <option value="Mensagem contendo palavra-chave">Mensagem contendo palavra-chave (Filtro)</option>
                  <option value="Ao receber mídia (Foto/Docs)">Ao receber arquivos ou mídia</option>
                  <option value="Sem resposta após 24h">Nenhum contato após 24h</option>
                </select>
              </div>
              {newRuleTrigger === "Mensagem contendo palavra-chave" && (
                <div className="space-y-1 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                  <label className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mb-1">Palavra-chave a Monitorar</label>
                  <input type="text" placeholder="Ex: demo, teste, valor, suporte" value={newRuleCondition} onChange={(e) => setNewRuleCondition(e.target.value)} required
                    className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full placeholder-slate-600" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">3. Ação CRM Correspondente</label>
                <select value={newRuleAction} onChange={(e) => setNewRuleAction(e.target.value)}
                  className="bg-[var(--color-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full font-semibold">
                  <option value="Adicionar tag de interesse">Adicionar tag de interesse</option>
                  <option value="Cadastrar na Pipeline SDR de Lead">Cadastrar na Pipeline SDR (Novo Lead)</option>
                  <option value="Notificar com alerta de follow-up">Alertar vendedor / Enviar Notificação</option>
                </select>
              </div>
              {newRuleAction === "Adicionar tag de interesse" && (
                <div className="space-y-1 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                  <label className="text-[10px] text-blue-400 uppercase font-black tracking-wider block mb-1">Tag de Interesse</label>
                  <input type="text" placeholder="Ex: WhatsApp Inbound, Teste Grátis" value={associatedTag} onChange={(e) => setAssociatedTag(e.target.value)} required
                    className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full placeholder-slate-600" />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold h-9 text-xs uppercase rounded-lg shadow-lg shadow-emerald-500/10 mt-2 cursor-pointer">
              Vincular Gatilho Evolution
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-3 p-6 border border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-400" /> Gatilhos Ativos Evolution API</h3>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full font-black bg-emerald-500/10 text-emerald-400 font-mono">{evoRules.filter(r => r.active).length} Ativos</span>
            </div>
            <div className="space-y-3 h-[360px] overflow-y-auto pr-1">
              {evoRules.length > 0 ? evoRules.map((rule) => (
                <div key={rule.id} className={`p-3 bg-[var(--color-surface)] border rounded-xl flex items-start justify-between gap-4 transition-all ${rule.active ? "border-emerald-500/15" : "border-white/5 opacity-50"}`}>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[8px] font-black uppercase bg-[var(--color-surface-elevated)] text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">{rule.instance}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{rule.trigger}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-xs mt-1">
                      <span className="font-bold text-slate-400">{rule.condition}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="text-emerald-400 font-semibold truncate">{rule.action}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {rule.active ? (
                      <button onClick={() => toggleEvoRule(rule.id)} className="p-1.5 rounded-lg bg-emerald-500/5 hover:bg-amber-500/10 text-emerald-400 hover:text-amber-500 border border-emerald-500/10 hover:border-amber-500/20 transition-all cursor-pointer" title="Pausar Regra">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 block" />
                      </button>
                    ) : (
                      <button onClick={() => toggleEvoRule(rule.id)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer" title="Ativar Regra">
                        <Play className="w-2.5 h-2.5 fill-slate-400" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteEvoRule(rule.id)} className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all cursor-pointer" title="Excluir Vínculo">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-400 block">Nenhuma regra cadastrada</span>
                  <span className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Preencha o formulário e vincule um gatilho de WhatsApp.</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-slate-500 bg-white/[0.01] p-2 rounded-xl">
            <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>O webhook da Evolution API é disparado perfeitamente no IP local pela nossa infra.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
