import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { NovoCampoCRMModal } from "../../../../components/ui/modals/crm/NovoCampoCRMModal";

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
        <Button
          onClick={() => { setEditingField(null); setIsModalOpen(true); }}
          className="bg-[#2563EB] hover:bg-blue-600 px-6"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Campo
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {customLeadFields.map((field) => (
            <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--color-surface)] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
              <div className="flex flex-col">
                <span className="font-medium text-white">{field.name}</span>
                <div className="flex gap-4 mt-0.5">
                  <span className="text-xs text-slate-500 font-mono">Tipo: {field.type}</span>
                  {field.validationRegex && <span className="text-xs text-slate-500 font-mono italic">Regex: {field.validationRegex}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white group-hover:opacity-100 opacity-0"
                onClick={() => { setEditingField(field); setIsModalOpen(true); }}
              >
                Editar
              </Button>
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
