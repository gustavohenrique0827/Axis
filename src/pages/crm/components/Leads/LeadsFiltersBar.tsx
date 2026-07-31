import { ArrowUpDown, Search } from "lucide-react";

export function LeadsFiltersBar(props: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  temperatureFilter: string;
  setTemperatureFilter: (v: string) => void;
  sortOrder: "desc" | "asc";
  setSortOrder: (v: "desc" | "asc" | ((prev: "desc" | "asc") => "desc" | "asc")) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome, empresa ou e-mail..."
          value={props.searchQuery}
          onChange={(e) => props.setSearchQuery(e.target.value)}
          className="bg-[var(--color-surface-elevated)]/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 w-full"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl px-3 h-[42px]">
        <span className="text-[9px] uppercase font-bold text-slate-500">Temp:</span>
        <select
          value={props.temperatureFilter}
          onChange={(e) => props.setTemperatureFilter(e.target.value)}
          className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer font-bold"
        >
          <option value="Todas">Todas</option>
          <option value="quente">🔥 Quente</option>
          <option value="morno">☀️ Morno</option>
          <option value="frio">❄️ Frio</option>
        </select>
      </div>

      <button
        onClick={() => props.setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
        className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl px-3 h-[42px] text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowUpDown className="w-3 h-3" />
        Temp {props.sortOrder === "desc" ? "▼" : "▲"}
      </button>
    </div>
  );
}

