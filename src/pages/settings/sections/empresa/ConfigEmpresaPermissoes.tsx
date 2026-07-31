import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, ShieldCheck } from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { PermissaoModal } from "./PermissaoModal";

const MODULE_LABELS: Record<string, string> = {
  crm: "CRM & Pipeline", financeiro: "Financeiro", engajamento: "Engajamento",
  marketing: "Marketing", educacao: "Educação", clinica: "Clínica",
  rh: "RH", bi: "BI", produtividade: "Tarefas", catalogo: "Catálogo", dev: "Dev",
};

const NIVEL_COLORS: Record<string, string> = {
  "Estratégico": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Tático": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Operacional": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function ConfigEmpresaPermissoes() {
  const { cargos, updateCargo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any | null>(null);

  const comPermissao = cargos.filter((c) => Array.isArray(c.modulos) && c.modulos.length > 0);

  const handleSave = (cargoId: string, modulos: string[]) => {
    updateCargo(cargoId, { modulos });
    const cargo = cargos.find((c) => c.id === cargoId);
    toast.success(`Permissões de "${cargo?.nome}" salvas!`);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis & Permissões</h1>
          <p className="text-sm text-slate-400">Acesso de cada cargo aos módulos do sistema.</p>
        </div>
        <Button
          onClick={() => { setEditingCargo(null); setIsModalOpen(true); }}
          className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"
          disabled={cargos.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Permissão
        </Button>
      </div>

      {cargos.length === 0 || comPermissao.length === 0 ? (
        <Card className="p-8 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">
            {cargos.length === 0 ? "Nenhum cargo cadastrado ainda." : "Nenhuma permissão configurada ainda."}
          </p>
          {cargos.length === 0 && (
            <Button onClick={() => window.location.href = "/app/configuracoes/empresa/cargos"} variant="ghost" className="text-[#2563EB] hover:text-blue-400 text-xs font-bold uppercase tracking-widest">
              Cadastrar primeiro cargo →
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {comPermissao.map((cargo) => {
            const nivelClass = NIVEL_COLORS[cargo.nivel as string] ?? NIVEL_COLORS["Operacional"];
            return (
              <Card key={cargo.id} className="p-5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-base text-white">{cargo.nome}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${nivelClass}`}>
                    {cargo.nivel || "Operacional"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(cargo.modulos as string[]).map((id) => (
                    <span key={id} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400">
                      {MODULE_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={() => { setEditingCargo(cargo); setIsModalOpen(true); }}
                    className="text-xs font-bold text-[#2563EB] hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    Editar Permissões
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PermissaoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCargo(null); }}
        editing={editingCargo}
        cargos={cargos}
        onSave={handleSave}
      />
    </div>
  );
}
