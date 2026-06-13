import { Card } from "../../../../components/ui/card";
import { Search } from "lucide-react";

interface CertificadosFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
}

export function CertificadosFilters({ search, onSearchChange }: CertificadosFiltersProps) {
  return (
    <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por aluno, curso ou código de autenticidade (HASH)..."
            className="w-full bg-white/5 border border-white/5 rounded-[22px] h-14 pl-14 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-medium italic"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
            <button className="px-5 py-2.5 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 rounded-xl border border-amber-500/20">Recentes</button>
            <button className="px-5 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-white">Mais Válidos</button>
          </div>
        </div>
      </div>
    </Card>
  );
}
