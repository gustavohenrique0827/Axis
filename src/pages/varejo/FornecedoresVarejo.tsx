import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Truck, Plus, Search, Phone, Mail, MapPin,
  Building2, DollarSign, Package
} from "lucide-react";
import { toast } from "sonner";

export default function FornecedoresVarejo() {
  const [fornecedores, setFornecedores] = useState([
    { id: "1", razaoSocial: "Distribuidora Tech Brasil Ltda", cnpj: "12.345.678/0001-90", contato: "Marcos Vinicius", telefone: "(11) 3214-5500", email: "pedidos@techbrasil.com.br", prazoEntrega: "3 dias úteis", categorias: "Acessórios, Cabos, Carregadores" },
    { id: "2", razaoSocial: "Global Imports Eletrônicos SA", cnpj: "98.765.432/0001-10", contato: "Fernanda Dias", telefone: "(11) 3322-8899", email: "vendas@globalimports.com", prazoEntrega: "5 dias úteis", categorias: "Smartwatches, Áudio, Fones" },
  ]);

  return (
    <PageContainer
      title="Fornecedores de Mercadorias"
      description="Cadastro de distribuidoras, condições de pagamento, prazos de entrega e catálogo de produtos."
      actions={
        <Button onClick={() => toast.info("Cadastro de novo fornecedor.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Fornecedor
        </Button>
      }
    >
      <div className="space-y-3">
        {fornecedores.map(f => (
          <div key={f.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{f.razaoSocial}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
                  {f.cnpj}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Contato: <strong className="text-[var(--color-text-primary)]">{f.contato}</strong> ({f.telefone}) • Prazo de Entrega: {f.prazoEntrega}
              </p>
              <p className="text-[10px] text-[var(--color-primary-blue)] font-bold mt-1">
                Linhas: {f.categorias}
              </p>
            </div>

            <Button size="sm" variant="outline" onClick={() => toast.success(`Catálogo de ${f.razaoSocial} aberto.`)} className="h-8 text-xs font-bold rounded-xl self-end sm:self-center">
              Fazer Pedido
            </Button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
