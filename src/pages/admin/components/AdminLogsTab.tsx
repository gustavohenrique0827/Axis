import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";

export function AdminLogsTab() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl font-mono text-xs p-4 sm:p-6 overflow-hidden relative min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-8 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-default)] flex items-center px-4">
          <span className="text-xs text-[var(--color-text-muted)] font-sans">systemd-journal</span>
        </div>
        <div className="mt-6 overflow-y-auto max-h-[350px] flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)] text-sm">
          Nenhum evento registrado.
        </div>
      </div>
    </div>
  );
}
