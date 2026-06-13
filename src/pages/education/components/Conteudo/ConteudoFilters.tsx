import { Card } from "../../../../components/ui/card";
import { Search, List as ListIcon, LayoutGrid } from "lucide-react";

interface ConteudoFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  viewMode: "Table" | "Kanban";
  onViewModeChange: (v: "Table" | "Kanban") => void;
}

const CATEGORIES = ["Todos", "Vídeo", "PDF", "Quiz"];

export function ConteudoFilters({
  search, onSearchChange,
  selectedCategory, onCategoryChange,
  viewMode, onViewModeChange,
}: ConteudoFiltersProps) {
  return (
    <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          placeholder="Buscar por título, curso ou palavra-chave..."
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border ${
                selectedCategory === cat
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/20"
                  : "text-slate-500 hover:text-white border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
          <button
            onClick={() => onViewModeChange("Table")}
            className={`p-2 rounded-xl transition-all ${viewMode === "Table" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-500"}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("Kanban")}
            className={`p-2 rounded-xl transition-all ${viewMode === "Kanban" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-500"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
