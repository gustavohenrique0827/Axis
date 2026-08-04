import React from "react";
import { Card } from "../../../components/ui/card";
import { Search, Calendar } from "lucide-react";

interface TasksFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  deadlineFilter: string;
  setDeadlineFilter: (val: string) => void;
  selectedPriorities: string[];
  setSelectedPriorities: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TasksFilter({
  searchQuery,
  setSearchQuery,
  deadlineFilter,
  setDeadlineFilter,
  selectedPriorities,
  setSelectedPriorities,
  selectedTypes,
  setSelectedTypes
}: TasksFilterProps) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título ou contato do lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--color-surface)] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white/20 w-full"
          />
        </div>

        {/* Date Limit Filter */}
        <div className="flex items-center gap-1.5 bg-[var(--color-surface)] border border-white/10 rounded-xl p-1.5 shrink-0 px-3 h-[38px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Até:</span>
          <input
            type="date"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="bg-[var(--color-surface)] text-white text-xs focus:outline-none border-none cursor-pointer"
            title="Filtrar por data limite da tarefa"
          />
        </div>

        {/* Reset Filters */}
        {(searchQuery !== "" || selectedPriorities.length > 0 || selectedTypes.length > 0 || deadlineFilter !== "") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedPriorities([]);
              setSelectedTypes([]);
              setDeadlineFilter("");
            }}
            className="text-xs text-slate-400 hover:text-white border border-white/10 rounded-xl px-4 h-[38px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Multi-selection Toggle Rails */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full border-t border-white/5 pt-3">
        {/* Multi Priority Select Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--color-surface)] border border-white/5 rounded-xl p-1 shrink-0">
          <span className="text-xs text-slate-500 px-2.5">Prioridades:</span>
          {['Alta', 'Média', 'Baixa'].map(p => {
            const isSelected = selectedPriorities.includes(p);
            return (
              <button
                key={p}
                onClick={() => {
                  setSelectedPriorities(prev =>
                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                  );
                }}
                type="button"
                className={`text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Multi Type Select Tag Chips (Scrollbar scrollable wrapper) */}
        <div className="flex flex-1 items-center gap-1.5 bg-[var(--color-surface)] border border-white/5 rounded-xl p-1 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-500 px-2.5 shrink-0">Tipos de Ação:</span>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {["Reunião Presencial", "Call Online", "Acompanhamento (Follow-up)", "Demonstração", "Envio Docs", "Ligação"].map(t => {
              const isSelected = selectedTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTypes(prev =>
                      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                    );
                  }}
                  type="button"
                  className={`text-xs px-3 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
