import { useState } from "react";
import {
  GraduationCap, Users, Calendar, Search, Plus,
  MoreVertical, Filter, BookOpen, Clock, CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import EducationTurmaDetalhes from "./EducationTurmaDetalhes";
import { useData } from "../../contexts/DataContext";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { NovaTurmaModal } from "../../components/ui/NovaTurmaModal";

interface Turma {
  id: string;
  name: string;
  instructor: string;
  subject: string;
  students: number;
  capacity: number;
  status: 'Ativa' | 'Planejamento' | 'Concluída';
  startDate: string;
  shift: 'Manhã' | 'Tarde' | 'Noite';
  progress: number;
}

export default function Turmas() {
  const { turmas: rawTurmas, addTurma } = useData();
  
  // Map Supabase fields to UI fields if needed
  const turmas: Turma[] = rawTurmas.map(t => ({
    id: t.id,
    name: t.nome || t.name,
    instructor: t.professor || t.instructor || "Não definido",
    subject: t.curso || t.subject || "Geral",
    students: t.students?.length || 0,
    capacity: t.vagas || t.capacity || 0,
    status: t.status as any || "Planejamento",
    startDate: t.data_inicio || t.startDate || "",
    shift: t.shift || "Manhã",
    progress: t.progress || 0
  }));

  const [search, setSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (selectedTurma) {
    return (
      <EducationTurmaDetalhes 
        turma={{
          id: selectedTurma.id,
          nome: selectedTurma.name,
          curso: selectedTurma.subject,
          instrutor: selectedTurma.instructor
        }}
        onBack={() => setSelectedTurma(null)}
      />
    );
  }

  const filteredTurmas = turmas.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Gestão de Turmas Axis"
      description="Controle pedagógico, alocação de instrutores e monitoramento de vagas em tempo real."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Turma
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* Academic Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Turmas Ativas", value: "24", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Alunos Matriculados", value: "1,482", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Vagas Disponíveis", value: "156", icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Taxa de Retenção", value: "94%", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-[#111827]/50 border-white/5 backdrop-blur-md group hover:border-white/10 transition-all cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge className="bg-white/5 border-white/5 text-slate-500 text-[9px] font-black tracking-widest uppercase">Live</Badge>
              </div>
              <div className="text-2xl font-black text-white mb-1 italic font-mono tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Search & Toolbelt */}
        <Card className="p-4 bg-[#111827]/80 border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por turma, curso ou professor..." 
              className="w-full bg-white/5 border-white/5 pl-12 h-12 rounded-xl text-sm italic text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4 shrink-0">
             <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
                <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-lg">Cards</button>
                <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Lista</button>
             </div>
          </div>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filteredTurmas.map((turma) => (
            <Card key={turma.id} className="group relative overflow-hidden bg-[#111827]/80 border-white/5 hover:border-blue-500/30 transition-all duration-300">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                turma.status === 'Ativa' ? 'bg-emerald-500' : 
                turma.status === 'Planejamento' ? 'bg-amber-500' : 'bg-slate-700'
              }`} />

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                     <Badge className={`${
                       turma.status === 'Ativa' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                       turma.status === 'Planejamento' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                       'bg-slate-500/10 text-slate-500 border-slate-500/20'
                     } font-black uppercase tracking-widest text-[9px] px-2.5 py-1 mb-3`}>
                       ● {turma.status}
                     </Badge>
                     <h3 className="text-xl font-black text-white italic group-hover:text-blue-500 transition-colors uppercase tracking-tight leading-tight">
                       {turma.name}
                     </h3>
                  </div>
                  <button className="p-2 text-slate-600 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center text-[10px] font-black text-blue-400">
                      {turma.instructor.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Professor / Tutor</div>
                      <div className="text-sm font-bold text-slate-200">{turma.instructor}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-mono">
                         <Clock className="w-3 h-3 text-blue-500" /> Turno
                      </div>
                      <div className="text-xs font-black text-white">{turma.shift}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-mono">
                         <Calendar className="w-3 h-3 text-blue-500" /> Início
                      </div>
                      <div className="text-xs font-black text-white">{turma.startDate}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex justify-between items-end mb-2">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso Acadêmico</div>
                      <div className="text-[10px] font-black text-white font-mono">{turma.progress}%</div>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${turma.progress}%` }}
                      />
                   </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-6 h-6 rounded-full border border-[#0B1120] bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">
                                  {i}
                               </div>
                            ))}
                         </div>
                         <span className="text-[10px] font-black text-slate-400 ml-1">+{turma.students - 3} ALUNOS</span>
                      </div>
                      <Button 
                        onClick={() => setSelectedTurma(turma)}
                        variant="ghost" 
                        className="h-10 text-[10px] font-black uppercase tracking-widest text-[#2563EB] hover:bg-blue-600/10 gap-2 rounded-xl"
                      >
                         Gerenciar <ChevronRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <NovaTurmaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          addTurma({
            id: Math.random().toString(36).substring(2, 9),
            nome: data.nome,
            curso: data.curso,
            professor: data.professor || "Não definido",
            vagas: parseInt(data.vagas) || 30,
            shift: data.shift,
            data_inicio: data.data_inicio,
            status: "Planejamento",
            progress: 0,
          });
          toast.success("Turma criada com sucesso!");
          setIsModalOpen(false);
        }}
      />
    </PageContainer>
  );
}
