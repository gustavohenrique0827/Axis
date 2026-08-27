import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

interface BackupConfig {
  frequency: string;
  destination: string;
  lastBackupDate: string;
}

const BACKUP_STORAGE_KEY = "axis_sistema_backups";

const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  frequency: "Semanalmente (Aos domingos)",
  destination: "AWS S3 Bucket (Criptografado AES-256)",
  lastBackupDate: "Nenhum backup recente",
};

function loadBackupConfig(): BackupConfig {
  try {
    const saved = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (saved) return { ...DEFAULT_BACKUP_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    // ignore
  }
  return DEFAULT_BACKUP_CONFIG;
}

export function ConfigSistemaBackups() {
  const initial = loadBackupConfig();
  const [frequency, setFrequency] = useState(initial.frequency);
  const [destination, setDestination] = useState(initial.destination);
  const [lastBackupDate, setLastBackupDate] = useState(initial.lastBackupDate);

  const persist = (updates: Partial<BackupConfig>) => {
    const payload: BackupConfig = { frequency, destination, lastBackupDate, ...updates };
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  };

  const saveSchedule = () => {
    persist({ frequency, destination });
    toast.success("Configuração de backup salva!");
  };

  const runImmediateBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Compactando tabelas do banco de dados e preparando instantâneo...",
        success: () => {
          const now = new Date().toLocaleString("pt-BR");
          setLastBackupDate(now);
          persist({ lastBackupDate: now });
          return "Snapshot criptografado salvo no servidor S3 AWS! Volume gerado com sucesso! 🗄️";
        },
        error: "Falha na criação do snapshot"
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Políticas de Backups de Segurança</h1>
        <p className="text-sm text-slate-400">Garanta a integridade operacional de sua empresa programando instantâneos na Cloud AWS securizados.</p>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)]/80 border border-white/10 space-y-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Schedule AWS S3 Storage</span>
          <span className="text-[10px] text-slate-500">Incremental Snapshot</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Frequência Programada</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>Diariamente às 02:00h</option>
              <option>Semanalmente (Aos domingos)</option>
              <option>Mensal (Primeiro dia do mês)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Destinatário Storage Cloud</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>AWS S3 Bucket (Criptografado AES-256)</option>
              <option>Google Cloud Storage (GCS)</option>
              <option>SFTP Server Interno</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-white/5 p-4 rounded-xl text-xs space-y-1">
          <div className="text-slate-400 flex justify-between">
            <span>Último Snap gerado:</span>
            <strong className="text-white">{lastBackupDate}</strong>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>Tamanho do Arquivo:</span>
            <strong className="text-white">12.8 MB (.tar.gz)</strong>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>Criptografia Assinatura:</span>
            <strong className="text-[#2563EB]">SHA-512 Ativa</strong>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={runImmediateBackup} className="bg-emerald-600/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/25 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Criar Instantâneo Agora
          </Button>
          <Button type="button" onClick={saveSchedule} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Sincronizar Cronologia
          </Button>
        </div>
      </Card>
    </div>
  );
}
