import { useState } from "react";
import { Users, BookOpen, Target, Star, Download, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import { exportToCSV } from "../../lib/exportCsv";
import { NovaMatriculaModal } from "../../components/ui/modals/education/NovaMatriculaModal";
import { AlunoGradesModal } from "../../components/ui/modals/education/AlunoGradesModal";
import { AlunosKPIs } from "./components/Alunos/AlunosKPIs";
import { AlunosFilters } from "./components/Alunos/AlunosFilters";
import { AlunosTable } from "./components/Alunos/AlunosTable";
import { AlunosInsight } from "./components/Alunos/AlunosInsight";

interface Grade { subject: string; value: number; weight: number; }
interface Student {
  id: string; name: string; email: string; phone: string;
  course: string; progress: number; status: string; avatar: string; grades: Grade[];
}

export default function Alunos() {
  const [searchTerm, setSearchTerm] = useState("");
  const { students: rawStudents, addStudent, updateStudent, getSmartInsight } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);

  const students: Student[] = rawStudents.map(s => ({
    id: s.id, name: s.nome || s.name, email: s.email || "",
    phone: s.telefone || s.phone || "", course: s.curso || s.course || "",
    progress: s.progress || 0, status: s.status || "Ativo",
    avatar: s.avatar || "", grades: s.grades || [],
  }));

  const filteredAlunos = students.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kpiStats = [
    { label: "Total Estudantes", value: "—", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Matrículas Hoje", value: "—", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Taxa Engajamento", value: "—", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "NPS Acadêmico", value: "—", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

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
        <AlunosKPIs stats={kpiStats} />
        <AlunosFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AlunosTable
          students={filteredAlunos}
          onManage={(student) => { setSelectedStudent(student); setIsGradesModalOpen(true); }}
        />
        <AlunosInsight />
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
