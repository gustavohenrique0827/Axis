import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Store } from "lucide-react";
import { NovaFilialModal } from "../../../../components/ui/modals/settings/NovaFilialModal";
import { toast } from "sonner";

export function ConfigEmpresaFiliais() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filiais / Unidades</h1>
          <p className="text-sm text-slate-400">Cadastre múltiplas unidades da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Nova Filial
        </Button>
      </div>

      <div className="grid gap-4">
        {([] as any[]).map((filial: any, i: number) => (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">{filial.nome}</h4>
                <div className="text-xs text-slate-400 mt-1 flex gap-3">
                  <span>CNPJ: {filial.cnpj}</span>
                  <span>{filial.cidade}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${filial.status === "Principal" ? "bg-[#2563EB]/20 text-[#2563EB]" : "bg-emerald-500/20 text-emerald-400"}`}>
                {filial.status}
              </span>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <NovaFilialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => { toast.success(`Filial ${data.nome} cadastrada!`); setIsModalOpen(false); }}
      />
    </div>
  );
}
