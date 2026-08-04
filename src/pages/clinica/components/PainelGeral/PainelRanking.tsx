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
      <Card className="lg:col-span-3 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Ranking de Performance Clínica
          </h3>
          <span className="text-xs text-slate-500">Por agendamentos</span>
        </div>
        {doctorRanking.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 opacity-40">
            <Users className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-500 text-center">Nenhum médico cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctorRanking.map((dr, i) => (
              <div key={i} className="grid grid-cols-4 items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                    {dr.name[0]}
                  </div>
                  <div>
                    <p className="text-sm text-white">{dr.name}</p>
                    <p className="text-xs text-slate-500">Especialista</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Pacientes</p>
                  <p className="text-sm text-white">{dr.patients}</p>
                </div>
                <div className="text-right px-4">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-xs text-white">{Math.round((dr.patients / Math.max(totalAppointments, 1)) * 100)}%</span>
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

      <Card className="p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Índice de Retorno
          </h3>
          <div className="text-4xl font-semibold text-white">
            {totalAppointments > 0 ? `${Math.round((finalized / totalAppointments) * 100)}` : '0'}<span className="text-lg text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">Consultas finalizadas sobre total agendado.</p>
        </div>
        <Button variant="outline" className="w-full mt-8">
          Gerenciar Recalls
        </Button>
      </Card>
    </div>
  );
}
