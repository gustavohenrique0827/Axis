import React from "react";
import { Cpu, X, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface ModuleConfigModalProps {
  selectedTenant: string;
  setSelectedTenant: (tenant: string | null) => void;
  crmEnabled: boolean;
  setCrmEnabled: (enabled: boolean) => void;
  sdrEnabled: boolean;
  setSdrEnabled: (enabled: boolean) => void;
  advDashboardEnabled: boolean;
  setAdvDashboardEnabled: (enabled: boolean) => void;
  handleSaveModules: () => void;
}

export function ModuleConfigModal({
  selectedTenant,
  setSelectedTenant,
  crmEnabled,
  setCrmEnabled,
  sdrEnabled,
  setSdrEnabled,
  advDashboardEnabled,
  setAdvDashboardEnabled,
  handleSaveModules
}: ModuleConfigModalProps) {
  const modules = [
    {
      key: "crm",
      enabled: crmEnabled,
      toggle: () => setCrmEnabled(!crmEnabled),
      title: "Módulo CRM Padrão",
      description: "Habilita leads, pipeline de vendas comercial básico e gestão de contatos das empresas.",
    },
    {
      key: "sdr",
      enabled: sdrEnabled,
      toggle: () => setSdrEnabled(!sdrEnabled),
      title: "Módulo SDR Inteligente",
      description: "Ativa funil SDR nativo, triagem por Inteligência Artificial G-Tech, métricas integradas e transferência automática para closer.",
    },
    {
      key: "bi",
      enabled: advDashboardEnabled,
      toggle: () => setAdvDashboardEnabled(!advDashboardEnabled),
      title: "Módulo BI Avançado",
      description: "Ativa análises preditivas, score/threshold de risco de churn, simulações de suporte/tíquetes e micro-dashboard financeiro completo.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75" onClick={() => setSelectedTenant(null)}></div>

        {/* Modal Content */}
        <div className="relative bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden">
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Cpu className="w-3.5 h-3.5" /> G-Tech Controle Modular
                    </div>
                    <h3 className="text-lg font-medium text-white">Editar Recursos de {selectedTenant}</h3>
                </div>
                <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Apenas administradores da G-Tech podem conceder ou revogar o acesso a módulos inteligentes e integrados do Axis CRM para este tenant.
            </p>

            <div className="space-y-4 mb-8">
                {modules.map((m) => (
                  <div
                    key={m.key}
                    className={`p-4 rounded-xl border transition-colors flex items-start gap-3 select-none cursor-pointer ${
                        m.enabled
                            ? 'bg-white/5 border-white/20 text-white'
                            : 'bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]'
                    }`}
                    onClick={m.toggle}
                  >
                    <div className="mt-0.5">
                        {m.enabled ? (
                            <div className="w-[18px] h-[18px] rounded bg-white/20 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="w-[18px] h-[18px] rounded border border-white/20" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm text-slate-200">{m.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="outline" className="text-xs px-4" onClick={() => setSelectedTenant(null)}>
                    Cancelar
                </Button>
                <Button className="text-xs px-6" onClick={handleSaveModules}>
                    Salvar Habilitação
                </Button>
            </div>
        </div>
    </div>
  );
}
