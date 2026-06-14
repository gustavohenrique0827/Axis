import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { NovaOrigemCRMModal } from "../../../../components/ui/modals/crm/NovaOrigemCRMModal";

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
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Nova Origem
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {origens.map((origem, i) => (
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
