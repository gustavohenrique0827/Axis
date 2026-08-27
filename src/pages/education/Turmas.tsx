import { useState } from "react";
import { GraduationCap, Users, BookOpen, CheckCircle2, Filter, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import EducationTurmaDetalhes from "./EducationTurmaDetalhes";
import { useData } from "../../contexts/DataContext";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { NovaTurmaModal } from "../../components/ui/modals/education/NovaTurmaModal";
import { ConfirmModal } from "../../components/ui/modals/shared/ConfirmModal";
import { TurmasKPIs } from "./components/Turmas/TurmasKPIs";
import { TurmasFilters } from "./components/Turmas/TurmasFilters";
import { TurmasGrid } from "./components/Turmas/TurmasGrid";

interface Turma {
  id: string;
  name: string;
  instructor: string;
  subject: string;
  students: number;
  capacity: number;
  status: "Ativa" | "Planejamento" | "Concluída";
  startDate: string;
  shift: "Manhã" | "Tarde" | "Noite";
  progress: number;
}

export default function Turmas() {
  const { turmas: rawTurmas, addTurma, updateTurma, deleteTurma, students } = useData();
  const [search, setSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [deletingTurma, setDeletingTurma] = useState<Turma | null>(null);

  const turmas: Turma[] = rawTurmas.map(t => ({
    id: t.id,
    name: t.nome || t.name,
    instructor: t.professor || t.instructor || "Não definido",
    subject: t.curso || t.subject || "Geral",
    students: t.students?.length || 0,
    capacity: t.vagas || t.capacity || 0,
    status: (t.status as any) || "Planejamento",
    startDate: t.data_inicio || t.startDate || "",
    shift: t.shift || "Manhã",
    progress: t.progress || 0,
  }));

  if (selectedTurma) {
    return (
      <EducationTurmaDetalhes
        turma={{ id: selectedTurma.id, nome: selectedTurma.name, curso: selectedTurma.subject, instrutor: selectedTurma.instructor }}
        onBack={() => setSelectedTurma(null)}
      />
    );
  }

  const turmasAtivas = turmas.filter(t => t.status === "Ativa").length;
  const vagasDisponiveis = turmas.reduce((acc, t) => acc + Math.max(0, (t.capacity || 0) - (t.students || 0)), 0);
  const taxaRetencao = students.length === 0
    ? "—"
    : `${Math.round((students.filter((s: any) => s.status === "Ativo" || s.ativo === true || !s.status).length / students.length) * 100)}%`;

  const kpiStats = [
    { label: "Turmas Ativas", value: String(turmasAtivas), icon: GraduationCap, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Alunos Matriculados", value: students.length.toLocaleString("pt-BR"), icon: Users, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Vagas Disponíveis", value: String(vagasDisponiveis), icon: BookOpen, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Taxa de Retenção", value: taxaRetencao, icon: CheckCircle2, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  ];

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
        <TurmasKPIs stats={kpiStats} />
        <TurmasFilters search={search} onSearchChange={setSearch} />
        <TurmasGrid
          turmas={filteredTurmas}
          onSelect={setSelectedTurma}
          onEdit={setEditingTurma}
          onDelete={setDeletingTurma}
        />
      </div>
      <NovaTurmaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          addTurma({
            id: Math.random().toString(36).substring(2, 9),
            nome: data.nome, curso: data.curso,
            professor: data.professor || "Não definido",
            vagas: parseInt(data.vagas) || 30,
            shift: data.shift, data_inicio: data.data_inicio,
            status: "Planejamento", progress: 0,
          });
          toast.success("Turma criada com sucesso!");
          setIsModalOpen(false);
        }}
      />
      <NovaTurmaModal
        isOpen={!!editingTurma}
        onClose={() => setEditingTurma(null)}
        title="Editar Turma"
        submitLabel="Salvar Alterações"
        initialData={editingTurma ? {
          nome: editingTurma.name,
          curso: editingTurma.subject,
          professor: editingTurma.instructor,
          vagas: String(editingTurma.capacity || 30),
          shift: editingTurma.shift,
          data_inicio: editingTurma.startDate,
        } : undefined}
        onSubmit={(data) => {
          if (!editingTurma) return;
          updateTurma(editingTurma.id, {
            nome: data.nome, curso: data.curso,
            professor: data.professor || "Não definido",
            vagas: parseInt(data.vagas) || 30,
            shift: data.shift, data_inicio: data.data_inicio,
          });
          toast.success("Turma atualizada com sucesso!");
          setEditingTurma(null);
        }}
      />
      <ConfirmModal
        isOpen={!!deletingTurma}
        onClose={() => setDeletingTurma(null)}
        onConfirm={() => {
          if (!deletingTurma) return;
          deleteTurma(deletingTurma.id);
          toast.success("Turma excluída com sucesso.");
          setDeletingTurma(null);
        }}
        title="Excluir Turma"
        message={`Tem certeza que deseja excluir a turma "${deletingTurma?.name}"? Todos os dados associados a esta turma serão perdidos.`}
      />
    </PageContainer>
  );
}
