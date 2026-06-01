import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea" | "datetime-local";
  required?: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (data: Record<string, any>) => void;
  title: string;
  fields: Field[];
  actionText?: string;
  aiSuggestType?: string;
}

export function ActionModal({
  isOpen,
  onClose,
  onAction,
  title,
  fields,
  actionText = "Salvar",
  aiSuggestType,
}: ActionModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.name] = field.defaultValue || "";
      });
      setFormData(initialData);
    }
  }, [isOpen, fields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(formData);
    setFormData({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === "select" && field.options ? (
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  required={field.required}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Selecione...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#2563EB] hover:bg-blue-600 text-white font-medium"
            >
              {actionText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
