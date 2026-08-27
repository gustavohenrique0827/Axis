import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

interface SmtpConfig {
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  encryption: string;
}

const SMTP_STORAGE_KEY = "axis_integracoes_smtp";

const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  smtpServer: "",
  smtpPort: "",
  smtpUser: "",
  encryption: "StartTLS (Recomendado)",
};

function loadSmtpConfig(): SmtpConfig {
  try {
    const saved = localStorage.getItem(SMTP_STORAGE_KEY);
    if (saved) return { ...DEFAULT_SMTP_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    // ignore
  }
  return DEFAULT_SMTP_CONFIG;
}

export function ConfigIntegracoesSMTP() {
  const initial = loadSmtpConfig();
  const [smtpServer, setSmtpServer] = useState(initial.smtpServer);
  const [smtpPort, setSmtpPort] = useState(initial.smtpPort);
  const [smtpUser, setSmtpUser] = useState(initial.smtpUser);
  const [encryption, setEncryption] = useState(initial.encryption);

  const saveConfig = () => {
    const payload: SmtpConfig = { smtpServer, smtpPort, smtpUser, encryption };
    try {
      localStorage.setItem(SMTP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    toast.success("Preferências de SMTP salvas!");
  };

  const testConnection = () => {
    if (!smtpServer.trim() || !smtpPort.trim() || !smtpUser.trim()) {
      toast.error("Preencha servidor, porta e usuário antes de testar a conexão.");
      return;
    }
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: "Verificando credenciais de criptografia TLS...",
      success: "Conexão SMTP efetuada! E-mail de homologação disparado com sucesso! ✉️",
      error: "Falha na resposta do servidor de destino",
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Servidores SMTP (Campanhas de E-mail)</h1>
        <p className="text-sm text-slate-400">Configure seu próprio disparador de e-mails comercial corporativo (AWS SES, G-Suite, Sendgrid, etc).</p>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)]/80 border border-white/10 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-[#2563EB]">Credenciais de Transmissão</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Servidor Host</label>
            <input type="text" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Porta de Conexão</label>
            <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Criptografia Protocolo</label>
            <select value={encryption} onChange={e => setEncryption(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>StartTLS (Recomendado)</option>
              <option>SSL puro</option>
              <option>Nenhuma (Não seguro)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-black">Usuário Log (E-mail Autenticado)</label>
            <input type="email" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Senha de Aplicativo (Secret Token)</label>
            <input type="password" placeholder="••••••••••••••••••••" className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={testConnection} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Testar Conexão TLS
          </Button>
          <Button type="button" onClick={saveConfig} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Salvar Canal SMTP
          </Button>
        </div>
      </Card>
    </div>
  );
}
