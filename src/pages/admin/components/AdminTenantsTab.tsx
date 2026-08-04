import { Search, Server } from "lucide-react";

export function AdminTenantsTab() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
        <div className="relative w-full sm:w-96 opacity-50">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            disabled
            type="text"
            placeholder="Buscar tenant por ID, Nome ou Domínio..."
            className="w-full bg-[var(--color-surface-elevated)] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)]/80 rounded-xl border border-white/10 overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Server className="w-8 h-8 text-slate-500" />
          <span className="text-sm text-slate-500">Módulo Multi-Tenant Pendente</span>
        </div>
      </div>
    </div>
  );
}
