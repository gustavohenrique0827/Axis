import { Trash, CheckCircle2 } from "lucide-react";
import { Button } from "../button";
import { ConfirmModal } from "../modals/shared/ConfirmModal";

export function LeadDetailsModalFooter(props: {
  isEditingInline: boolean;
  setIsEditingInline: (v: boolean) => void;
  handleSaveAll: () => void;

  isConfirmDeleteOpen: boolean;
  setIsConfirmDeleteOpen: (v: boolean) => void;
  onClose: () => void;
  onConfirmDelete: () => void;

  companyName?: string;
  leadName?: string;
}) {
  return (
    <>
      {/* footer is rendered by Modal via prop in LeadDetailsModal */}

      <ConfirmModal
        isOpen={props.isConfirmDeleteOpen}
        onClose={() => props.setIsConfirmDeleteOpen(false)}
        onConfirm={props.onConfirmDelete}
        title="Remover Lead Permanentemente?"
        message={`Você tem certeza ABSOLUTA de que deseja deletar o lead "${props.companyName || props.leadName}"? Todos os relatórios de alteração, e-mails de interações e produtos vinculados no faturamento serão destruídos.`}
      />

      <div className="flex items-center justify-between w-full gap-2">
        <Button
          variant="outline"
          onClick={() => props.setIsConfirmDeleteOpen(true)}
          className="border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 gap-1.5 h-9 px-4 text-xs"
        >
          <Trash className="w-3.5 h-3.5" />
          Excluir
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={props.onClose}
            className="text-slate-400 font-bold px-4 h-9 hover:text-white text-xs"
          >
            Fechar
          </Button>
          {props.isEditingInline ? (
            <Button
              onClick={props.handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 h-9 text-xs shadow-sm shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Salvar
            </Button>
          ) : (
            <Button
              onClick={() => props.setIsEditingInline(true)}
              className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-5 h-9 text-xs shadow-sm shadow-blue-500/20"
            >
              Editar Lead
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

