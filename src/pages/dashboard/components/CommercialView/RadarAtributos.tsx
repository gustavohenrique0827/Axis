import { Card } from '../../../../components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Eye } from 'lucide-react';

interface SalesEntry {
  name: string;
  total: number;
  deals: number;
  rate: number;
}

interface RadarAtributosProps {
  salesRanking: SalesEntry[];
  funnelLeadsCount: number;
}

export function RadarAtributos({ salesRanking, funnelLeadsCount }: RadarAtributosProps) {
  const top = salesRanking[0];

  const radarData = [
    { subject: 'Velocidade', A: top ? Math.min(150, top.rate * 1.5) : 0, fullMark: 150 },
    { subject: 'Ticket Médio', A: top ? Math.min(150, (top.total / Math.max(top.deals, 1)) / 1000) : 0, fullMark: 150 },
    { subject: 'Volume', A: top ? Math.min(150, top.deals * 10) : 0, fullMark: 150 },
    { subject: 'Qualidade', A: top ? Math.min(150, top.rate) : 0, fullMark: 150 },
    { subject: 'Saúde CRM', A: Math.min(150, funnelLeadsCount * 5), fullMark: 150 },
  ];

  return (
    <Card className="p-8 bg-[#111827]/80 border-white/5 lg:col-span-1 rounded-3xl">
      <h3 className="text-xs font-black text-slate-400 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
        <Eye className="w-4 h-4 text-purple-400" /> Radar de Atributos
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#64748b20" />
            <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontStyle="bold" />
            <Radar name="Top Closers" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Seu Time</span>
        </div>
      </div>
    </Card>
  );
}
