import { ShieldCheck, HardDrive, ExternalLink } from "lucide-react";
import { Card } from "../../../components/ui/card";

// Esta tela mostrava um painel inteiro de "backup" que não fazia nada:
// destino de storage (S3/GCS/SFTP), botão "Criar Snapshot Agora" e um card
// com data/tamanho/checksum SHA-512 fixos — nenhum backup nunca foi
// disparado por nenhum desses controles. O armazenamento real deste sistema
// é o Postgres gerenciado pelo Supabase, que já faz backup automático (e
// Point-in-Time Recovery nos planos pagos) na infraestrutura deles — não faz
// sentido fingir um sistema de backup próprio por cima disso. Esta versão
// só descreve a realidade e aponta pra onde o backup de fato é gerenciado.
export function ConfigSistemaBackups() {
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Backups & Segurança do Banco de Dados <ShieldCheck className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          O banco de dados deste sistema roda no Supabase, que gerencia backup e recuperação na própria infraestrutura.
        </p>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-500" /> Onde o backup é gerenciado
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          O Supabase realiza backups automáticos do banco de dados de acordo com o plano contratado do projeto
          (backups diários e, em planos superiores, Point-in-Time Recovery). Este painel do S.P.Y. CRM não controla
          nem substitui isso — a configuração e restauração de backups fica no painel do próprio Supabase.
        </p>
        <a
          href="https://supabase.com/docs/guides/platform/backups"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-blue)] hover:underline"
        >
          Ver documentação de backups do Supabase <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </Card>
    </div>
  );
}
