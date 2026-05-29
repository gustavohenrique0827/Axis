import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Excluir permanentemente",
  cancelText = "Cancelar"
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      maxWidth="max-w-md"
      footer={null}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center text-center space-y-4 pt-4 pb-2"
      >
        <motion.div 
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-950/40 mb-2"
        >
          <AlertTriangle className="w-8 h-8" />
        </motion.div>

        <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
        
        <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-sm px-4">
          {message}
        </p>

        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-start gap-2.5 w-full text-left mt-2 shadow-inner">
          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Atenção</p>
            <p className="text-xs text-rose-500/90 font-medium">Esta ação é irreversível.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full mt-6 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-slate-400 hover:text-white text-xs font-bold font-sans cursor-pointer h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-sans shadow-lg shadow-rose-950/40 border border-rose-500/20 h-10 rounded-xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              {confirmText}
            </span>
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
