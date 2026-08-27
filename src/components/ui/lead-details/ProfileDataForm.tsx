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
  "w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-1.5 text-[var(--color-text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all placeholder:text-[var(--color-text-faint)]";

function viewCls(colorCls = "text-[var(--color-text-primary)] font-semibold") {
  return `w-full bg-transparent border-none px-0 py-0 text-xs outline-none cursor-text appearance-none transition-all ${colorCls} placeholder:text-[var(--color-text-faint)]`;
}

function viewSelectCls(colorCls = "text-[var(--color-text-primary)] font-bold") {
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
    <div className="border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] rounded-[var(--radius-panel)] overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Dados do Lead</h4>
        <button
          type="button"
          onClick={() => setIsEditingInline(!isEditingInline)}
          className={`text-[10px] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            isEditingInline
              ? "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20"
              : "text-[var(--color-primary-blue)] border-[var(--color-primary-blue)]/20 bg-[var(--color-primary-blue)]/10 hover:bg-[var(--color-primary-blue)]/20"
          }`}
        >
          {isEditingInline ? (
            <>
              <Lock className="w-3 h-3 shrink-0" />
              <span>Concluir Edição</span>
            </>
          ) : (
            <>
              <Edit className="w-3 h-3 shrink-0" />
              <span>Editar Campos</span>
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-[var(--color-border-subtle)]">
        <div className="grid grid-cols-2 divide-x divide-[var(--color-border-subtle)]">
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[var(--color-text-muted)]" /> Empresa / Razão
            </div>
            <input
              type="text"
              value={companyName}
              placeholder="Não informado"
              readOnly={!isEditingInline}
              onChange={(e) => setCompanyName(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls()}
            />
          </div>
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-[var(--color-text-muted)]" /> Contato / Decisor
            </div>
            <input
              type="text"
              value={leadName}
              placeholder="Não informado"
              readOnly={!isEditingInline}
              onChange={(e) => setLeadName(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[var(--color-border-subtle)]">
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3 h-3 text-[var(--color-text-muted)]" /> E-mail
            </div>
            <input
              type="email"
              value={email}
              placeholder="Não informado"
              readOnly={!isEditingInline}
              onChange={(e) => setEmail(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls(email ? "text-[var(--color-primary-blue)] font-semibold" : "text-[var(--color-text-faint)]")}
            />
          </div>
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3 text-[var(--color-text-muted)]" /> Telefone / WhatsApp
            </div>
            <input
              type="text"
              value={phone}
              placeholder="Não informado"
              readOnly={!isEditingInline}
              onChange={(e) => setPhone(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls(phone ? "text-emerald-600 dark:text-emerald-400 font-semibold font-mono" : "text-[var(--color-text-faint)] font-mono")}
            />
          </div>
        </div>

        <div className="p-3">
          <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
            <FileCheck className="w-3 h-3 text-[var(--color-text-muted)]" /> CNPJ
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              maxLength={18}
              value={lead.cnpj || ""}
              placeholder="00.000.000/0000-00"
              readOnly={!isEditingInline}
              onChange={(e) => {
                if (!isEditingInline) return;
                import("../../../lib/utils").then(({ formatCNPJ }) => {
                  updateLead(lead.id, { cnpj: (formatCNPJ as (v: string) => string)(e.target.value) });
                });
              }}
              className={isEditingInline
                ? "flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-1.5 text-[var(--color-text-primary)] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all placeholder:text-[var(--color-text-faint)]"
                : `flex-1 ${viewCls(lead.cnpj ? "text-[var(--color-text-primary)] font-mono" : "text-[var(--color-text-faint)]")}`}
            />
            {isEditingInline && (
              <button
                type="button"
                onClick={onFetchCnpj}
                disabled={cnpjFetching || (lead.cnpj || "").replace(/\D/g, "").length !== 14}
                className="px-2.5 py-1.5 bg-[var(--color-primary-blue)]/10 hover:bg-[var(--color-primary-blue)]/20 border border-[var(--color-primary-blue)]/20 text-[var(--color-primary-blue)] rounded-[var(--radius-control)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs flex items-center gap-1 font-bold"
                title="Consultar CNPJ na Receita Federal"
              >
                <Search className={`w-3.5 h-3.5 ${cnpjFetching ? "animate-spin" : ""}`} />
                <span>Receita</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[var(--color-border-subtle)]">
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-[var(--color-text-muted)]" /> Iniciativa / Título
            </div>
            <input
              type="text"
              value={title}
              placeholder="Ex: Aquisição de Licenças"
              readOnly={!isEditingInline}
              onChange={(e) => setTitle(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls(title ? "text-[var(--color-text-primary)] font-semibold" : "text-[var(--color-text-faint)]")}
            />
          </div>
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[var(--color-text-muted)]" /> Valor Negociado
            </div>
            <input
              type="text"
              value={isEditingInline ? value : displayValue}
              placeholder="R$ 0,00"
              readOnly={!isEditingInline}
              onChange={(e) => setValue(e.target.value)}
              className={isEditingInline ? inputActiveClass : viewCls("text-emerald-600 dark:text-emerald-400 font-bold font-mono")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[var(--color-border-subtle)]">
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-[var(--color-text-muted)]" /> Vendedor Responsável
            </div>
            <select
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              tabIndex={isEditingInline ? 0 : -1}
              className={isEditingInline
                ? inputActiveClass
                : viewSelectCls(seller ? "text-[var(--color-primary-blue)] font-bold" : "text-[var(--color-text-faint)]")}
            >
              <option value="">Não Atribuído</option>
              {sellerOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="p-3">
            <div className="text-[10px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider">Prioridade</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              tabIndex={isEditingInline ? 0 : -1}
              className={isEditingInline
                ? inputActiveClass
                : viewSelectCls(`font-bold ${priority === "Alta" ? "text-rose-600 dark:text-rose-400" : priority === "Média" ? "text-amber-600 dark:text-amber-400" : "text-[var(--color-primary-blue)]"}`)}
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {customLeadFields.length > 0 && (
        <div className="border-t border-[var(--color-border-subtle)] p-3 space-y-2 bg-[var(--color-surface-sunken)]">
          <div className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-blue)] mb-2">Campos Customizados</div>
          <div className="grid grid-cols-2 gap-2.5">
            {customLeadFields.map((field) => (
              <div key={field.id}>
                <div className="text-[9px] font-bold text-[var(--color-text-faint)] mb-1 uppercase tracking-wider">{field.name}</div>
                <input
                  type={field.type === "Data" ? "date" : field.type === "Número" ? "number" : "text"}
                  value={customFieldsState[field.id] || ""}
                  placeholder="—"
                  readOnly={!isEditingInline}
                  onChange={(e) => setCustomFieldsState((prev) => ({ ...prev, [field.id]: e.target.value }))}
                  className={isEditingInline ? inputActiveClass : viewCls("text-[var(--color-text-primary)] font-semibold")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
