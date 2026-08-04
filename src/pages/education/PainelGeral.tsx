import React from 'react';
import { 
  GraduationCap, Users, BookOpen, Award, 
  TrendingUp, Activity, Star, Calendar,
  ArrowUpRight, ArrowDownRight, Clock,
  ArrowRight, CheckCircle2, AlertCircle,
  LayoutDashboard, Inbox
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell 
} from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";

export default function PainelGeralEducation() {
  return (
    <PageContainer 
      title="BI Educacional & Dashboard Axis" 
      description="Visão 360º da operação pedagógica, métricas de engajamento e performance de tutores."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2" disabled>
            <Calendar className="w-4 h-4" /> Filtro Mensal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2" disabled>
             Download BI
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Matrículas Ativas", value: "—", trend: "", icon: Users, color: "text-indigo-500" },
             { label: "Taxa de Conclusão", value: "—", trend: "", icon: CheckCircle2, color: "text-emerald-500" },
             { label: "Conteúdos Vistos", value: "—", trend: "", icon: BookOpen, color: "text-blue-500" },
             { label: "NPS Acadêmico", value: "—", trend: "", icon: Star, color: "text-amber-500" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all opacity-50">
                <div className="flex items-center justify-between mb-4">
                   <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   {stat.trend && (
                     <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                        <ArrowUpRight className="w-3 h-3" /> {stat.trend}
                     </div>
                   )}
                </div>
                <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Engagement Area Chart */}
           <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Engajamento do Aluno
                 </h3>
              </div>
              <div className="h-[350px] flex flex-col items-center justify-center gap-4 opacity-40">
                <Inbox className="w-12 h-12 text-slate-500" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                  Módulo de Educação em Construção.<br/>Aguardando integração de dados de LMS/Alunos.
                </p>
              </div>
           </Card>

           {/* Course Split */}
           <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10">Matrículas por Área</h3>
              <div className="h-[280px] flex flex-col items-center justify-center gap-4 opacity-40">
                 <BookOpen className="w-10 h-10 text-slate-500" />
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                   Sem cursos cadastrados.
                 </p>
              </div>
           </Card>
        </div>

        {/* Recently Active Classes Table */}
        <div className="grid lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)]/80 border-white/5 overflow-hidden">
              <div className="p-6 border-bottom border-white/5 flex justify-between items-center">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" /> Turmas em Destaque
                 </h3>
              </div>
              <div className="flex flex-col items-center justify-center py-20 opacity-40 gap-4">
                 <Users className="w-10 h-10 text-slate-500" />
                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhuma turma cadastrada.
                 </p>
              </div>
           </Card>

           <Card className="p-8 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <LayoutDashboard className="w-32 h-32 text-indigo-400" />
              </div>
              <div className="relative z-10">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> MIA Predictive
                 </h3>
                 <div className="space-y-4">
                    <h4 className="text-xl font-black text-white italic tracking-tighter">Predição de Evasão</h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                       "Sem dados suficientes para gerar predições. É necessário integrar o sistema de matrículas para identificar padrões de comportamento dos alunos e antecipar evasões."
                    </p>
                 </div>
              </div>
           </Card>
        </div>

      </div>
    </PageContainer>
  );
}
