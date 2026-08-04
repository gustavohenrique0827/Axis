import { Card } from "../../../../components/ui/card";
import { Users, Flame, CheckCircle2 } from "lucide-react";

export function LeadsKpis(props: {
  stats: { total: number; hot: number; closed: number };
}) {
  const { stats } = props;
  const items = [
    { label: "Total", value: stats.total, icon: Users },
    { label: "Alta Prior.", value: stats.hot, icon: Flame },
    { label: "Ganhos", value: stats.closed, icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
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
