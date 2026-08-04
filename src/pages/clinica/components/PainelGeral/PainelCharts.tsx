import { Card } from "../../../../components/ui/card";
import { Clock, Zap, Inbox } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDay { name: string; consultas: number; noShow: number; }

interface PainelChartsProps {
  clinicData: ChartDay[];
  totalAppointments: number;
  confirmed: number;
  finalized: number;
  late: number;
  occupancyPct: number;
}

export function PainelCharts({ clinicData, totalAppointments, confirmed, finalized, late, occupancyPct }: PainelChartsProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h3 className="text-sm text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Fluxo de Atendimento
            </h3>
            <p className="text-xs text-slate-500 mt-1">Volume de atendimentos por dia da semana.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-xs text-slate-400">Compareceu</span></div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500" /><span className="text-xs text-slate-400">Atrasado/Cancelado</span></div>
          </div>
        </div>
        {totalAppointments === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center gap-4 opacity-40">
            <Inbox className="w-10 h-10 text-slate-500" />
            <p className="text-xs text-slate-500 text-center">Nenhum agendamento cadastrado ainda.</p>
          </div>
        ) : (
          <div className="h-[320px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clinicData}>
                <defs>
                  <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '12px' }} itemStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="consultas" stroke="#10b981" fillOpacity={1} fill="url(#colorConsultas)" strokeWidth={2} />
                <Area type="step" dataKey="noShow" stroke="#64748b" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" fill="#64748b" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-6 flex flex-col items-center justify-center">
        <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2 w-full">
          <Zap className="w-4 h-4" /> Ocupação Hoje
        </h3>
        <div className="relative w-36 h-36 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff0d" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
              strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - occupancyPct / 100)}
              strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-white">{occupancyPct}<span className="text-sm text-slate-500">%</span></span>
            <span className="text-xs text-slate-500">Confirmados</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { label: 'Total', value: totalAppointments, color: 'text-white' },
            { label: 'Ativos', value: confirmed, color: 'text-white' },
            { label: 'Finalizados', value: finalized, color: 'text-white' },
            { label: 'Atrasados', value: late, color: 'text-red-400' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
