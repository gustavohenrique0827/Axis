import React, { useState, useEffect } from "react";
import { Building2, Mail, Phone, FileText, MapPin, Briefcase, Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type Setor = "Tecnologia" | "Engenharia" | "Saúde" | "Varejo" | "Indústria" | "Educação" | "Financeiro" | "Outros";

interface NovoClienteForm {
  nome: string;
  documento: string;
  industry: Setor;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
}

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (data: Record<string, string | string[] | null>) => void;
}

const DEFAULT: NovoClienteForm = {
  nome: "",
  documento: "",
  industry: "Tecnologia",
  email: "",
  telefone: "",
  cidade: "São Paulo",
  estado: "SP",
};

const inputClass =
  "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all placeholder:text-slate-600";
const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5";

const SETORES: Setor[] = ["Tecnologia", "Engenharia", "Saúde", "Varejo", "Indústria", "Educação", "Financeiro", "Outros"];

export function NovoClienteModal({ isOpen, onClose, onAction }: NovoClienteModalProps) {
  const [form, setForm] = useState<NovoClienteForm>(DEFAULT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(DEFAULT);
  }, [isOpen]);

  const set = (k: keyof NovoClienteForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const canSubmit = form.nome.trim() && form.email.trim() && form.telefone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    onAction({ ...form });
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-base font-black text-white">Novo Cliente</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Cadastro de conta no CRM Axis
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="novo-cliente-form"
            disabled={!canSubmit || loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar Cliente"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Info banner */}
        <div className="bg-[#0B1120]/60 border border-white/10 rounded-xl p-4 flex gap-3 items-start">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">Conta registrada no CRM</p>
            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
              O cliente será adicionado à base de contas e poderá ser vinculado a negócios, propostas e tarefas.
            </p>
          </div>
        </div>

        <form id="novo-cliente-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Nome do Cliente / Empresa *</span>
            </label>
            <input
              required
              value={form.nome}
              onChange={set("nome")}
              placeholder="Ex: Axis Innovations Ltda"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Documento */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> CPF / CNPJ</span>
              </label>
              <input
                value={form.documento}
                onChange={set("documento")}
                placeholder="00.000.000/0001-00"
                className={inputClass}
              />
            </div>

            {/* Setor */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Setor / Indústria *</span>
              </label>
              <select value={form.industry} onChange={set("industry")} className={inputClass} required>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> E-mail Principal *</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="contato@empresa.com"
                className={inputClass}
              />
            </div>

            {/* Telefone */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telefone *</span>
              </label>
              <input
                required
                type="tel"
                value={form.telefone}
                onChange={set("telefone")}
                placeholder="(11) 99999-9999"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Cidade */}
            <div className="col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Cidade</span>
              </label>
              <input
                value={form.cidade}
                onChange={set("cidade")}
                placeholder="São Paulo"
                className={inputClass}
              />
            </div>

            {/* Estado */}
            <div>
              <label className={labelClass}>Estado (UF)</label>
              <input
                value={form.estado}
                onChange={set("estado")}
                placeholder="SP"
                maxLength={2}
                className={inputClass + " uppercase"}
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
