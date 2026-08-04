import { Card } from "../../../../components/ui/card";
import { Send, CheckCircle2, ArrowUpRight, FileText } from "lucide-react";

interface Proposta {
  id: string;
  cliente: string;
  titulo: string;
  valor: string;
  dataCriacao: string;
  vencimento: string;
  status: string;
  vendedor: string;
}

const parseVal = (v: string) => parseFloat(v.replace(/[^0-9.,]/g, '').replace(',', '.'));

export function PropostasKPIs({ propostas }: { propostas: Proposta[] }) {
  const stats = [
    {
      label: "Aguardando Aceite",
      value: propostas.filter(p => p.status === 'Enviada').reduce((acc, c) => acc + parseVal(c.valor), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: Send,
      color: "text-blue-500",
    },
    {
      label: "Convertidas (Mês)",
      value: propostas.filter(p => p.status === 'Aceita').reduce((acc, c) => acc + parseVal(c.valor), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Taxa de Conversão",
      value: propostas.length > 0 ? Math.round((propostas.filter(p => p.status === 'Aceita').length / propostas.length) * 100) + "%" : "0%",
      icon: ArrowUpRight,
      color: "text-indigo-500",
    },
    {
      label: "Propostas Ativas",
      value: propostas.length.toString(),
      icon: FileText,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
          <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
          <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
