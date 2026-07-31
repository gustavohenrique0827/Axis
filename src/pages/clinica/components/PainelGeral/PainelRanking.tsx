import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Activity, Users, Heart } from "lucide-react";

interface DoctorRank { name: string; patients: number; }

interface PainelRankingProps {
  doctorRanking: DoctorRank[];
  totalAppointments: number;
  finalized: number;
}

export function PainelRanking({ doctorRanking, totalAppointments, finalized }: PainelRankingProps) {
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Ranking de Performance Clínica
          </h3>
          <span className="text-[10px] text-slate-500 font-black uppercase italic">Por agendamentos</span>
        </div>
        {doctorRanking.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
            <Users className="w-8 h-8 text-slate-500" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum médico cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctorRanking.map((dr, i) => (
              <div key={i} className="grid grid-cols-4 items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-emerald-400 transition-colors">
                    {dr.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{dr.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic">Especialista</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Pacientes</p>
                  <p className="text-sm font-black text-white font-mono">{dr.patients}</p>
                </div>
                <div className="text-right px-4">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-[9px] font-black text-white">{Math.round((dr.patients / Math.max(totalAppointments, 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.round((dr.patients / Math.max(totalAppointments, 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-8 bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
          <Heart className="w-20 h-20 text-purple-400" />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em] mb-6">Índice de Retorno</h3>
          <div className="text-5xl font-black text-white font-mono italic tracking-tighter">
            {totalAppointments > 0 ? `${Math.round((finalized / totalAppointments) * 100)}` : '0'}<span className="text-xl text-slate-600">%</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 leading-relaxed">Consultas finalizadas sobre total agendado.</p>
        </div>
        <Button variant="outline" className="w-full border-purple-500/20 text-[10px] font-black h-12 rounded-2xl hover:bg-purple-500/10 mt-10">
          Gerenciar Recalls ↗
        </Button>
      </Card>
    </div>
  );
}
