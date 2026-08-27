import { Building2, Search, ChevronDown, CheckCircle2, Building } from "lucide-react";

interface ClientSelectorBlockProps {
  clientSearch: string;
  setClientSearch: (v: string) => void;
  selectedClientId: string;
  selectedClientName: string;
  showClientDropdown: boolean;
  setShowClientDropdown: (v: boolean) => void;
  filteredClients: any[];
  handleSelectClient: (c: any) => void;
  clearClient: () => void;
  clienteBase: any[] | undefined;
}

export function ClientSelectorBlock({
  clientSearch, setClientSearch, selectedClientId, selectedClientName,
  showClientDropdown, setShowClientDropdown, filteredClients,
  handleSelectClient, clearClient, clienteBase,
}: ClientSelectorBlockProps) {
  return (
    <div className="space-y-3 p-4 bg-[var(--color-primary-blue)]/5 border border-[var(--color-primary-blue)]/20 rounded-[var(--radius-control)]">
      <label className="text-xs font-black text-[var(--color-primary-blue)] uppercase tracking-wider flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5" /> Vincular a Cliente da Base
        <span className="ml-auto text-[10px] text-[var(--color-text-faint)] font-normal normal-case">
          Opcional — auto-preenche dados
        </span>
      </label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)] pointer-events-none" />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setShowClientDropdown(true);
              if (!e.target.value) clearClient();
            }}
            onFocus={() => setShowClientDropdown(true)}
            onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
            placeholder={
              clienteBase && clienteBase.length > 0
                ? `Buscar entre ${clienteBase.length} clientes...`
                : "Nenhum cliente cadastrado ainda"
            }
            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] pl-9 pr-9 py-2 text-[var(--color-text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all placeholder:text-[var(--color-text-faint)]"
          />
          {selectedClientId ? (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)] pointer-events-none" />
          )}
        </div>

        {showClientDropdown && filteredClients.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] shadow-xl max-h-48 overflow-y-auto">
            {filteredClients.map((c: any) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => handleSelectClient(c)}
                className="w-full text-left px-3 py-2 hover:bg-[var(--color-surface-sunken)] transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
              >
                <Building className="w-3.5 h-3.5 text-[var(--color-text-faint)] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{c.name || c.nome}</p>
                  {c.cnpj && <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{c.cnpj}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedClientId && (
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado: {selectedClientName}
          <button
            type="button"
            onClick={clearClient}
            className="ml-2 text-[var(--color-text-faint)] hover:text-rose-500 bg-transparent border-none cursor-pointer text-xs"
          >
            ✕ desvincular
          </button>
        </p>
      )}
    </div>
  );
}
