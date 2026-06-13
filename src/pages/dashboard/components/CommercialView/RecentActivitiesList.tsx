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
    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">{message}</p>
    </div>
  );
}

export function RecentActivitiesList({ recentActivities }: { recentActivities: Activity[] }) {
  const hasActivities = recentActivities.length > 0;

  return (
    <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 rounded-3xl">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" /> Atividades Recentes
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-black uppercase">Live</span>
          </div>
        </div>
      </div>
      {!hasActivities ? (
        <EmptyState icon={Zap} message="Nenhuma atividade registrada ainda. Registre ligações, reuniões e e-mails nos leads." />
      ) : (
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Zap;
            return (
              <div key={activity.id} className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <div className="p-3 rounded-2xl bg-blue-400/10 text-blue-400 shrink-0 shadow-lg">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[13px] font-black text-white group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{activity.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
