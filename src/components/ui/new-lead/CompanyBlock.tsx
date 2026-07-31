import { Building2, Hash, Building, LinkIcon, AlertTriangle, Target } from "lucide-react";

type CnpjStatus = { status: "idle" | "checking" | "active" | "inactive" | "invalid"; message?: string };

interface CompanyBlockProps {
  cnpjValue: string;
  handleCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cnpjStatus: CnpjStatus;
  isCnpjDuplicate: boolean;
  companyValue: string;
  setCompanyValue: (v: string) => void;
}

export function CompanyBlock({
  cnpjValue, handleCnpjChange, cnpjStatus, isCnpjDuplicate, companyValue, setCompanyValue,
}: CompanyBlockProps) {
  const inputCls = "w-full bg-[var(--color-surface)]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all";

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
        <Building2 className="w-4 h-4 text-emerald-400" /> Dados Empresariais
      </h4>

      <div className="p-5 bg-[var(--color-surface)]/30 rounded-xl border border-white/5 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Documento CNPJ
            </span>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
              Receita Federal Sync
            </span>
          </label>
          <input
            name="cnpj" maxLength={18} value={cnpjValue} onChange={handleCnpjChange} type="text"
            className={`${inputCls} font-mono`} placeholder="Digite o CNPJ para auto-preenchimento..."
          />
          <div className="mt-2 min-h-[24px]">
            {isCnpjDuplicate && (
              <p className="text-[10px] text-amber-500 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                <AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!
              </p>
            )}
            {cnpjStatus.status === "checking" && (
              <p className="text-[10px] text-blue-400 animate-pulse font-bold uppercase tracking-widest flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md w-fit">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Buscando dados...
              </p>
            )}
            {cnpjStatus.status === "active" && (
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                <Target className="w-3 h-3" /> CNPJ Validado e Ativo
              </p>
            )}
            {cnpjStatus.status === "inactive" && (
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                <AlertTriangle className="w-3 h-3" /> Situação: {cnpjStatus.message}
              </p>
            )}
            {cnpjStatus.status === "invalid" && (
              <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-md w-fit">
                <AlertTriangle className="w-3 h-3" /> {cnpjStatus.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Razão Social / Fantasia
            </label>
            <input name="company" type="text" value={companyValue} onChange={(e) => setCompanyValue(e.target.value)} className={inputCls} placeholder="Preenchido automaticamente..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" /> Website Corporativo
            </label>
            <input name="website" type="url" className={inputCls} placeholder="https://www.empresa.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
