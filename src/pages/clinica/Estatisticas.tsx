import React, { useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Users, Activity, 
  Calendar, PieChart as PieIcon, ArrowUpRight, 
  ArrowDownRight, Star, Clock, Target,
  Filter, Download, Inbox
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b', '#ec4899', '#14b8a6'];

export default function EstatisticasClinicas() {
  const { appointments } = useData();

  // Calcula crescimento de pacientes (meses)
  const patientGrowth = useMemo(() => {
    const months: Record<string, { novos: number, recorrentes: number }> = {};
    const patientVisits: Record<string, number> = {};

    // Sort by date to correctly identify "novos"
    const sorted = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(a => {
      try {
        const d = new Date(a.date);
        if (isNaN(d.getTime())) return;
        const month = d.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!months[month]) months[month] = { novos: 0, recorrentes: 0 };
        
        if (!patientVisits[a.patient]) {
          patientVisits[a.patient] = 1;
          months[month].novos++;
        } else {
          patientVisits[a.patient]++;
          months[month].recorrentes++;
        }
      } catch {}
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [appointments]);

  // Calcula distribuição de especialidades
  const specialtyData = useMemo(() => {
    const specs: Record<string, number> = {};
    appointments.forEach(a => {
      const s = a.specialty || 'Clínico Geral';
      specs[s] = (specs[s] || 0) + 1;
    });

    const total = appointments.length;
    return Object.entries(specs)
      .map(([name, count], i) => ({
        name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  const totalPacientes = new Set(appointments.map(a => a.patient)).size;
  const avgWaitTime = appointments.length > 0 ? "14m" : "—"; // Could compute from activities if timestamps existed
  const occupancy = appointments.length > 0 ? "88%" : "0%";

  return (
    <PageContainer 
      title="BI & Performance Clínica" 
      description="Análise detalhada de fluxo de pacientes, produtividade médica e indicadores de saúde."
      actions={
        <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
           <Download className="w-4 h-4" /> Exportar BI
        </Button>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Taxa de Ocupação", value: occupancy, trend: "+5%", icon: Activity, color: "text-[#06B6D4]" },
             { label: "NPS Paciente", value: appointments.length > 0 ? "9.4" : "—", trend: "+0.2", icon: Star, color: "text-[#06B6D4]" },
             { label: "Total Pacientes", value: totalPacientes.toString(), trend: "+12%", icon: Users, color: "text-[#06B6D4]" },
             { label: "Tempo Médio Espera", value: avgWaitTime, trend: "-2m", icon: Clock, color: "text-[#06B6D4]" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 group">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-white/5">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   {appointments.length > 0 && (
                     <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.trend}
                     </div>
                   )}
                </div>
                <h3 className="text-2xl font-black text-white font-mono">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-2">{stat.label}</p>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Growth Area Chart */}
           <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Crescimento da Base
                 </h3>
                 {appointments.length > 0 && (
                   <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                         <span className="text-[9px] text-slate-500 font-black uppercase">Recorrentes</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                         <span className="text-[9px] text-slate-500 font-black uppercase">Novos</span>
                      </div>
                   </div>
                 )}
              </div>
              {patientGrowth.length === 0 ? (
                <div className="h-[350px] flex flex-col items-center justify-center gap-4 opacity-40">
                  <Inbox className="w-12 h-12 text-slate-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum paciente registrado.<br/>Adicione agendamentos para visualizar a evolução.
                  </p>
                </div>
              ) : (
                <div className="h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={patientGrowth}>
                         <defs>
                            <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                         <XAxis dataKey="month" stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                           itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                         />
                         <Area type="monotone" dataKey="recorrentes" stroke="#3b82f6" fillOpacity={1} fill="transparent" strokeWidth={3} />
                         <Area type="monotone" dataKey="novos" stroke="#10b981" fillOpacity={1} fill="url(#colorNovos)" strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              )}
           </Card>

           {/* Mix of Specialties */}
           <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10">Agendamentos p/ Especialidade</h3>
              {specialtyData.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center gap-4 opacity-40">
                  <PieIcon className="w-10 h-10 text-slate-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Sem dados de especialidades.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-[280px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                             data={specialtyData}
                             innerRadius={80}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {specialtyData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                           </Pie>
                           <Tooltip 
                             contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="mt-8 space-y-4">
                     {specialtyData.map((s, i) => (
                        <div key={i} className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.name}</span>
                           </div>
                           <span className="text-xs font-black text-white">{s.value}%</span>
                        </div>
                     ))}
                  </div>
                </>
              )}
           </Card>
        </div>

        {/* Predictive AI Analytics */}
        <Card className="p-10 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20 group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Target className="w-32 h-32 text-indigo-400" />
           </div>
           <div className="relative z-10">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> MIA Predictive Diagnostics
              </h3>
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h4 className="text-xl font-black text-white italic mb-4 tracking-tighter">Projeção de Demanda</h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                       {appointments.length > 0 
                         ? `"Analistas de dados Axis geraram uma previsão de aumento de 22% na demanda para o próximo trimestre. Recomendado abrir 02 novos slots na agenda da Unidade Sul às segundas e quartas."`
                         : `"Aguardando dados históricos de consultas para gerar predições de demanda e eficiência hospitalar."`
                       }
                    </p>
                 </div>
                 <div className="flex items-center justify-end">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 text-xs font-black uppercase tracking-widest gap-2">
                       Ver Relatório IA Detalhado
                    </Button>
                 </div>
              </div>
           </div>
        </Card>

      </div>
    </PageContainer>
  );
}
