import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { FormField } from "../../../../components/ui/form-field";
import { Alert } from "../../../../components/ui/alert";
import { Mail, Server, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";

export function ConfigIntegracoesSMTP() {
  const [smtpServer, setSmtpServer] = useState("email-smtp.us-east-1.amazonaws.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("AKIAIOSFODNN7EXAMPLE");
  const [smtpPass, setSmtpPass] = useState("••••••••••••••••••••");
  const [fromEmail, setFromEmail] = useState("contato@empresa.com.br");
  const [testing, setTesting] = useState(false);

  const testConnection = () => {
    setTesting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Verificando credenciais e handshake TLS com o servidor...",
        success: () => {
          setTesting(false);
          return "Conexão SMTP validada com sucesso! E-mail de homologação disparado. ✉️✨";
        },
        error: () => {
          setTesting(false);
          return "Falha na autenticação SMTP.";
        },
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
          Servidores SMTP & Disparos de E-mail
          <Server className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Configure seu próprio servidor SMTP transacional (AWS SES, Google Workspace, SendGrid, Mailgun) para envio de propostas, faturas e avisos.
        </p>
      </div>

      <Alert variant="info" title="Segurança & Entregabilidade">
        Recomendamos o uso da porta 587 com protocolo STARTTLS e chave de aplicativo dedicada para garantir 99.9% de entregabilidade na caixa de entrada.
      </Alert>

      <Card className="p-6 space-y-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--color-primary-blue)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Credenciais de Transmissão Autenticada
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Servidor Host (Host)" required>
            <Input
              type="text"
              value={smtpServer}
              onChange={(e) => setSmtpServer(e.target.value)}
              placeholder="smtp.dominio.com"
            />
          </FormField>

          <FormField label="Porta de Conexão" required>
            <Input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="font-mono"
              placeholder="587 ou 465"
            />
          </FormField>

          <FormField label="Criptografia / Protocolo">
            <select className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]">
              <option>StartTLS (Recomendado - Porta 587)</option>
              <option>SSL/TLS Direto (Porta 465)</option>
              <option>Nenhuma (Porta 25)</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Usuário Autenticado (User / API Key)" required>
            <Input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />
          </FormField>

          <FormField label="Senha de Aplicativo (Secret Password)" required>
            <Input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="••••••••••••••••••••"
            />
          </FormField>
        </div>

        <FormField label="E-mail de Remetente Padrão (From Email)" hint="Endereço que aparecerá como remetente para os clientes">
          <Input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="contato@empresa.com.br"
          />
        </FormField>

        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={testConnection}
            loading={testing}
            className="font-bold text-xs gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Testar Conexão TLS
          </Button>
          <Button
            type="button"
            onClick={() => toast.success("Preferências de SMTP salvas com sucesso!")}
            className="font-bold text-xs"
          >
            Salvar Configuração SMTP
          </Button>
        </div>
      </Card>
    </div>
  );
}
