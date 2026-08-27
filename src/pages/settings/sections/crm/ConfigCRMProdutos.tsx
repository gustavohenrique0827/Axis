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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Catálogo de Produtos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Personalize os dados de produtos e serviços.</p>
        </div>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-2">Acesso ao Catálogo</h3>
        <p className="text-[var(--color-text-muted)] mb-4 text-sm leading-relaxed">
          O catálogo principal foi movido para o menu lateral. Acesse "Produtos" na barra de navegação esquerda.
        </p>
        <Button 
          onClick={() => window.location.href = '/app/produtos'} 
          variant="outline"
          className="h-9 px-4 text-xs font-bold gap-2 text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-surface-sunken)]"
        >
          Ir para Produtos <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </Card>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)]">Campos Personalizados</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Adicione mais detalhes aos produtos (SKU, dimensões, atributos específicos).</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Campo
          </Button>
        </div>

        <div className="space-y-3">
          {customFields.length === 0 ? (
            <p className="text-xs text-[var(--color-text-faint)] italic">Nenhum campo personalizado cadastrado.</p>
          ) : (
            customFields.map((field) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)]">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">{field.name}</span>
                  <span className="text-xs text-[var(--color-text-faint)] font-mono mt-0.5">Tipo: {field.type}</span>
                </div>
                <Button variant="ghost" size="xs" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Editar</Button>
              </div>
            ))
          )}
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
