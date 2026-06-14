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

const inputClass =
  "w-full bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600";

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
          {isEditingInline
            ? <><Lock className="w-2.5 h-2.5" /> Bloquear</>
            : <><Edit className="w-2.5 h-2.5" /> Editar</>}
        </button>
      </div>

      <div className="divide-y divide-white/[0.04]">
        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Empresa/Líder
            </div>
            {isEditingInline ? (
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Nome da empresa" />
            ) : (
              <span className="text-xs text-white font-semibold">{companyName || <span className="text-slate-500 italic">—</span>}</span>
            )}
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Contato
            </div>
            {isEditingInline ? (
              <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} className={inputClass} placeholder="Nome do contato" />
            ) : (
              <span className="text-xs text-white font-semibold">{leadName || <span className="text-slate-500 italic">—</span>}</span>
            )}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Mail className="w-3 h-3" /> E-mail
          </div>
          {isEditingInline ? (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@empresa.com" />
          ) : (
            <span className={`text-xs font-semibold ${email ? "text-amber-400" : "text-slate-500 italic"}`}>{email || "—"}</span>
          )}
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Phone className="w-3 h-3" /> Telefone
          </div>
          {isEditingInline ? (
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="(00) 00000-0000" />
          ) : (
            <span className={`text-xs font-semibold font-mono ${phone ? "text-emerald-400" : "text-slate-500 italic"}`}>{phone || "—"}</span>
          )}
        </div>

        <div className="p-3">
          <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> CNPJ
          </div>
          {isEditingInline ? (
            <div className="flex gap-1.5">
              <input
                type="text"
                maxLength={18}
                value={lead.cnpj || ""}
                onChange={(e) => {
                  import("../../../lib/utils").then(({ formatCNPJ }) => {
                    updateLead(lead.id, { cnpj: formatCNPJ(e.target.value) });
                  });
                }}
                className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="00.000.000/0000-00"
              />
              <button
                type="button"
                onClick={onFetchCnpj}
                disabled={cnpjFetching || (lead.cnpj || "").replace(/\D/g, "").length !== 14}
                className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Buscar na Receita Federal"
              >
                <Search className={`w-3.5 h-3.5 ${cnpjFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          ) : (
            <span className={`text-xs font-mono ${lead.cnpj ? "text-white" : "text-slate-500 italic"}`}>{lead.cnpj || "—"}</span>
          )}
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Iniciativa
            </div>
            {isEditingInline ? (
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ex: Novo Negócio" />
            ) : (
              <span className={`text-xs font-semibold ${title ? "text-white" : "text-slate-500 italic"}`}>{title || "—"}</span>
            )}
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Valor
            </div>
            {isEditingInline ? (
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} placeholder="0,00" />
            ) : (
              <span className="text-xs font-bold font-mono text-emerald-400">{displayValue}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Responsável
            </div>
            {isEditingInline ? (
              <select value={seller} onChange={(e) => setSeller(e.target.value)} className={inputClass}>
                <option value="">Não Atribuído</option>
                {sellerOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <span className={`text-xs font-bold ${seller ? "text-cyan-400" : "text-slate-500 italic"}`}>
                {seller || "Não Atribuído"}
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Prioridade</div>
            {isEditingInline ? (
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={inputClass}>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            ) : (
              <span className={`text-xs font-black ${
                priority === "Alta" ? "text-rose-400" : priority === "Média" ? "text-amber-400" : "text-blue-400"
              }`}>
                {priority || <span className="text-slate-500 italic font-normal">—</span>}
              </span>
            )}
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
                {isEditingInline ? (
                  <input
                    type={field.type === "Data" ? "date" : field.type === "Número" ? "number" : "text"}
                    value={customFieldsState[field.id] || ""}
                    onChange={(e) => setCustomFieldsState((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className={inputClass}
                  />
                ) : (
                  <span className="text-xs text-white font-semibold">{lead.customFields?.[field.id] || <span className="text-slate-500 italic">—</span>}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
