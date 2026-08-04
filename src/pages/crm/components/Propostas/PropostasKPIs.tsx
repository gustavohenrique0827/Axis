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
    },
    {
      label: "Convertidas (Mês)",
      value: propostas.filter(p => p.status === 'Aceita').reduce((acc, c) => acc + parseVal(c.valor), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: CheckCircle2,
    },
    {
      label: "Taxa de Conversão",
      value: propostas.length > 0 ? Math.round((propostas.filter(p => p.status === 'Aceita').length / propostas.length) * 100) + "%" : "0%",
      icon: ArrowUpRight,
    },
    {
      label: "Propostas Ativas",
      value: propostas.length.toString(),
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <stat.icon className="w-4 h-4" />
            <span className="text-xs">{stat.label}</span>
          </div>
          <div className="text-2xl font-semibold text-white">{stat.value}</div>
        </Card>
      ))}
    </div>
  );
}
