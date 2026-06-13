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
    <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
      <label className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5" /> Vincular a Cliente Existente
        <span className="ml-auto text-[9px] text-slate-500 font-normal normal-case tracking-normal">
          Opcional — preenche dados automaticamente
        </span>
      </label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
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
            className="w-full bg-[#0B1120]/60 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white text-xs focus:border-blue-500/40 focus:outline-none transition-all placeholder:text-slate-600"
          />
          {selectedClientId
            ? <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
            : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          }
        </div>

        {showClientDropdown && filteredClients.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-[#0d1626] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {filteredClients.map((c: any) => (
              <button
                key={c.id} type="button" onMouseDown={() => handleSelectClient(c)}
                className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
              >
                <Building className="w-3 h-3 text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{c.name || c.nome}</p>
                  {c.cnpj && <p className="text-[9px] text-slate-500 font-mono">{c.cnpj}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedClientId && (
        <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
          <CheckCircle2 className="w-3 h-3" /> Vinculado: {selectedClientName}
          <button type="button" onClick={clearClient} className="ml-2 text-slate-500 hover:text-rose-400 bg-transparent border-none cursor-pointer text-[10px]">
            ✕ desvincular
          </button>
        </p>
      )}
    </div>
  );
}
