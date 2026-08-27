import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "../../../../components/ui/input";

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
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
        <Input
          type="text"
          placeholder="Buscar por nome, empresa ou e-mail..."
          value={props.searchQuery}
          onChange={(e) => props.setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl px-3 h-[42px]">
        <span className="text-[9px] uppercase font-bold text-[var(--color-text-faint)]">Temp:</span>
        <select
          value={props.temperatureFilter}
          onChange={(e) => props.setTemperatureFilter(e.target.value)}
          className="bg-transparent border-none text-xs text-[var(--color-text-primary)] focus:outline-none cursor-pointer font-bold"
        >
          <option value="Todas">Todas</option>
          <option value="quente">🔥 Quente</option>
          <option value="morno">☀️ Morno</option>
          <option value="frio">❄️ Frio</option>
        </select>
      </div>

      <button
        onClick={() => props.setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
        className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl px-3 h-[42px] text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
      >
        <ArrowUpDown className="w-3 h-3" />
        Temp {props.sortOrder === "desc" ? "▼" : "▲"}
      </button>
    </div>
  );
}
