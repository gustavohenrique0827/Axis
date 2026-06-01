import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  position?: "center" | "right";
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-md", position = "center" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("axis-modal-open");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove("axis-modal-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleId = typeof title === "string" ? "axis-modal-title" : undefined;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex ${position === "right" ? "justify-end" : "items-center justify-center p-4 sm:p-6"}`}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2.5px] transition-opacity duration-300 animate-in fade-in"
        onMouseDown={(e) => {
          // garante que só fecha quando o clique for realmente no backdrop
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-[95vw] sm:w-full ${maxWidth} bg-[#111827] shadow-2xl overflow-hidden flex flex-col transform transition-all ${
          position === "right"
            ? "h-full border-l border-white/10 rounded-l-2xl max-h-screen animate-in slide-in-from-right duration-300"
            : "border border-white/10 rounded-xl max-h-[90vh] animate-in zoom-in-95 duration-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title !== undefined && title !== null && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            {typeof title === "string" ? (
              <h3 id={titleId} className="text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
            ) : (
              <div className="flex-1 mr-4">{title}</div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto w-full">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#0B1120]/50 shrink-0 flex items-center justify-end gap-3 w-full">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

