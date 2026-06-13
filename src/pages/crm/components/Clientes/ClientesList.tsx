import { Card } from "../../../../components/ui/card";
import { Search, Building, Building2, MapPin, Phone, Mail, Trash2 } from "lucide-react";

interface Cliente {
  id: string;
  name: string;
  industry?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  status?: string;
}

interface ClientesListProps {
  clientes: Cliente[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  sectorFilter: string;
  onSectorChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onDelete: (id: string) => void;
}

export function ClientesList({
  clientes, searchQuery, onSearchChange,
  sectorFilter, onSectorChange, statusFilter, onStatusChange, onDelete,
}: ClientesListProps) {
  const filtered = clientes.filter(c => {
    if (statusFilter !== "Todos as situações" && c.status !== statusFilter) return false;
    if (sectorFilter !== "Todos os setores" && c.industry !== sectorFilter) return false;
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      return c.name?.toLowerCase().includes(term) ||
             c.email?.toLowerCase().includes(term) ||
             c.industry?.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
      {/* Filters bar */}
      <div className="p-4 border-b border-white/5 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none text-white"
          />
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => onSectorChange(e.target.value)}
          className="bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
        >
          <option>Todos os setores</option>
          <option>Tecnologia</option>
          <option>Engenharia</option>
          <option>Saúde</option>
          <option>Varejo</option>
          <option>Indústria</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
        >
          <option>Todos as situações</option>
          <option>Ativo</option>
          <option>Em Implantação</option>
          <option>Inativo</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">Setor</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Localização</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    {c.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wide">
                    {c.industry}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-600" /> {c.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-600" /> {c.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-600" /> {c.city}, {c.state}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border ${
                    c.status === "Ativo"          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    c.status === "Em Implantação" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    title="Remover Cliente"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Building className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">Nenhum cliente encontrado</p>
                  <p className="text-slate-600 text-xs mt-1">Ajuste os filtros ou cadastre um novo cliente</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-white/5">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.01] transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-bold text-white text-sm truncate">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border ${
                  c.status === "Ativo"          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  c.status === "Em Implantação" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                  "bg-slate-500/10 text-slate-400 border-slate-500/20"
                }`}>{c.status}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-slate-400">{c.industry}</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="w-3 h-3" /> {c.city}, {c.state}</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-600 shrink-0" /><span className="truncate">{c.email}</span></div>
              <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-600 shrink-0" /><span>{c.phone}</span></div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Building className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Nenhum cliente cadastrado</p>
          </div>
        )}
      </div>
    </Card>
  );
}
