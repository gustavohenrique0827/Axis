import { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ShieldCheck, HardDrive, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ConfigSistemaBackups() {
  const [scheduleTime, setScheduleTime] = useState("02:00 Semanal");
  const [lastBackupDate, setLastBackupDate] = useState("Hoje às 03:00");

  const runImmediateBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Compactando tabelas do banco de dados e preparando instantâneo...",
        success: "Snapshot criptografado salvo com sucesso! Backup pronto para download.",
        error: "Falha na criação do snapshot"
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Políticas de Backups & Segurança <ShieldCheck className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Garanta a integridade operacional da sua empresa programando cópias de segurança criptografadas em nuvem.
        </p>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" /> Armazenamento Cloud Seguro
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
            Snapshot Incremental Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Frequência Programada</label>
            <select 
              value={scheduleTime} 
              onChange={(e) => setScheduleTime(e.target.value)} 
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option>Diariamente às 02:00h</option>
              <option>Semanalmente (Aos domingos)</option>
              <option>Mensal (Primeiro dia do mês)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Destinatário Storage Cloud</label>
            <select className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none">
              <option>AWS S3 Bucket (Criptografado AES-256)</option>
              <option>Google Cloud Storage (GCS)</option>
              <option>SFTP Server Interno</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] p-4 rounded-[var(--radius-control)] text-xs space-y-2">
          <div className="text-[var(--color-text-muted)] flex justify-between">
            <span>Último snapshot gerado:</span>
            <strong className="text-[var(--color-text-primary)] font-mono">{lastBackupDate}</strong>
          </div>
          <div className="text-[var(--color-text-muted)] flex justify-between">
            <span>Tamanho do volume compactado:</span>
            <strong className="text-[var(--color-text-primary)] font-mono">14.2 MB (.tar.gz)</strong>
          </div>
          <div className="text-[var(--color-text-muted)] flex justify-between">
            <span>Criptografia da assinatura:</span>
            <strong className="text-emerald-500 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SHA-512 Ativa
            </strong>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap justify-end gap-2 text-xs">
          <Button 
            type="button" 
            variant="outline"
            onClick={runImmediateBackup} 
            className="h-9 px-4 text-xs font-bold gap-1.5 border-[var(--color-border-default)]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Criar Snapshot Agora
          </Button>
          <Button 
            type="button" 
            onClick={() => toast.success("Configuração de backup salva com sucesso!")} 
            className="h-9 px-5 text-xs font-bold shadow-xs"
          >
            Salvar Políticas
          </Button>
        </div>
      </Card>
    </div>
  );
}
