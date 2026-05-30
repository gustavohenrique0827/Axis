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
    <Card className="p-4 bg-[#111827]/60 border border-white/5 shadow-md flex flex-col gap-3 rounded-3xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por título ou contato do lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0B1120] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#2563EB] w-full"
          />
        </div>

        {/* Date Limit Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] border border-white/10 rounded-xl p-1.5 shrink-0 px-3 h-[38px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Até:</span>
          <input 
            type="date"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="bg-[#0B1120] text-white text-[11px] focus:outline-none border-none font-mono cursor-pointer"
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
            className="text-[11px] font-bold text-red-405 text-red-400 hover:text-red-300 border border-red-500/10 hover:bg-red-500/5 rounded-xl px-4 h-[38px] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Multi-selection Toggle Rails */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full border-t border-white/5 pt-2.5">
        {/* Multi Priority Select Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0B1120] border border-white/5 rounded-xl p-1 shrink-0">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2.5">Prioridades:</span>
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
                className={`text-[10.5px] font-black px-3 py-1 rounded-lg transition-all border cursor-pointer ${
                  isSelected 
                    ? p === 'Alta' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : p === 'Média' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-transparent text-slate-400 hover:text-white border-transparent'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Multi Type Select Tag Chips (Scrollbar scrollable wrapper) */}
        <div className="flex flex-1 items-center gap-1.5 bg-[#0B1120] border border-white/5 rounded-xl p-1 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-2.5 shrink-0">Tipos de Ação:</span>
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
                  className={`text-[10.5px] font-black px-3 py-1 rounded-lg transition-all whitespace-nowrap border cursor-pointer ${
                    isSelected 
                      ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
                      : 'bg-transparent text-slate-400 hover:text-white border-transparent'
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
