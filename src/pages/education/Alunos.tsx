import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Filter, Download, 
  Mail, Phone, BookOpen, Clock, Target,
  MoreVertical, CheckCircle2, AlertCircle,
  GraduationCap, Calendar, Star, ArrowUpRight,
  TrendingUp, Trash2, Plus, X, Calculator
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

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

const mockAlunos: Student[] = [
  { 
    id: '1', 
    name: 'Pedro Portilho', 
    email: 'pedro@axis.com', 
    phone: '(11) 98888-7777', 
    course: 'Engenharia de Software', 
    progress: 85, 
    status: 'Ativo', 
    avatar: 'PP',
    grades: [
      { subject: 'Algoritmos', value: 9.5, weight: 2 },
      { subject: 'Banco de Dados', value: 8.0, weight: 3 },
      { subject: 'Sistemas Operacionais', value: 7.5, weight: 2 },
    ]
  },
  { 
    id: '2', 
    name: 'Juliana Costa', 
    email: 'jully@axis.com', 
    phone: '(11) 97777-6666', 
    course: 'Marketing Digital', 
    progress: 92, 
    status: 'Ativo', 
    avatar: 'JC',
    grades: [
      { subject: 'Funis de Vendas', value: 9.2, weight: 1 },
      { subject: 'Copywriting', value: 9.8, weight: 1 },
    ]
  },
  { 
    id: '3', 
    name: 'Felipe Almeida', 
    email: 'felipe@axis.com', 
    phone: '(11) 95555-4444', 
    course: 'UX Design', 
    progress: 45, 
    status: 'Ativo', 
    avatar: 'FA',
    grades: []
  },
  { 
    id: '4', 
    name: 'Ana Beatriz Rocha', 
    email: 'ana@axis.com', 
    phone: '(11) 91111-2222', 
    course: 'Gestão Ágil', 
    progress: 100, 
    status: 'Concluído', 
    avatar: 'AR',
    grades: [
      { subject: 'Scrum Master', value: 10, weight: 1 }
    ]
  },
  { 
    id: '5', 
    name: 'Marcos Vinícius', 
    email: 'marcos@axis.com', 
    phone: '(11) 93333-8888', 
    course: 'Engenharia de Software', 
    progress: 12, 
    status: 'Ativo', 
    avatar: 'MV',
    grades: []
  },
];

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>(mockAlunos);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

  // Form states for new grade
  const [newSubject, setNewSubject] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newWeight, setNewWeight] = useState('1');

  const calculateWeightedAverage = (grades: Grade[]): string => {
    if (grades.length === 0) return "0";
    const totalWeight = grades.reduce((acc, curr) => acc + curr.weight, 0);
    const totalValue = grades.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
    return (totalValue / totalWeight).toFixed(2);
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newSubject || !newValue) return;

    const gradeVal = parseFloat(newValue);
    const weightVal = parseFloat(newWeight);

    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 10) {
      toast.error("Nota inválida (0-10)");
      return;
    }

    const updatedGrades = [...selectedStudent.grades, { subject: newSubject, value: gradeVal, weight: weightVal }];
    const updatedStudent = { ...selectedStudent, grades: updatedGrades };
    
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
    
    setNewSubject('');
    setNewValue('');
    setNewWeight('1');
    toast.success("Nota registrada!");
  };

  const removeGrade = (index: number) => {
    if (!selectedStudent) return;
    const updatedGrades = selectedStudent.grades.filter((_, i) => i !== index);
    const updatedStudent = { ...selectedStudent, grades: updatedGrades };
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
    toast.info("Nota removida");
  };

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
          <Button variant="outline" className="h-11 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Download className="w-4 h-4" /> Exportar Dados
          </Button>
          <Button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-blue-600/20 group">
            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Nova Matrícula
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        
        {/* Academic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Estudantes', value: students.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
             { label: 'Matrículas Hoje', value: '12', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
             { label: 'Taxa Engajamento', value: '84%', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
             { label: 'NPS Acadêmico', value: '9.8', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-colors">
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
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome, email ou matrícula..."
                   className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-white/5 text-slate-500 hover:text-white">
                    <Filter className="w-4 h-4" />
                 </Button>
                 <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                    <button className="px-5 py-2 text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20">Todos</button>
                    <button className="px-5 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Ativos</button>
                    <button className="px-5 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Inadimplentes</button>
                 </div>
              </div>
           </div>
        </Card>

        {/* Students Table */}
        <Card className="bg-[#111827]/80 border-white/5 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-10">Estudante</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso Vinculado</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Desempenho (Média)</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                       <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredAlunos.map((pupil, i) => {
                      const avg = calculateWeightedAverage(pupil.grades);
                      return (
                        <tr key={pupil.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="p-6 pl-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/5 flex items-center justify-center font-black text-xs text-blue-400">
                                    {pupil.avatar}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{pupil.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">{pupil.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                 <BookOpen className="w-3.5 h-3.5 text-blue-500/50" /> {pupil.course}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className={`text-sm font-black font-mono ${parseFloat(avg) >= 7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {parseFloat(avg) > 0 ? avg : '--'}
                                 </div>
                                 <Button 
                                   onClick={() => { setSelectedStudent(pupil); setIsGradesModalOpen(true); }}
                                   variant="outline" 
                                   className="h-8 px-3 rounded-lg border-white/5 text-[9px] font-black uppercase tracking-widest gap-2 bg-white/5 hover:bg-blue-600/10 hover:text-blue-400"
                                 >
                                    <TrendingUp className="w-3 h-3" /> Ver Notas
                                 </Button>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                pupil.status === 'Concluído' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                                'bg-blue-500/5 text-blue-400 border-blue-500/20'
                              }`}>
                                 {pupil.status}
                              </span>
                           </td>
                           <td className="p-6 pr-10 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Mensagem"><Mail className="w-4 h-4 text-blue-400" /></button>
                                 <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title="Histórico"><Clock className="w-4 h-4 text-emerald-400" /></button>
                                 <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
              {filteredAlunos.length === 0 && (
                <div className="p-20 text-center text-slate-600 font-display italic">Nenhum estudante encontrado na base atual.</div>
              )}
           </div>
        </Card>

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
                    "Identificamos que alunos do curso **UX Design** que não visualizam materiais por mais de 5 dias têm 40% mais chances de trancamento. Sugerimos automação de mensagem motivacional às quintas-feiras."
                 </p>
              </div>
              <div className="flex justify-end gap-4">
                 <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/10 text-white text-xs font-black uppercase tracking-widest">
                    Gerar Relatório
                 </Button>
                 <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/30">
                    Ativar Robô de Alerta
                 </Button>
              </div>
           </div>
        </Card>

      </div>

      {/* Grades Modal */}
      <AnimatePresence>
        {isGradesModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111827] border border-white/10 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-blue-600/10 to-transparent">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                       <Calculator className="w-5 h-5 text-blue-400" /> Registro Acadêmico
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Estudante: <span className="text-blue-400">{selectedStudent.name}</span></p>
                  </div>
                  <button onClick={() => setIsGradesModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="p-8 space-y-8">
                  {/* Summary Grade */}
                  <div className="flex items-center justify-between bg-white/5 p-6 rounded-[24px] border border-white/5">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Média Ponderada Atual</p>
                        <h4 className={`text-4xl font-black font-mono tracking-tighter ${parseFloat(calculateWeightedAverage(selectedStudent.grades)) >= 7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {calculateWeightedAverage(selectedStudent.grades)}
                        </h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Acadêmico</p>
                        <Badge className={`${parseFloat(calculateWeightedAverage(selectedStudent.grades)) >= 7 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} border-transparent font-black uppercase h-8 px-4`}>
                           {parseFloat(calculateWeightedAverage(selectedStudent.grades)) >= 7 ? 'Aprovado' : 'Em Recuperação'}
                        </Badge>
                     </div>
                  </div>

                  {/* Add New Grade Form */}
                  <form onSubmit={handleAddGrade} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                     <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Disciplina</label>
                        <input 
                           required 
                           placeholder="Ex: Engenharia de Software" 
                           value={newSubject}
                           onChange={(e) => setNewSubject(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs text-white focus:border-blue-500/50 transition-all outline-none"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Nota (0-10)</label>
                        <input 
                           required 
                           type="number"
                           step="0.1"
                           placeholder="0.0" 
                           value={newValue}
                           onChange={(e) => setNewValue(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs text-white focus:border-blue-500/50 transition-all outline-none font-mono"
                        />
                     </div>
                     <div className="flex gap-2">
                        <div className="flex-1">
                           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Peso</label>
                           <input 
                              required 
                              type="number"
                              min="1"
                              value={newWeight}
                              onChange={(e) => setNewWeight(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-xs text-white focus:border-blue-500/50 transition-all outline-none font-mono text-center"
                           />
                        </div>
                        <Button type="submit" className="h-11 w-11 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                           <Plus className="w-5 h-5" />
                        </Button>
                     </div>
                  </form>

                  {/* Grades List */}
                  <div className="space-y-3 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                     <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Detalhamento por Disciplina</h5>
                     {selectedStudent.grades.length === 0 ? (
                        <div className="text-center py-10 text-slate-600 italic text-sm">Nenhuma nota registrada para este aluno.</div>
                     ) : (
                        selectedStudent.grades.map((grade, idx) => (
                           <motion.div 
                              key={idx}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between bg-white/[0.02] hover:bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors group"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-[10px]">
                                    {grade.weight}x
                                 </div>
                                 <span className="text-xs font-bold text-slate-200">{grade.subject}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                 <span className="text-sm font-black text-white font-mono">{grade.value.toFixed(1)}</span>
                                 <button onClick={() => removeGrade(idx)} className="p-2 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </motion.div>
                        ))
                     )}
                  </div>
               </div>

               <div className="p-8 border-t border-white/5 flex gap-4">
                  <Button onClick={() => setIsGradesModalOpen(false)} className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Concluir Revisão</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageContainer>
  );
}

