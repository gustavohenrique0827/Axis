import { Card } from "../../../../components/ui/card";

export function KpiCards(props: {
  stats: Array<{ label: string; value: string | number; icon: React.ComponentType<any> }>;
}) {
  const { stats } = props;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-semibold text-white">{stat.value}</h3>
          </Card>
        );
      })}
    </div>
  );
}

