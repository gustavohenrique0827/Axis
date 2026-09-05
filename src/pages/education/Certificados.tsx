import { useState } from "react";
import { Award, Plus, ShieldCheck, RefreshCw, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { CertificadosKPIs } from "./components/Certificados/CertificadosKPIs";
import { CertificadosFilters } from "./components/Certificados/CertificadosFilters";
import { CertificadosGrid } from "./components/Certificados/CertificadosGrid";
import { useData } from "../../contexts/DataContext";

interface Certificate {
  id: string;
  student: string;
  course: string;
  issueDate: string;
  code: string;
  status: "Emitido" | "Processando" | "Revogado";
  grade: string;
}

function rowToCert(r: any): Certificate {
  return { id: r.id, student: r.student || "", course: r.course || "", issueDate: r.issue_date || "", code: r.code || "", status: r.status, grade: r.grade || "" };
}

export default function Certificados() {
  const { certificates, addCertificate } = useData();
  const certs: Certificate[] = certificates.map(rowToCert);
  const [search, setSearch] = useState("");
  const [isEmitModalOpen, setIsEmitModalOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");

  const handleSaveCertificate = (e: { preventDefault(): void }) => {
    e.preventDefault();
    addCertificate({
      student: studentName, course: courseName,
      issue_date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      code: `AX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      status: "Emitido", grade: studentGrade,
    });
    toast.success("Certificado emitido com sucesso!");
    setIsEmitModalOpen(false);
  };

  const filteredCerts = certs.filter(c =>
    c.student.toLowerCase().includes(search.toLowerCase()) ||
    c.course.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const kpiStats = [
    { label: "Diplomas Emitidos", value: certs.length, icon: Award, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Validações Hoje", value: "--", icon: ShieldCheck, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Processamento", value: certs.filter(c => c.status === "Processando").length, icon: RefreshCw, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Média Acadêmica", value: "--", icon: Star, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  ];

  return (
    <PageContainer
      title="Certificados & Credenciais S.P.Y."
      description="Emissão de diplomas, validação de competências e registro de histórico acadêmico com criptografia S.P.Y.."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-2xl border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
            Validar Código
          </Button>
          <Button
            onClick={() => setIsEmitModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white h-11 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Emitir Novo
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-8 pb-10">
        <CertificadosKPIs stats={kpiStats} />
        <CertificadosFilters search={search} onSearchChange={setSearch} />
        <CertificadosGrid certs={filteredCerts} />
      </div>

      {isEmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">🎓 Nova Autenticação S.P.Y.</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Crie e valide uma nova credencial acadêmica irrevogável.</p>
            </div>
            <form onSubmit={handleSaveCertificate} className="p-8 space-y-5">
              <div className="space-y-4">
                <input required placeholder="Nome Completo do Aluno" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white focus:border-amber-500/50 transition-all font-medium uppercase"
                />
                <input required placeholder="Título da Formação" value={courseName} onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white focus:border-amber-500/50 transition-all font-medium uppercase italic"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" step="0.1" placeholder="Média (0.0 - 10.0)" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-2xl h-14 px-6 text-sm text-white focus:border-amber-500/50 transition-all font-black font-mono"
                  />
                  <div className="bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 text-center">Auto-Geração Hash Ativa</div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsEmitModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest">Emitir Diploma</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
