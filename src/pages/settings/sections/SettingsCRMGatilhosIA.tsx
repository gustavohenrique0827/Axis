import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Zap, Plus } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";

import { NovaRegraIAAutomacaoModal } from "../../../components/ui/modals/marketing/NovaRegraIAAutomacaoModal";

export function ConfigCRMGatilhosIA() {
  const { leadScoreTriggers, setLeadScoreTriggers } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const sdrStagesMap: Record<string, string> = {
    s1: "Novo Lead",
    s2: "IA Analisando",
    s3: "Contato Iniciado",
    s4: "Em Nutrição",
    s5: "Qualificado",
    s6: "Reunião Agendada",
    s7: "Perdido",
  };

  const newTriggerInitialValue = {
    name: "",
    scoreThreshold: 80,
    condition: "greater" as const,
    targetStageId: "s5",
  };

  const [newTrigger, setNewTrigger] = useState(newTriggerInitialValue);

  const handleSaveTriggers = () => {
    toast.success("Gatilhos de Lead Score IA sincronizados com o motor da Master AI! 🤖✨");
  };

  const handleDelete = (id: string) => {
    setLeadScoreTriggers(leadScoreTriggers.filter(t => t.id !== id));
    toast.success("Gatilho removido com sucesso!");
  };

  const handleCreate = () => {
    if (!newTrigger.name.trim()) {
      toast.error("Por favor, digite um nome para o gatilho.");
      return;
    }
    setLeadScoreTriggers([
      ...leadScoreTriggers, 
      { 
        id: Date.now().toString(), 
        scoreThreshold: Number(newTrigger.scoreThreshold), 
        condition: newTrigger.condition as 'greater' | 'less', 
        targetStageId: newTrigger.targetStageId,
      }


    ]);
    setNewTrigger({ name: "", scoreThreshold: 80, condition: "greater", targetStageId: "s5" });
    toast.success("Novo gatilho automático de Lead Score registrado!");
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-350">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Gatilhos de Lead Score IA <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />
        </h1>
        <p className="text-sm text-slate-400">
          Configure regras automatizadas baseadas no Lead Score calculado pelo motor da Master AI para mover os leads imediatamente para etapas do funil SDR.
        </p>
      </div>

      {/* Rules list */}
      <Card className="bg-[var(--color-surface-elevated)]/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <h3 className="text-xs font-black text-[#2563EB] uppercase tracking-widest font-mono">Gatilhos Ativos no SDR</h3>
          <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15 px-2.5 py-0.5 rounded-full font-bold">
            Master AI Engine Operacional
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {leadScoreTriggers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm italic">
              Nenhuma regra de automação de lead score cadastrada. Crie uma abaixo.
            </div>
          ) : (
            leadScoreTriggers.map((trigger) => (
              <div key={trigger.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Regra de Gatilho</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    Se <span className="font-mono text-yellow-400 bg-yellow-400/5 px-1 rounded border border-yellow-400/10">Lead Score</span> for <strong>{trigger.condition === 'greater' ? 'Maior ou Igual a' : 'Menor ou Igual a'}</strong> <strong className="text-white font-mono">{trigger.scoreThreshold}</strong>, 
                    mover de forma autônoma para a coluna <strong className="text-blue-400">{sdrStagesMap[trigger.targetStageId] || trigger.targetStageId}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button 
                    onClick={() => handleDelete(trigger.id)}
                    className="p-1 px-2.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add trigger form */}
      <Card className="bg-[var(--color-surface-elevated)]/80 border border-white/10 p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">Criar Novo Gatilho do Lead Score</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Gatilho</label>
            <input 
              type="text" 
              placeholder="Ex: Leads Altamente Qualificados para Comercial" 
              value={newTrigger.name}
              onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Condição de Disparo (Condição Lógica)</label>
            <select 
              value={newTrigger.condition}
              onChange={(e) => setNewTrigger({ ...newTrigger, condition: e.target.value as any })}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="greater">Maior ou Igual a</option>
              <option value="less">Menor ou Igual a</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score Alvo (0-100)</label>
            <input 
              type="number" 
              min="0"
              max="100"
              value={newTrigger.scoreThreshold}
              onChange={(e) => setNewTrigger({ ...newTrigger, scoreThreshold: Number(e.target.value) })}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mover Automático para Coluna SDR</label>
            <select 
              value={newTrigger.targetStageId}
              onChange={(e) => setNewTrigger({ ...newTrigger, targetStageId: e.target.value })}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {Object.entries(sdrStagesMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleCreate} className="gap-1 bg-[#2563EB] hover:bg-blue-600 font-medium text-xs">
            <Plus className="w-3.5 h-3.5" /> Adicionar Regra Automática
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={handleSaveTriggers} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 text-xs uppercase shadow-xl shadow-blue-500/10">
          Sincronizar Gatilhos IA
        </Button>
      </div>
    </div>
  );
}
