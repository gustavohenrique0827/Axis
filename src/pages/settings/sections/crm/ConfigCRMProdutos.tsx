import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import { NovoCampoCRMModal } from "../../../../components/ui/modals/crm/NovoCampoCRMModal";

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
        <Button onClick={() => window.location.href = '/app/produtos'} className="bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">
          Ir para Produtos <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Campos Personalizados</h3>
            <p className="text-sm text-slate-400">Adicione mais detalhes aos produtos (SKU, dimensões, atributos específicos).</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold h-9 bg-transparent border border-white/10 shadow-none">
            <Plus className="w-4 h-4 mr-2" /> Novo Campo
          </Button>
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
