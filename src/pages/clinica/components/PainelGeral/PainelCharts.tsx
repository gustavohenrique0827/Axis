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
      <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400" /> Fluxo de Atendimento
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-medium">Volume de atendimentos por dia da semana.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] text-slate-400 font-bold uppercase">Compareceu</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[9px] text-slate-400 font-bold uppercase">Atrasado/Cancelado</span></div>
          </div>
        </div>
        {totalAppointments === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center gap-4 opacity-40">
            <Inbox className="w-10 h-10 text-slate-500" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Nenhum agendamento cadastrado ainda.</p>
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
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }} itemStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="consultas" stroke="#10b981" fillOpacity={1} fill="url(#colorConsultas)" strokeWidth={4} />
                <Area type="step" dataKey="noShow" stroke="#f43f5e" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" fill="#f43f5e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5 flex flex-col items-center justify-center">
        <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2 w-full">
          <Zap className="w-4 h-4 text-amber-400" /> Ocupação Hoje
        </h3>
        <div className="relative w-40 h-40 mb-8">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff05" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
              strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - occupancyPct / 100)}
              strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white font-mono">{occupancyPct}<span className="text-sm text-slate-600">%</span></span>
            <span className="text-[9px] text-slate-500 font-black uppercase">Confirmados</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {[
            { label: 'Total', value: totalAppointments, color: 'text-white' },
            { label: 'Ativos', value: confirmed, color: 'text-emerald-400' },
            { label: 'Finalizados', value: finalized, color: 'text-blue-400' },
            { label: 'Atrasados', value: late, color: 'text-rose-400' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 bg-white/5 rounded-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{s.label}</p>
              <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
