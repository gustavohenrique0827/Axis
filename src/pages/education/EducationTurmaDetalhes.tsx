import { useState } from "react";
import { CheckSquare, TrendingUp, X, Calendar, ArrowLeft, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { TurmaDetalhesKPIs } from "./components/TurmaDetalhes/TurmaDetalhesKPIs";
import { TurmaDetalhesPresenca } from "./components/TurmaDetalhes/TurmaDetalhesPresenca";
import { TurmaDetalhesKanban } from "./components/TurmaDetalhes/TurmaDetalhesKanban";

interface Student {
  id: string;
  name: string;
  status: "onboarding" | "active" | "at_risk" | "completed";
  progress: number;
  attendance: number;
  lastPresence: string;
}

interface EducationTurmaDetalhesProps {
  turma: { id: string; nome: string; curso: string; instrutor: string; };
  onBack: () => void;
}

export default function EducationTurmaDetalhes({ turma, onBack }: EducationTurmaDetalhesProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "presenca">("presenca");
  const [attendanceDate, setAttendanceDate] = useState("2024-05-22");
  const [searchQuery, setSearchQuery] = useState("");
  const [students] = useState<Student[]>([]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const kpiStats = [
    { label: "Presença Média", value: students.length ? "88%" : "—", icon: CheckSquare, color: "text-[#06B6D4]" },
    { label: "Progresso Médio", value: students.length ? "42%" : "—", icon: TrendingUp, color: "text-[#06B6D4]" },
    { label: "Alunos em Risco", value: students.filter(s => s.status === "at_risk").length.toString(), icon: X, color: "text-[#06B6D4]" },
    { label: "Aulas Realizadas", value: "0/40", icon: Calendar, color: "text-[#06B6D4]" },
  ];

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
        <TurmaDetalhesKPIs stats={kpiStats} />

        <div className="flex gap-6 border-b border-white/5">
          {(["presenca", "kanban"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === tab ? "text-blue-500 border-blue-500" : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {tab === "presenca" ? "Lista de Presença" : "Kanban de Progresso"}
            </button>
          ))}
        </div>

        {activeTab === "presenca" && (
          <TurmaDetalhesPresenca
            students={filteredStudents}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            attendanceDate={attendanceDate}
            onDateChange={setAttendanceDate}
            onMarkAllPresent={() => toast.success("Todos os alunos marcados como presente para o dia configurado.")}
            onToggleAttendance={(id, present) => {
              toast.success(`${students.find(s => s.id === id)?.name} marcado como ${present ? "Presente" : "Ausente"}.`);
            }}
          />
        )}
        {activeTab === "kanban" && <TurmaDetalhesKanban students={students} />}
      </div>
    </PageContainer>
  );
}
