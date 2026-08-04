import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { NovaAutomacaoModal } from "../../components/ui/modals/marketing/NovaAutomacaoModal";
import { toast } from "sonner";
import { EvolutionSection } from "./components/Automations/EvolutionSection";
import { SystemWorkflowsSection } from "./components/Automations/SystemWorkflowsSection";

export default function Automations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemWorkflows, setSystemWorkflows] = useState<any[]>([]);

  const handleCreateSystemWorkflow = (fieldsData: any) => {
    setSystemWorkflows(prev => [{ title: fieldsData.nome || "Novo Fluxo de Automação", trigger: fieldsData.gatilho, action: fieldsData.acao, active: true }, ...prev]);
    toast.success("Fluxo de automação criado com sucesso!");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            Automação de Fluxos <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Core</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure regras inteligentes, links e integre com canais externos de comunicação.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Fluxo CRM
        </Button>
      </div>

      <EvolutionSection />
      <SystemWorkflowsSection initialWorkflows={systemWorkflows} />

      <NovaAutomacaoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateSystemWorkflow} />
    </div>
  );
}
