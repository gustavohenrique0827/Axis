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
      <ConfirmModal
        isOpen={props.isConfirmDeleteOpen}
        onClose={() => props.setIsConfirmDeleteOpen(false)}
        onConfirm={props.onConfirmDelete}
        title="Remover Lead Permanentemente?"
        message={`Você tem certeza de que deseja deletar o lead "${props.companyName || props.leadName}"? O histórico, atividades e produtos vinculados serão removidos.`}
      />

      <div className="flex items-center justify-between w-full gap-2">
        <Button
          variant="danger"
          onClick={() => props.setIsConfirmDeleteOpen(true)}
          className="gap-1.5 h-9 px-3.5 text-xs font-bold"
        >
          <Trash className="w-3.5 h-3.5" />
          Excluir
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={props.onClose}
            className="h-9 px-4 text-xs font-bold"
          >
            Fechar
          </Button>
          {props.isEditingInline ? (
            <Button
              onClick={props.handleSaveAll}
              className="h-9 px-5 text-xs font-bold gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Salvar Alterações
            </Button>
          ) : (
            <Button
              onClick={() => props.setIsEditingInline(true)}
              className="h-9 px-5 text-xs font-bold"
            >
              Editar Lead
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
