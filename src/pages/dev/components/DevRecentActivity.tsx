import { Card } from "../../../components/ui/card";
import { GitBranch } from "lucide-react";

const recentActivity: { type: string; message: string; time: string; color: string; icon: React.ElementType }[] = [];

export function DevRecentActivity() {
  return (
    <Card className="lg:col-span-2 bg-[#111827]/80 border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-400" /> Atividade Recente
        </h3>
        <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:underline">
          Ver tudo
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {recentActivity.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
            <div className="p-2 rounded-xl bg-white/5 shrink-0">
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{item.message}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
        {recentActivity.length === 0 && (
          <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
            Nenhuma atividade registrada.
          </div>
        )}
      </div>
    </Card>
  );
}
