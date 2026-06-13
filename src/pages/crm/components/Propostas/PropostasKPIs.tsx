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
      bg: "bg-blue-500/10",
    },
    {
      label: "Convertidas (Mês)",
      value: propostas.filter(p => p.status === 'Aceita').reduce((acc, c) => acc + parseVal(c.valor), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Taxa de Conversão",
      value: propostas.length > 0 ? Math.round((propostas.filter(p => p.status === 'Aceita').length / propostas.length) * 100) + "%" : "0%",
      icon: ArrowUpRight,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Propostas Ativas",
      value: propostas.length.toString(),
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 bg-[#111827]/80 border-white/5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-black text-white italic">{stat.value}</div>
          </div>
          <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
        </Card>
      ))}
    </div>
  );
}
