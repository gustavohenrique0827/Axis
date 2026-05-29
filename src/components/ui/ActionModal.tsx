import React, { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string | string[];
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (data: any) => void;
  title: string;
  actionText?: string;
  fields: Field[];
}

export function ActionModal({ isOpen, onClose, onAction, title, actionText = "Salvar", fields }: ActionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    if (onAction) {
      const formData = new FormData(e.currentTarget);
      const data: any = {};
      fields.forEach(f => {
        if (f.type === "multi-select") {
            data[f.name] = formData.getAll(f.name);
        } else {
            data[f.name] = formData.get(f.name);
        }
      });
      onAction(data);
    }

    setLoading(false);
    onClose();
  };

  const formKeyString = isOpen + "-" + fields.map(f => f.name + "_" + (f.defaultValue || "")).join("-");

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button form="action-modal-form" type="submit" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6">
            {loading ? "Salvando..." : actionText}
          </Button>
        </>
      }
    >
      <form id="action-modal-form" key={formKeyString} onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-slate-400">{field.label}</label>
            {field.type === "select" ? (
              <select name={field.name} defaultValue={field.defaultValue} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" required={field.required}>
                {field.options?.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            ) : field.type === "multi-select" ? (
              <div className="w-full max-h-40 overflow-y-auto bg-[#0B1120] border border-white/10 rounded-lg p-2 space-y-1">
                 {field.options?.map(opt => {
                    // Check if default value includes this option
                    let isChecked = false;
                    if (Array.isArray(field.defaultValue)) {
                        isChecked = field.defaultValue.includes(opt);
                    } else if (typeof field.defaultValue === 'string') {
                        isChecked = field.defaultValue === opt;
                    }

                    return (
                        <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded cursor-pointer">
                            <input 
                                type="checkbox" 
                                name={field.name} 
                                value={opt} 
                                defaultChecked={isChecked}
                                className="w-4 h-4 rounded border-white/20 bg-[#1E293B] text-blue-500 focus:ring-blue-500/50"
                            />
                            <span className="text-sm text-slate-200">{opt}</span>
                        </label>
                    );
                 })}
              </div>
            ) : field.type === "textarea" ? (
              <textarea name={field.name} defaultValue={field.defaultValue as string} rows={3} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder={field.placeholder} required={field.required}></textarea>
            ) : (
              <input name={field.name} type={field.type} defaultValue={field.defaultValue as string} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder={field.placeholder} required={field.required} />
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
}
