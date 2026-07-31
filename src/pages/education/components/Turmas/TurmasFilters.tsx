import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Search } from "lucide-react";

interface TurmasFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export function TurmasFilters({ search, onSearchChange }: TurmasFiltersProps) {
  return (
    <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border-white/5 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full group">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por turma, curso ou professor..."
          className="w-full bg-white/5 border-white/5 pl-12 h-12 rounded-xl text-sm italic text-white focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
          <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-lg">Cards</button>
          <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Lista</button>
        </div>
      </div>
    </Card>
  );
}
