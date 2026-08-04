import { Card } from '../../../../components/ui/card';
import { Eye, MessageSquare, Users, Zap, Target, AlertCircle } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  'Ligação': Users,
  'Reunião': Zap,
  'E-mail': MessageSquare,
  'Visita': Target,
  'Nota': AlertCircle,
};

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  seller?: string;
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function RecentActivitiesList({ recentActivities }: { recentActivities: Activity[] }) {
  const hasActivities = recentActivities.length > 0;

  return (
    <Card className="lg:col-span-2 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm text-slate-400 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Atividades Recentes
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
      {!hasActivities ? (
        <EmptyState icon={Zap} message="Nenhuma atividade registrada ainda. Registre ligações, reuniões e e-mails nos leads." />
      ) : (
        <div className="space-y-2">
          {recentActivities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Zap;
            return (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-lg bg-white/5 text-slate-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm text-white">{activity.title}</h4>
                    <span className="text-xs text-slate-500">{activity.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
