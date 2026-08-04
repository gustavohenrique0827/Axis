import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";

export function AdminLogsTab() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-2">
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-xl font-mono text-[11px] sm:text-[12px] p-4 sm:p-6 overflow-hidden relative min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-8 bg-[var(--color-surface)] border-b border-white/5 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <span className="text-xs text-slate-500 ml-2 font-sans">systemd-journal</span>
        </div>
        <div className="mt-6 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-white/10 flex flex-col items-center justify-center py-20 text-sm text-slate-500 font-sans">
          Nenhum evento registrado.
        </div>
      </div>
    </div>
  );
}
