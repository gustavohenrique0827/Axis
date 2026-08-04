import { Card } from "../../../../components/ui/card";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ClientesKPIsProps {
  total: number;
  ativos: number;
  implantacao: number;
  inativos: number;
}

export function ClientesKPIs({ total, ativos, implantacao, inativos }: ClientesKPIsProps) {
  const items = [
    { label: "Total", value: total, icon: Users },
    { label: "Ativos", value: ativos, icon: CheckCircle2 },
    { label: "Em Implantação", value: implantacao, icon: Clock },
    { label: "Inativos", value: inativos, icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </div>
          <h3 className="text-2xl font-semibold text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
