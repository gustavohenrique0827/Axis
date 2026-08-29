import { useEffect, useState } from "react";
import { ConfirmModal } from "./modals/shared/ConfirmModal";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmState = ConfirmOptions & { resolve: (value: boolean) => void };

let listener: ((state: ConfirmState) => void) | null = null;

// Confirmação global de ações destrutivas (excluir, remover, desligar etc), reaproveitando
// o mesmo ConfirmModal já usado em Contracts/AgendaCRM/Tarefas — sem precisar de um estado
// "xToDelete" + JSX próprio em cada tela. Uso: `if (await confirmDialog({ description: "..." })) { ...delete... }`
export function confirmDialog(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(options.description || options.title || "Confirmar ação?"));
      return;
    }
    listener({ ...options, resolve });
  });
}

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    listener = (next) => setState(next);
    return () => { listener = null; };
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmModal
      isOpen={!!state}
      onClose={() => close(false)}
      onConfirm={() => close(true)}
      title={state?.title || "Confirmar exclusão"}
      message={state?.description || "Essa ação não pode ser desfeita."}
      confirmText={state?.confirmText}
      cancelText={state?.cancelText}
    />
  );
}
