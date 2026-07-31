import { useState } from "react";
import { Search, Grid, List, Trash2, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Card } from "../../../../components/ui/card";

interface ProdutosFiltersProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (cat: string) => void;
  types: string[];
  selectedTypes: string[];
  onTypeToggle: (tp: string) => void;
  selectedStatus: string;
  onStatusChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  selectedIds: string[];
  filteredCount: number;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
}

export function ProdutosFilters({
  searchTerm, onSearchChange,
  categories, selectedCategories, onCategoryToggle,
  types, selectedTypes, onTypeToggle,
  selectedStatus, onStatusChange,
  sortBy, onSortByChange,
  viewMode, onViewModeChange,
  selectedIds, filteredCount,
  onBulkActivate, onBulkDeactivate, onBulkDelete,
}: ProdutosFiltersProps) {
  const activeAdvancedCount = selectedCategories.length + selectedTypes.length;
  const [showAdvanced, setShowAdvanced] = useState(activeAdvancedCount > 0);

  return (
    <Card className="bg-[var(--color-surface-elevated)]/80 border-[var(--color-border-subtle)] p-4 shadow-xl">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar por SKU, nome ou fornecedor..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] font-medium focus:outline-none focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/40"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors border ${
                activeAdvancedCount > 0
                  ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ""}
              <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-[#2563EB]/40"
            >
              <option value="Todos">Qualquer Status</option>
              <option value="Ativos">Apenas Ativos</option>
              <option value="Inativos">Apenas Inativos</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-[#2563EB]/40"
            >
              <option value="name-asc">Ordem Alfabética A-Z</option>
              <option value="name-desc">Ordem Alfabética Z-A</option>
              <option value="price-desc">Maior Preço</option>
              <option value="price-asc">Menor Preço</option>
              <option value="margin-desc">Maior Margem Lucro</option>
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Categoria</span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {categories.filter(c => c !== "Todas").map(cat => (
                  <button
                    key={cat}
                    onClick={() => onCategoryToggle(cat)}
                    className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${selectedCategories.includes(cat) ? "bg-[#2563EB] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-white/10"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Tipo</span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {types.filter(t => t !== "Todos").map(tp => (
                  <button
                    key={tp}
                    onClick={() => onTypeToggle(tp)}
                    className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${selectedTypes.includes(tp) ? "bg-[#2563EB] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-white/10"}`}
                  >
                    {tp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{filteredCount} itens correspondentes</span>
            {selectedIds.length > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-[#2563EB] font-black">{selectedIds.length} selecionados</span>
              </>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex border border-[var(--color-border-default)] rounded-lg p-0.5 overflow-hidden">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-[var(--color-text-primary)] font-bold" : "text-[var(--color-text-muted)] hover:text-slate-300"}`}
                title="Visão Grade"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-[var(--color-text-primary)] font-bold" : "text-[var(--color-text-muted)] hover:text-slate-300"}`}
                title="Visão Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] p-1 rounded-xl flex items-center gap-1.5">
                <button
                  onClick={onBulkActivate}
                  className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase rounded"
                >
                  Ativar
                </button>
                <button
                  onClick={onBulkDeactivate}
                  className="px-2 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black uppercase rounded"
                >
                  Inativar
                </button>
                <button
                  onClick={onBulkDelete}
                  className="p-1 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"
                  title="Excluir Selecionados"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
