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
        <div className="relative bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start mb-6 border-b border-[var(--color-border-default)] pb-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                        <Cpu className="w-3.5 h-3.5" /> G-Tech Controle Modular
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)]">Editar Recursos de {selectedTenant}</h3>
                </div>
                <button onClick={() => setSelectedTenant(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 bg-[var(--color-surface-sunken)] hover:bg-[var(--color-border-default)] rounded-full">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] mb-6 leading-relaxed">
                Apenas administradores da G-Tech podem conceder ou revogar o acesso a módulos inteligentes e integrados do S.P.Y. CRM para este tenant.
            </p>

            <div className="space-y-4 mb-8">
                {modules.map((m) => (
                  <div
                    key={m.key}
                    className={`p-4 rounded-xl border transition-colors flex items-start gap-3 select-none cursor-pointer ${
                        m.enabled
                            ? 'bg-blue-500/5 border-blue-500/30 text-[var(--color-text-primary)]'
                            : 'bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-text-faint)]'
                    }`}
                    onClick={m.toggle}
                  >
                    <div className="mt-0.5">
                        {m.enabled ? (
                            <div className="w-[18px] h-[18px] rounded bg-blue-600 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="w-[18px] h-[18px] rounded border border-[var(--color-text-faint)]" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{m.title}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{m.description}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-3 justify-end border-t border-[var(--color-border-default)] pt-4">
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
