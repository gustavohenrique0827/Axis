import { useState } from 'react';
import {
   Users, Search, UserPlus, Filter, Download,
   BookOpen, Target, GraduationCap, Star,
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import { exportToCSV } from "../../lib/exportCsv";
import { NovaMatriculaModal } from "../../components/ui/NovaMatriculaModal";
import { AlunoGradesModal } from "../../components/ui/AlunoGradesModal";

interface Grade {
   subject: string;
   value: number;
   weight: number;
}

interface Student {
   id: string;
   name: string;
   email: string;
   phone: string;
   course: string;
   progress: number;
   status: string;
   avatar: string;
   grades: Grade[];
}

export default function Alunos() {
   const [searchTerm, setSearchTerm] = useState('');
   const { students: rawStudents, addStudent, updateStudent, getSmartInsight } = useData();

   const [isModalOpen, setIsModalOpen] = useState(false);

   const students: Student[] = rawStudents.map(s => ({
      id: s.id,
      name: s.nome || s.name,
      email: s.email || "",
      phone: s.telefone || s.phone || "",
      course: s.curso || s.course || "",
      progress: s.progress || 0,
      status: s.status || "Ativo",
      avatar: s.avatar || "",
      grades: s.grades || []
   }));
   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
   const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

   const filteredAlunos = students.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <PageContainer
         title="Gestão de Alunos Axis"
         description="Base centralizada de matrículas, desempenho acadêmico e engajamento."
         actions={
            <div className="flex items-center gap-3">
               <Button
                  onClick={() => {
                     if (filteredAlunos.length === 0) return toast.error("Nenhum dado para exportar");
                     exportToCSV(filteredAlunos, "Alunos_Axis");
                     toast.success("Download iniciado!");
                  }}
                  variant="outline"
                  className="h-11 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2"
               >
                  <Download className="w-4 h-4" /> Exportar Dados
               </Button>
               <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-blue-600/20 group"
               >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Nova Matrícula
               </Button>
            </div>
         }
      >
         <div className="max-w-[1700px] mx-auto space-y-6 pb-10">

            {/* Academic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                  { label: 'Total Estudantes', value: "—", icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Matrículas Hoje', value: "—", icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Taxa Engajamento', value: "—", icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'NPS Acadêmico', value: "—", icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
               ].map((stat, i) => (
                  <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-colors opacity-50">
                     <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
                     </div>
                  </Card>
               ))}
            </div>

            {/* Filter Section */}
            <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input
                        type="text"
                        placeholder="Buscar por nome, email ou matrícula..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" disabled className="h-12 w-12 p-0 rounded-2xl border-white/5 text-slate-500">
                        <Filter className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </Card>

            <div className="overflow-x-auto pb-6">
               <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                     <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">
                        <th className="text-left pb-2 pl-6">Aluno</th>
                        <th className="text-left pb-2">Contato</th>
                        <th className="text-left pb-2">Curso</th>
                        <th className="text-left pb-2">Status</th>
                        <th className="text-right pb-2 pr-6">Ações</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredAlunos.length > 0 ? filteredAlunos.map((aluno) => (
                        <tr key={aluno.id} className="group bg-[#111827]/80 hover:bg-white/[0.03] transition-all">
                           <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                                    {aluno.name.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div className="text-sm font-bold text-white">{aluno.name}</div>
                              </div>
                           </td>
                           <td className="py-4 border-y border-white/5">
                              <div className="text-xs text-slate-400 font-medium">{aluno.email}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{aluno.phone || "S/ Telefone"}</div>
                           </td>
                           <td className="py-4 border-y border-white/5">
                              <div className="text-xs font-bold text-indigo-400">{aluno.course}</div>
                           </td>
                           <td className="py-4 border-y border-white/5">
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-widest">
                                 {aluno.status}
                              </Badge>
                           </td>
                           <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-white/5 text-right">
                              <Button
                                 onClick={() => { setSelectedStudent(aluno); setIsGradesModalOpen(true); }}
                                 variant="ghost"
                                 className="h-8 text-[10px] uppercase font-black tracking-widest text-blue-500 hover:bg-blue-500/10"
                              >
                                 Gerenciar
                              </Button>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={5} className="py-10 text-center">
                              <div className="flex flex-col items-center gap-3">
                                 <Users className="w-10 h-10 text-slate-600" />
                                 <div className="text-sm font-black text-slate-400">Nenhum aluno encontrado</div>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* AI Insight Section */}
            <Card className="p-10 bg-gradient-to-br from-emerald-600/10 via-transparent to-blue-600/10 border-white/5 relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-40 h-40 text-blue-400" />
               </div>
               <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div>
                     <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Star className="w-4 h-4 animate-pulse" /> MIA Edu-Analytics
                     </h3>
                     <h4 className="text-2xl font-black text-white italic mb-4 tracking-tighter">Predição de Abandono (Churn Acadêmico)</h4>
                     <p className="text-sm text-slate-300 leading-relaxed italic">
                        "Sem dados suficientes de alunos para gerar predições comportamentais."
                     </p>
                  </div>
                  <div className="flex justify-end gap-4 opacity-50 pointer-events-none">
                     <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/10 text-white text-xs font-black uppercase tracking-widest">
                        Gerar Relatório
                     </Button>
                     <Button className="bg-blue-600 text-white h-12 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/30">
                        Ativar Robô
                     </Button>
                  </div>
               </div>
            </Card>

         </div>

         <NovaMatriculaModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(data) => {
               addStudent({ ...data, status: "Ativo", progress: 0, grades: [] });
               toast.success("Aluno matriculado com sucesso!");
               setIsModalOpen(false);
            }}
         />

         <AlunoGradesModal
            isOpen={isGradesModalOpen}
            student={selectedStudent}
            onClose={() => { setIsGradesModalOpen(false); setSelectedStudent(null); }}
            onAddGrade={(_id, grade) => {
               if (!selectedStudent) return;
               const updated = [...(selectedStudent.grades || []), grade];
               updateStudent(selectedStudent.id, { grades: updated });
               setSelectedStudent({ ...selectedStudent, grades: updated });
               toast.success(`Nota de ${grade.subject} registrada.`);
            }}
            onRemoveGrade={(_id, index) => {
               if (!selectedStudent) return;
               const updated = selectedStudent.grades.filter((_, i) => i !== index);
               updateStudent(selectedStudent.id, { grades: updated });
               setSelectedStudent({ ...selectedStudent, grades: updated });
               toast.info("Nota removida do histórico.");
            }}
            onAnalyzeAI={async (student) => {
               const insight = await getSmartInsight(
                  "Análise de Performance Acadêmica",
                  { name: student.name, course: student.course, grades: student.grades, progress: student.progress }
               );
               toast.success("Master IA concluiu a análise.");
               return insight;
            }}
         />
      </PageContainer>
   );
}
