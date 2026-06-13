import { User, Mail, Phone, Tag, Users, Target, AlertTriangle } from "lucide-react";

interface BasicInfoBlockProps {
  emailValue: string;
  setEmailValue: (v: string) => void;
  phoneValue: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmailDuplicate: boolean;
  selectedSeller: string;
  setSelectedSeller: (v: string) => void;
  sellerOptions: string[];
  sellerPipelineId: string;
  sellerCargoLabel: string;
}

export function BasicInfoBlock({
  emailValue, setEmailValue, phoneValue, handlePhoneChange, isEmailDuplicate,
  selectedSeller, setSelectedSeller, sellerOptions, sellerPipelineId, sellerCargoLabel,
}: BasicInfoBlockProps) {
  const inputCls = "w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all";

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
        <User className="w-4 h-4 text-blue-400" /> Informações Básicas
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Nome Principal
          </label>
          <input name="name" required type="text" className={inputCls} placeholder="Nome completo do lead" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Sufixo / Título (opcional)
          </label>
          <input name="nameSuffix" type="text" className={inputCls} placeholder="Ex: Diretor de TI, Dr." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> E-mail Comercial
          </label>
          <input name="email" required type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} className={inputCls} placeholder="contato@empresa.com" />
          {isEmailDuplicate && (
            <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit">
              <AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Celular / WhatsApp
          </label>
          <input name="phone" type="tel" value={phoneValue} onChange={handlePhoneChange} maxLength={15} className={`${inputCls} font-mono`} placeholder="(00) 00000-0000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origem Principal</label>
          <select className={inputCls}>
            <option>Site (Orgânico)</option>
            <option>Google Ads</option>
            <option>Meta Ads</option>
            <option>Indicação</option>
            <option>Prospecção Ativa</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Vendedor Responsável
            {sellerOptions.length === 0 && <span className="text-[9px] text-amber-400 font-bold ml-1">(sem colaboradores)</span>}
          </label>
          <select name="seller" value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)} className={inputCls}>
            {sellerOptions.length > 0
              ? sellerOptions.map(s => <option key={s} value={s} className="bg-[#111827]">{s}</option>)
              : <option value="" disabled className="bg-[#111827] text-slate-500">Nenhum colaborador cadastrado</option>
            }
          </select>
          {selectedSeller && (
            <p className={`text-[10px] font-black flex items-center gap-1 ${sellerPipelineId === "sdr" ? "text-purple-400" : "text-blue-400"}`}>
              <Target className="w-3 h-3" /> Pipeline: {sellerCargoLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
