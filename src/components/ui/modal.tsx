import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  position?: "center" | "right";
  noPadding?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  position = "center",
  noPadding = false,
}: ModalProps) {
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

  const titleId = typeof title === "string" ? "axis-modal-title" : undefined;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex transition-all duration-200 ${
        position === "right"
          ? "justify-end"
          : "items-center justify-center p-4 sm:p-6"
      } ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Dialog */}
      <div
        className={`relative w-[95vw] sm:w-full ${maxWidth} bg-[#111827] shadow-2xl shadow-black/60 overflow-hidden flex flex-col transition-all duration-200 ${
          position === "right"
            ? `h-full border-l border-white/10 rounded-l-2xl max-h-screen ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`
            : `border border-white/10 rounded-3xl max-h-[90vh] ${
                isOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4"
              }`
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title !== undefined && title !== null && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
            {typeof title === "string" ? (
              <h3
                id={titleId}
                className="text-base font-black text-white tracking-tight"
              >
                {title}
              </h3>
            ) : (
              <div className="flex-1 mr-4">{title}</div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors shrink-0"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`flex-1 min-h-0 w-full ${
            noPadding ? "overflow-hidden" : "p-6 overflow-y-auto"
          }`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#0B1120]/60 shrink-0 flex items-center justify-end gap-3 w-full">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
