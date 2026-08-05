import { Search, Server } from "lucide-react";

export function AdminTenantsTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            disabled
            type="text"
            placeholder="Buscar tenant por ID, Nome ou Domínio..."
            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border-default)] overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Server className="w-8 h-8 text-[var(--color-text-faint)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Módulo Multi-Tenant Pendente</span>
        </div>
      </div>
    </div>
  );
}
