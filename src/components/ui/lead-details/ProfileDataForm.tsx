import React from "react";
import {
  Mail, Phone, Building2, User, FileCheck, Briefcase, DollarSign, Lock, Edit, Search,
} from "lucide-react";

interface ProfileDataFormProps {
  isEditingInline: boolean;
  setIsEditingInline: (val: boolean) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  leadName: string;
  setLeadName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  value: string;
  setValue: (val: string) => void;
  displayValue: string;
  seller: string;
  setSeller: (val: string) => void;
  priority: "Alta" | "Média" | "Baixa";
  setPriority: (val: any) => void;
  sellerOptions: string[];
  lead: any;
  updateLead: any;
  customLeadFields: any[];
  customFieldsState: Record<string, string | number>;
  setCustomFieldsState: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  cnpjFetching: boolean;
  onFetchCnpj: () => void;
}

const inputActiveClass =
  "w-full bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600";

function viewCls(colorCls = "text-white font-semibold") {
  return `w-full bg-transparent border-none px-0 py-0 text-xs outline-none cursor-text appearance-none transition-all ${colorCls} placeholder:text-slate-500`;
}

function viewSelectCls(colorCls = "text-white font-bold") {
  return `w-full bg-transparent border-none px-0 py-0 text-xs outline-none cursor-default appearance-none pointer-events-none transition-all ${colorCls}`;
}

export function ProfileDataForm({
  isEditingInline,
  setIsEditingInline,
  companyName, setCompanyName,
  leadName, setLeadName,
  phone, setPhone,
  email, setEmail,
  title, setTitle,
  value, setValue,
  displayValue,
  seller, setSeller,
  priority, setPriority,
  sellerOptions,
  lead,
  updateLead,
  customLeadFields,
  customFieldsState, setCustomFieldsState,
  cnpjFetching,
  onFetchCnpj,
}: ProfileDataFormProps) {
  return (
    <div className="border border-white/10 bg-[#111827]/70 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
        <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400">Dados Principais</h4>
        <button
          onClick={() => setIsEditingInline(!isEditingInline)}
          className={`text-[9px] font-black flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
            isEditingInline
              ? "text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/15"
              : "text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15"
          }`}
        >
          <Lock className={`w-2.5 h-2.5 shrink-0${!isEditingInline ? " hidden" : ""}`} />
          <Edit className={`w-2.5 h-2.5 shrink-0${isEditingInline ? " hidden" : ""}`} />
          {isEditingInline ? "Bloquear" : "Editar"}
        </button>
      </div>

      <div className="divide-y divide-white/[0.04]">
        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Empresa/Líder
            </div>
            <input
              type="text"
              value={companyName}
              placeholder="—"
              readOnly={!isEditingInline}
              onChange={(e) => setCompanyName(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls()}
            />
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Contato
            </div>
            <input
              type="text"
              value={leadName}
              placeholder="—"
              readOnly={!isEditingInline}
              onChange={(e) => setLeadName(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls()}
            />
          </div>
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Mail className="w-3 h-3" /> E-mail
          </div>
          <input
            type="email"
            value={email}
            placeholder="—"
            readOnly={!isEditingInline}
            onChange={(e) => setEmail(e.target.value)}
            className={isEditingInline ? inputActiveClass : viewCls(email ? "text-amber-400 font-semibold" : "text-slate-500")}
          />
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Phone className="w-3 h-3" /> Telefone
          </div>
          <input
            type="text"
            value={phone}
            placeholder="—"
            readOnly={!isEditingInline}
            onChange={(e) => setPhone(e.target.value)}
            className={isEditingInline ? inputActiveClass : viewCls(phone ? "text-emerald-400 font-semibold font-mono" : "text-slate-500 font-mono")}
          />
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> CNPJ
          </div>
          <div className="flex gap-1.5 items-center">
            <input
              type="text"
              maxLength={18}
              value={lead.cnpj || ""}
              placeholder="—"
              readOnly={!isEditingInline}
              onChange={(e) => {
                if (!isEditingInline) return;
                import("../../../lib/utils").then(({ formatCNPJ }) => {
                  updateLead(lead.id, { cnpj: (formatCNPJ as (v: string) => string)(e.target.value) });
                });
              }}
              className={isEditingInline
                ? "flex-1 bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                : `flex-1 ${viewCls(lead.cnpj ? "text-white font-mono" : "text-slate-500")}`}
            />
            <button
              type="button"
              onClick={onFetchCnpj}
              disabled={cnpjFetching || (lead.cnpj || "").replace(/\D/g, "").length !== 14}
              className={`px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed${!isEditingInline ? " hidden" : ""}`}
              title="Buscar na Receita Federal"
            >
              <Search className={`w-3.5 h-3.5 ${cnpjFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Iniciativa
            </div>
            <input
              type="text"
              value={title}
              placeholder="—"
              readOnly={!isEditingInline}
              onChange={(e) => setTitle(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls(title ? "text-white font-semibold" : "text-slate-500")}
            />
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Valor
            </div>
            <input
              type="text"
              value={isEditingInline ? value : displayValue}
              placeholder="—"
              readOnly={!isEditingInline}
              onChange={(e) => setValue(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls("text-emerald-400 font-bold font-mono")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Responsável
            </div>
            <select
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              tabIndex={isEditingInline ? 0 : -1}
              className={isEditingInline
                ? inputActiveClass
                : viewSelectCls(seller ? "text-cyan-400 font-bold" : "text-slate-500")}
            >
              <option value="">Não Atribuído</option>
              {sellerOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Prioridade</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              tabIndex={isEditingInline ? 0 : -1}
              className={isEditingInline
                ? inputActiveClass
                : viewSelectCls(`font-black ${priority === "Alta" ? "text-rose-400" : priority === "Média" ? "text-amber-400" : "text-blue-400"}`)}
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {customLeadFields.length > 0 && (
        <div className="border-t border-white/[0.05] p-3 space-y-2.5">
          <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-2">Campos Personalizados</div>
          <div className="grid grid-cols-2 gap-2.5">
            {customLeadFields.map((field) => (
              <div key={field.id}>
                <div className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{field.name}</div>
                <input
                  type={field.type === "Data" ? "date" : field.type === "Número" ? "number" : "text"}
                  value={customFieldsState[field.id] || ""}
                  placeholder="—"
                  readOnly={!isEditingInline}
                  onChange={(e) => setCustomFieldsState((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className={isEditingInline ? inputActiveClass : viewCls("text-white font-semibold")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
