import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Store } from "lucide-react";
import { NovaFilialModal } from "../../../../components/ui/modals/settings/NovaFilialModal";
import { toast } from "sonner";

interface Filial {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  status: "Principal" | "Ativa";
}

const FILIAIS_STORAGE_KEY = "axis_empresa_filiais";

const DEFAULT_FILIAIS: Filial[] = [
  { id: "matriz", nome: "Matriz", cnpj: "00.000.000/0001-00", cidade: "Sede", status: "Principal" },
];

export function ConfigEmpresaFiliais() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filiais, setFiliais] = useState<Filial[]>(() => {
    try {
      const saved = localStorage.getItem(FILIAIS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_FILIAIS;
  });

  const saveFiliais = (updated: Filial[]) => {
    setFiliais(updated);
    try {
      localStorage.setItem(FILIAIS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

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
        {filiais.map((filial) => (
          <Card key={filial.id} className="p-4 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {filial.status !== "Principal" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => {
                    saveFiliais(filiais.filter((f) => f.id !== filial.id));
                    toast.success(`Filial ${filial.nome} removida.`);
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <NovaFilialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          const novaFilial: Filial = {
            id: Date.now().toString(),
            nome: data.nome,
            cnpj: data.cnpj,
            cidade: data.cidade,
            status: "Ativa",
          };
          saveFiliais([...filiais, novaFilial]);
          toast.success(`Filial ${data.nome} cadastrada!`);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
