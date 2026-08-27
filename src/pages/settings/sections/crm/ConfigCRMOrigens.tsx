import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { NovaOrigemCRMModal } from "../../../../components/ui/modals/crm/NovaOrigemCRMModal";

const STORAGE_KEY = "axis_origens_leads";
const DEFAULT_ORIGENS = ["Instagram", "WhatsApp", "Indicação", "Site / Orgânico", "Google Ads", "LinkedIn", "Outbound SDR"];

export function ConfigCRMOrigens() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origens, setOrigens] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ORIGENS;
  });

  const handleSave = (data: any) => {
    if (data.nome && data.nome.trim()) {
      const trimmed = data.nome.trim();
      if (origens.includes(trimmed)) {
        toast.error("Esta origem já está cadastrada.");
        return;
      }
      const updated = [trimmed, ...origens];
      setOrigens(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success(`Origem "${trimmed}" cadastrada com sucesso!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (origem: string) => {
    const updated = origens.filter(o => o !== origem);
    setOrigens(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(`Origem "${origem}" removida.`);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
            Origens de Leads <Target className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gerencie os canais de aquisição e atribuição de tráfego dos seus leads.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Origem
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {origens.map((origem) => (
          <Card 
            key={origem} 
            className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl flex justify-between items-center gap-3 shadow-sm hover:border-[var(--color-border-default)] transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-[var(--color-text-primary)] truncate">{origem}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(origem)}
              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              title="Excluir origem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
