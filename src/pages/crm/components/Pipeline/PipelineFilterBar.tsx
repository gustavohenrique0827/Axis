import { Search, Filter, Building2, Target, Briefcase, Zap } from "lucide-react";

interface PipelineFilterBarProps {
  comercialFunis: any[];
  sdrFunis: any[];
  currentPipeline: "sdr" | "comercial";
  setCurrentPipeline: React.Dispatch<React.SetStateAction<"sdr" | "comercial">>;
  selectedFunilId: string;
  setSelectedFunilId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  companyFilter: string;
  setCompanyFilter: (c: string) => void;
  companiesList: string[];
  isMaster: boolean;
  tenantFilter: string;
  setTenantFilter: (t: string) => void;
  tenantsList: any[];
  clientFilter: string;
  setClientFilter: (c: string) => void;
  clientsList: string[];
  sellerFilter: string;
  setSellerFilter: (s: string) => void;
  sellers: string[];
}

export function PipelineFilterBar({
  comercialFunis, sdrFunis, currentPipeline, setCurrentPipeline,
  selectedFunilId, setSelectedFunilId, searchQuery, setSearchQuery,
  companyFilter, setCompanyFilter, companiesList,
  isMaster, tenantFilter, setTenantFilter, tenantsList,
  clientFilter, setClientFilter, clientsList,
  sellerFilter, setSellerFilter, sellers,
}: PipelineFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {(comercialFunis.length > 0 || sdrFunis.length > 0) && (
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl px-2 py-1.5 h-[38px]">
          {comercialFunis.length === 1 ? (
            <button
              onClick={() => { setCurrentPipeline("comercial"); setSelectedFunilId(comercialFunis[0].id); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPipeline === "comercial" ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-white"}`}
            >
              <Briefcase className="w-3 h-3" /> {comercialFunis[0].nome}
            </button>
          ) : comercialFunis.length > 1 ? (
            <div className={`flex items-center gap-1 px-2 rounded-lg ${currentPipeline === "comercial" ? "text-blue-400" : "text-slate-500"}`}>
              <Briefcase className="w-3 h-3" />
              <select
                value={selectedFunilId}
                onChange={(e) => { setCurrentPipeline("comercial"); setSelectedFunilId(e.target.value); }}
                className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer"
              >
                {comercialFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[var(--color-surface-elevated)] text-white">{f.nome}</option>)}
              </select>
            </div>
          ) : null}

          {comercialFunis.length > 0 && sdrFunis.length > 0 && <div className="w-px h-4 bg-white/10" />}

          {sdrFunis.length === 1 ? (
            <button
              onClick={() => { setCurrentPipeline("sdr"); setSelectedFunilId(sdrFunis[0].id); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${currentPipeline === "sdr" ? "bg-pink-600/20 text-pink-400" : "text-slate-500 hover:text-pink-400"}`}
            >
              <Zap className="w-3 h-3" /> {sdrFunis[0].nome}
            </button>
          ) : sdrFunis.length > 1 ? (
            <div className={`flex items-center gap-1 px-2 rounded-lg ${currentPipeline === "sdr" ? "text-pink-400" : "text-slate-500"}`}>
              <Zap className="w-3 h-3" />
              <select
                value={selectedFunilId}
                onChange={(e) => { setCurrentPipeline("sdr"); setSelectedFunilId(e.target.value); }}
                className="bg-transparent border-none focus:outline-none text-[10px] font-bold cursor-pointer"
              >
                {sdrFunis.map((f: any) => <option key={f.id} value={f.id} className="bg-[var(--color-surface-elevated)] text-white">{f.nome}</option>)}
              </select>
            </div>
          ) : null}
        </div>
      )}

      <div className="relative flex-1 min-w-[160px]">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar negócios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 w-full h-[38px]"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 px-3 rounded-xl border border-white/5 h-[38px]">
        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
        <select
          className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          {companiesList.map(c => <option key={c} value={c} className="bg-[var(--color-surface-elevated)]">{c === "Todos" ? "Todas as empresas" : c}</option>)}
        </select>
      </div>

      {isMaster && (
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 px-3 rounded-xl border border-white/5 h-[38px]">
          <Target className="w-3 h-3 text-blue-400 shrink-0" />
          <select
            className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
          >
            <option value="" className="bg-[var(--color-surface-elevated)]">Todos os parceiros</option>
            {(tenantsList as any[]).map(t => <option key={t.id} value={t.id} className="bg-[var(--color-surface-elevated)]">{t.name}</option>)}
          </select>
        </div>
      )}

      {clientsList.length > 0 && (
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 px-3 rounded-xl border border-white/5 h-[38px]">
          <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
          <select
            className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="Todos" className="bg-[var(--color-surface-elevated)]">Todos os clientes</option>
            {clientsList.map(c => <option key={c} value={c} className="bg-[var(--color-surface-elevated)]">{c}</option>)}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 px-3 rounded-xl border border-white/5 h-[38px]">
        <Filter className="w-3 h-3 text-slate-500 shrink-0" />
        <select
          className="bg-transparent border-none text-white focus:outline-none text-xs font-bold cursor-pointer"
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
        >
          {sellers.map(s => <option key={s} value={s} className="bg-[var(--color-surface-elevated)]">{s === "Todos" ? "Todos os vendedores" : s}</option>)}
        </select>
      </div>
    </div>
  );
}
