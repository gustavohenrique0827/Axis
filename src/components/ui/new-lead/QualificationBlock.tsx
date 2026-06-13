import { Briefcase, Users, Target, Package, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "../button";

interface QualificationBlockProps {
  teamSize: string;
  setTeamSize: (v: string) => void;
  currentRole: string;
  setCurrentRole: (v: string) => void;
  linkedinLink: string;
  setLinkedinLink: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  aiLoading: boolean;
  suggestTags: (e: React.MouseEvent) => void;
  isMaster: boolean;
  selectedTenant: string;
  setSelectedTenant: (v: string) => void;
  allTenantModules: Record<string, any>;
  products: any[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function QualificationBlock({
  teamSize, setTeamSize, currentRole, setCurrentRole, linkedinLink, setLinkedinLink,
  tags, setTags, aiLoading, suggestTags, isMaster, selectedTenant, setSelectedTenant,
  allTenantModules, products, selectedProductIds, setSelectedProductIds,
}: QualificationBlockProps) {
  const inputCls = "w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all";
  const activeProducts = products.filter((p: any) => p.active !== false);

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide mt-2">
        <Briefcase className="w-4 h-4 text-purple-400" /> Contexto & Qualificação (SDR)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2 md:col-span-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Tamanho da Equipe
          </label>
          <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className={inputCls}>
            <option value="">Indefinido</option>
            <option value="1-10">1 a 10 pessoas</option>
            <option value="11-50">11 a 50 pessoas</option>
            <option value="51-200">51 a 200 pessoas</option>
            <option value="200+">Corporação (+200)</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo do Decisor</label>
          <input name="currentRole" type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className={inputCls} placeholder="Ex: C-Level, Diretor de Marketing" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interesses Tecnológicos</label>
          <input name="lead_interesse_cliente" type="text" className={inputCls} placeholder="Ex: Solução X, Integração Y" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL do LinkedIn</label>
          <input name="linkedinLink" type="url" value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/" />
        </div>
      </div>

      {isMaster && (
        <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Target className="w-4 h-4" /> Distribuição de Tenant (Master)
          </label>
          <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className={`${inputCls} border-blue-500/30 focus:border-blue-500`}>
            <option value="G-Tech Master">Minha Base (G-Tech)</option>
            {Object.keys(allTenantModules).filter(t => !t.includes("G-Tech")).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {activeProducts.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-400" /> Produtos / Serviços de Interesse
            <span className="ml-auto text-[9px] text-slate-500 font-normal normal-case">Opcional</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeProducts.map((p: any) => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <button key={p.id} type="button"
                  onClick={() => setSelectedProductIds(prev => isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected ? "bg-emerald-500/10 border-emerald-500/40 text-white" : "bg-[#0B1120]/40 border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{p.name}</p>
                    {p.price > 0 && <p className="text-[10px] font-mono text-emerald-400">R$ {Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          {selectedProductIds.length > 0 && (
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {selectedProductIds.length} produto(s) selecionado(s)
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-white/5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          Notas & Descobertas
          <Button type="button" variant="ghost" size="sm" onClick={suggestTags} disabled={aiLoading}
            className="h-7 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 gap-1.5 rounded-md px-3 font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> {aiLoading ? "Processando..." : "Gerar Tags com IA"}
          </Button>
        </label>
        <textarea name="notes" rows={3} className={`${inputCls} resize-none`}
          placeholder="Transcreva dores, objeções e informações críticas aqui..." />
        <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} type="text"
          className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm italic"
          placeholder="Ex: enterprise, prioridade_alta, tech_lead (separados por vírgula)" />
      </div>
    </div>
  );
}
