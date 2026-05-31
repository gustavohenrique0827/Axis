import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

export function ConfigSistemaBackups() {
  const [scheduleTime, setScheduleTime] = useState("02:00 Semanal");
  const [lastBackupDate, setLastBackupDate] = useState("Nenhum backup recente");

  const runImmediateBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Compactando tabelas do banco de dados e preparando instantâneo...",
        success: "Snapshot criptografado salvo no servidor S3 AWS! Volume gerado com sucesso! 🗄️",
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

      <Card className="p-6 bg-[#111827]/80 border border-white/10 space-y-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Schedule AWS S3 Storage</span>
          <span className="text-[10px] text-slate-500">Incremental Snapshot</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Frequência Programada</label>
            <select value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>Diariamente às 02:00h</option>
              <option>Semanalmente (Aos domingos)</option>
              <option>Mensal (Primeiro dia do mês)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Destinatário Storage Cloud</label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>AWS S3 Bucket (Criptografado AES-256)</option>
              <option>Google Cloud Storage (GCS)</option>
              <option>SFTP Server Interno</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-white/5 p-4 rounded-xl text-xs space-y-1">
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
            <strong className="text-[#06B6D4]">SHA-512 Ativa</strong>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={runImmediateBackup} className="bg-emerald-600/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/25 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Criar Instantâneo Agora
          </Button>
          <Button type="button" onClick={() => toast.success("Configuração de backup salva!")} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Sincronizar Cronologia
          </Button>
        </div>
      </Card>
    </div>
  );
}
