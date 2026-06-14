import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Briefcase, Pencil, Trash2 } from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { CargoModal } from "./CargoModal";

const NIVEL_COLORS: Record<string, string> = {
  "Estratégico": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Tático": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Operacional": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

type CargoFormData = { nome: string; nivel: string; descricao: string };

export function ConfigEmpresaCargos() {
  const { cargos, addCargo, updateCargo, deleteCargo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any | null>(null);

  const handleSave = (data: CargoFormData) => {
    if (editingCargo) {
      updateCargo(editingCargo.id, { nome: data.nome, nivel: data.nivel, descricao: data.descricao });
      toast.success(`Cargo "${data.nome}" atualizado!`);
    } else {
      addCargo({ nome: data.nome, nivel: data.nivel, descricao: data.descricao, modulos: [] });
      toast.success(`Cargo "${data.nome}" cadastrado!`);
    }
    setEditingCargo(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cargos</h1>
          <p className="text-sm text-slate-400">Cadastre os cargos da empresa.</p>
        </div>
        <Button onClick={() => { setEditingCargo(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" /> Novo Cargo
        </Button>
      </div>

      {cargos.length === 0 ? (
        <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">Nenhum cargo cadastrado ainda.</p>
          <p className="text-slate-500 text-xs">Clique em "Novo Cargo" para começar.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cargos.map((cargo) => {
            const nivelClass = NIVEL_COLORS[cargo.nivel as string] ?? NIVEL_COLORS["Operacional"];
            return (
              <Card key={cargo.id} className="px-5 py-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{cargo.nome}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${nivelClass}`}>
                      {cargo.nivel || "Operacional"}
                    </span>
                  </div>
                  {cargo.descricao && <p className="text-xs text-slate-500 mt-1 truncate">{cargo.descricao}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingCargo(cargo); setIsModalOpen(true); }} className="w-8 h-8 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { deleteCargo(cargo.id); toast.success(`Cargo "${cargo.nome}" removido.`); }} className="w-8 h-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CargoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCargo(null); }}
        editing={editingCargo}
        onSave={handleSave}
      />
    </div>
  );
}
