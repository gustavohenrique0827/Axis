import { useState, useMemo } from "react";
import { 
  Users, Calendar, CheckSquare, Layers, 
  Search, ArrowLeft, MoreVertical, Plus,
  Filter, Check, X, Clock, User,
  TrendingUp, Download, Share2, ClipboardCheck
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  status: 'onboarding' | 'active' | 'at_risk' | 'completed';
  progress: number;
  attendance: number;
  lastPresence: string;
}


interface EducationTurmaDetalhesProps {
  turma: {
    id: string;
    nome: string;
    curso: string;
    instrutor: string;
  };
  onBack: () => void;
}

export default function EducationTurmaDetalhes({ turma, onBack }: EducationTurmaDetalhesProps) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'presenca'>('presenca');
  const [attendanceDate, setAttendanceDate] = useState("2024-05-22");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Presença Média", value: students.length ? "88%" : "—", icon: CheckSquare, color: "text-emerald-500" },
    { label: "Progresso Médio", value: students.length ? "42%" : "—", icon: TrendingUp, color: "text-blue-500" },
    { label: "Alunos em Risco", value: students.filter(s => s.status === 'at_risk').length.toString(), icon: X, color: "text-rose-500" },
    { label: "Aulas Realizadas", value: "0/40", icon: Calendar, color: "text-amber-500" },
  ];

  const kanbanColumns = [
    { id: 'onboarding', label: 'Onboarding', color: 'text-purple-500 bg-purple-500' },
    { id: 'active', label: 'Ativos', color: 'text-blue-500 bg-blue-500' },
    { id: 'at_risk', label: 'Em Risco', color: 'text-rose-500 bg-rose-500' },
    { id: 'completed', label: 'Concluídos', color: 'text-emerald-500 bg-emerald-500' }
  ];

  const handleMarkAllPresent = () => {
    toast.success("Todos os alunos marcados como presente para o dia configurado.");
  };

  const handleToggleAttendance = (id: string, present: boolean) => {
    toast.success(`${students.find(s => s.id === id)?.name} marcado como ${present ? 'Presente' : 'Ausente'}.`);
  };

  return (
    <PageContainer
      title={turma.nome}
      description={`${turma.curso} • Instrutor: ${turma.instrutor}`}
      actions={
        <div className="flex gap-3">
          <Button 
            onClick={onBack}
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Aluno
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-20">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 bg-[#111827]/50 border-white/5 backdrop-blur-md">
            <stat.icon className={`w-4 h-4 ${stat.color} mb-3`} />
            <div className="text-xl font-display font-black text-white italic">{stat.value}</div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('presenca')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'presenca' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Lista de Presença
        </button>
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'kanban' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Kanban de Progresso
        </button>
      </div>

      {activeTab === 'presenca' && (
        <div className="space-y-6">
          <Card className="p-4 bg-[#111827]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input 
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-[#0B1120] border-white/5 pl-10 h-10 rounded-xl text-xs font-bold text-white w-48"
                  />
               </div>
               <div className="relative flex-1 min-w-[250px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar alunos..."
                    className="bg-[#0B1120] border-white/5 pl-10 h-10 rounded-xl text-xs text-white w-full"
                  />
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button onClick={handleMarkAllPresent} variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Marcar todos presente</Button>
               <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-500 hover:text-white bg-white/5 rounded-xl border border-white/5">
                  <Share2 className="w-4 h-4" />
               </Button>
            </div>
          </Card>

          <Card className="overflow-hidden bg-[#111827]/60 border-white/5 min-h-[300px]">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40 gap-4">
                <Users className="w-12 h-12 text-slate-500" />
                <span className="text-xs uppercase font-black tracking-widest text-slate-500 text-center max-w-sm">
                  Sem alunos cadastrados nesta turma. Integre o banco para ver a lista de presença.
                </span>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Aluno</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Presença</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Freq. Geral</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors capitalize font-bold text-xs italic">
                               {student.name.charAt(0)}
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white">{student.name}</div>
                               <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Matrícula: Axis-{student.id}92</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex justify-center gap-3">
                            <button onClick={() => handleToggleAttendance(student.id, true)} className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all">
                               <Check className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleToggleAttendance(student.id, false)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all">
                               <X className="w-5 h-5" />
                            </button>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${student.attendance < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                 style={{ width: `${student.attendance}%` }} 
                               />
                            </div>
                            <span className={`text-[11px] font-black ${student.attendance < 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{student.attendance}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button className="p-2 text-slate-600 hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {kanbanColumns.map((col) => (
             <div key={col.id} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col.color.split(' ')[1]}`} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{col.label}</h3>
                   </div>
                   <Badge className="bg-white/5 text-slate-500 border-none font-black text-[9px]">{students.filter(s => s.status === col.id).length}</Badge>
                </div>

                <div className="space-y-4 min-h-[500px] p-2 rounded-2xl bg-[#111827]/30 border border-white/5 border-dashed">
                   {students.filter(s => s.status === col.id).map((student) => (
                      <Card key={student.id} className="p-5 bg-[#111827] border-white/5 hover:border-blue-500/30 transition-all cursor-move group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{student.name}</div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreVertical className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                         </div>
                         
                         <div className="space-y-3">
                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                               <span>Progresso</span>
                               <span className="text-blue-400">{student.progress}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-blue-600 rounded-full" 
                                 style={{ width: `${student.progress}%` }} 
                               />
                            </div>
                         </div>

                         <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                               <Clock className="w-3 h-3" /> {student.lastPresence}
                            </div>
                            <div className="flex -space-x-2">
                               <div className="w-5 h-5 rounded-full bg-indigo-500 border border-[#111827]" />
                            </div>
                         </div>
                      </Card>
                   ))}
                   
                   <button className="w-full py-3 rounded-xl border border-white/5 border-dashed text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white hover:border-white/20 transition-all">
                      + Mover para cá
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  </PageContainer>
  );
}
