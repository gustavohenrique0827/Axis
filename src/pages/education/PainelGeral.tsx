import React from 'react';
import { 
  GraduationCap, Users, BookOpen, Award, 
  TrendingUp, Activity, Star, Calendar,
  ArrowUpRight, ArrowDownRight, Clock,
  ArrowRight, CheckCircle2, AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell 
} from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";

const engagementData = [
  { day: 'Seg', acessos: 1240, completion: 820 },
  { day: 'Ter', acessos: 1560, completion: 940 },
  { day: 'Qua', acessos: 1380, completion: 880 },
  { day: 'Qui', acessos: 1820, completion: 1100 },
  { day: 'Sex', acessos: 1450, completion: 920 },
];

const courseShare = [
  { name: 'Software Eng', value: 45, color: '#3b82f6' },
  { name: 'Marketing', value: 25, color: '#10b981' },
  { name: 'Design', value: 20, color: '#8b5cf6' },
  { name: 'Gestão', value: 10, color: '#f59e0b' },
];

export default function PainelGeralEducation() {
  return (
    <PageContainer 
      title="BI Educacional & Dashboard Axis" 
      description="Visão 360º da operação pedagógica, métricas de engajamento e performance de tutores."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Calendar className="w-4 h-4" /> Filtro Mensal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
             Download BI
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Matrículas Ativas", value: "1,482", trend: "+12.5%", icon: Users, color: "text-blue-400" },
             { label: "Taxa de Conclusão", value: "78%", trend: "+2.3%", icon: CheckCircle2, color: "text-emerald-400" },
             { label: "Conteúdos Vistos", value: "42.8k", trend: "+18%", icon: BookOpen, color: "text-indigo-400" },
             { label: "NPS Acadêmico", value: "9.4", trend: "+0.1", icon: Star, color: "text-amber-400" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                      <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-2">{stat.label}</p>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Engagement Area Chart */}
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Engajamento do Aluno (Visualizações vs Conclusões)
                 </h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       <span className="text-[9px] text-slate-500 font-extrabold uppercase">Acessos</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       <span className="text-[9px] text-slate-500 font-extrabold uppercase">Conclusões</span>
                    </div>
                 </div>
              </div>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData}>
                       <defs>
                          <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="day" stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                         itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                       />
                       <Area type="monotone" dataKey="acessos" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAcessos)" strokeWidth={3} />
                       <Area type="monotone" dataKey="completion" stroke="#10b981" fillOpacity={1} fill="transparent" strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Course Split */}
           <Card className="p-8 bg-[#111827]/80 border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10">Matrículas por Área</h3>
              <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={courseShare}
                         innerRadius={80}
                         outerRadius={100}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {courseShare.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-2xl font-black text-white font-mono leading-none">1.4k</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Hub</div>
                 </div>
              </div>
              <div className="mt-8 space-y-3">
                 {courseShare.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                       <span className="font-extrabold text-slate-400 uppercase tracking-tight">{s.name}</span>
                       <span className="font-black text-white">{s.value}%</span>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Recently Active Classes Table */}
        <div className="grid lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 bg-[#111827]/80 border-white/5 overflow-hidden">
              <div className="p-6 border-bottom border-white/5 flex justify-between items-center">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" /> Turmas em Destaque (Alta Performance)
                 </h3>
                 <Button variant="ghost" className="h-8 text-[10px] font-black uppercase text-slate-500 hover:text-white">Ver Todas</Button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-10">Turma</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Professor</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso</th>
                          <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {[
                         { name: 'Engenharia Software T04', teacher: 'Carlos Mendes', progress: 85, status: 'Ativa' },
                         { name: 'UX Design Avançado', teacher: 'Amanda Silva', progress: 42, status: 'Ativa' },
                         { name: 'Growth Marketing', teacher: 'Ricardo Torres', progress: 12, status: 'Planejamento' },
                       ].map((t, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6 pl-10">
                               <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{t.name}</p>
                            </td>
                            <td className="p-6 text-xs text-slate-400 font-bold">{t.teacher}</td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-blue-500" style={{ width: `${t.progress}%` }} />
                                  </div>
                                  <span className="text-[10px] font-black text-white">{t.progress}%</span>
                               </div>
                            </td>
                            <td className="p-6 pr-10 text-right">
                               <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                 t.status === 'Ativa' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                               }`}>
                                  {t.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* Learning Alerts */}
           <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-20 h-20 text-white" />
                 </div>
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">MIA Pedagogic Insight</h4>
                 <p className="text-sm text-slate-200 leading-relaxed italic mb-8">
                    "Detectamos uma queda de 12% no engajamento da turma **UX Avançado** após o módulo de Prototipagem. Sugerimos agendar uma mentoria ao vivo para sanar dúvidas críticas."
                 </p>
                 <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-xs font-black uppercase tracking-widest">
                    Agendar Mentoria IA
                 </Button>
              </Card>

              <Card className="p-8 bg-[#111827]/80 border-white/5">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Próximos Certificados</h4>
                 <div className="space-y-4">
                    {[
                      { student: 'Ana Beatriz Rocha', course: 'Gestão Ágil', date: 'Amanhã' },
                      { student: 'Marcos Vinícius', course: 'Software Eng', date: '21 Mai' },
                    ].map((c, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                               <Award className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-xs font-black text-white">{c.student}</p>
                               <p className="text-[9px] text-slate-500 font-bold uppercase">{c.course}</p>
                            </div>
                         </div>
                         <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{c.date}</span>
                      </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>

      </div>
    </PageContainer>
  );
}
