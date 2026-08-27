import { Card } from "../../../../components/ui/card";
import { Send, CheckCircle2, ArrowUpRight, FileText } from "lucide-react";

interface Proposta {
  id: string;
  cliente: string;
  titulo: string;
  valor: number;
  status: string;
  vendedor: string;
}

export function PropostasKPIs({ propostas }: { propostas: Proposta[] }) {
  const stats = [
    {
      label: "Aguardando Aceite",
      value: propostas.filter(p => p.status === 'Enviada').reduce((acc, c) => acc + (c.valor || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: Send,
      color: "text-info",
    },
    {
      label: "Convertidas (Mês)",
      value: propostas.filter(p => p.status === 'Aceita').reduce((acc, c) => acc + (c.valor || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Taxa de Conversão",
      value: propostas.length > 0 ? Math.round((propostas.filter(p => p.status === 'Aceita').length / propostas.length) * 100) + "%" : "0%",
      icon: ArrowUpRight,
      color: "text-[var(--color-primary-blue)]",
    },
    {
      label: "Propostas Ativas",
      value: propostas.length.toString(),
      icon: FileText,
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
          <div className="text-2xl font-display font-black text-[var(--color-text-primary)] mb-1 italic">{stat.value}</div>
          <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
