import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Search, Filter } from "lucide-react";

interface AlunosFiltersProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
}

export function AlunosFilters({ searchTerm, onSearchChange }: AlunosFiltersProps) {
  return (
    <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou matrícula..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled className="h-12 w-12 p-0 rounded-2xl border-white/5 text-slate-500">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
