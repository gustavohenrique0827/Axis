import React, { useState } from "react";
import {
  Award, Search, Plus, Download,
  Calendar, ShieldCheck, RefreshCw,
  Star, Share2, BookOpen
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";

interface Certificate {
  id: string;
  student: string;
  course: string;
  issueDate: string;
  code: string;
  status: 'Emitido' | 'Processando' | 'Revogado';
  grade: string;
}

const INITIAL_CERTIFICATES: Certificate[] = [];

export default function Certificados() {
  const [certs, setCerts] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem("axis_edu_certs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CERTIFICATES;
  });

  const [search, setSearch] = useState("");
  const [isEmitModalOpen, setIsEmitModalOpen] = useState(false);
  const [isValidModalOpen, setIsValidModalOpen] = useState(false);
  const [validationCode, setValidationCode] = useState("");

  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: Certificate = {
      id: Math.random().toString(36).substring(2, 9),
      student: studentName,
      course: courseName,
      issueDate: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      code: `AX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      status: 'Emitido',
      grade: studentGrade
    };
    const updated = [newCert, ...certs];
    setCerts(updated);
    localStorage.setItem("axis_edu_certs", JSON.stringify(updated));
    toast.success("Certificado emitido com sucesso!");
    setIsEmitModalOpen(false);
  };

  const filteredCerts = certs.filter(c => 
    c.student.toLowerCase().includes(search.toLowerCase()) ||
    c.course.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Certificados & Credenciais Axis"
      description="Emissão de diplomas, validação de competências e registro de histórico acadêmico com criptografia Axis."
      actions={
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsValidModalOpen(true)}
            variant="outline" className="h-11 px-6 rounded-2xl border-white/10 text-white text-[10px] font-black uppercase tracking-widest"
          >
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
        
        {/* Certification Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Diplomas Emitidos", value: certs.length, icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Validações Hoje", value: "--", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Processamento", value: certs.filter(c => c.status === 'Processando').length, icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Média Acadêmica", value: "--", icon: Star, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-white font-mono tracking-tighter italic">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Section */}
        <Card className="p-4 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Buscar por aluno, curso ou código de autenticidade (HASH)..."
                   className="w-full bg-white/5 border border-white/5 rounded-[22px] h-14 pl-14 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-medium italic"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2 pr-2">
                 <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                    <button className="px-5 py-2.5 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 rounded-xl border border-amber-500/20">Recentes</button>
                    <button className="px-5 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-white">Mais Válidos</button>
                 </div>
              </div>
           </div>
        </Card>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredCerts.map((cert) => (
             <Card key={cert.id} className="group relative overflow-hidden bg-[#111827]/80 border-white/5 hover:border-amber-500/20 transition-all p-8 flex flex-col justify-between min-h-[380px] rounded-[32px]">
                {/* Guilloché Pattern Background */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-2xl group-hover:bg-amber-500/20 transition-all">
                         <Award className="w-7 h-7 text-amber-500" />
                      </div>
                      <Badge className={`${
                        cert.status === 'Emitido' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        cert.status === 'Processando' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      } font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1.5`}>
                        {cert.status}
                      </Badge>
                   </div>

                   <div className="mb-10">
                      <h3 className="text-2xl font-black text-white italic group-hover:text-amber-400 transition-colors mb-2 uppercase tracking-tight leading-none truncate">
                         {cert.student}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <Calendar className="w-3.5 h-3.5" /> Data de Emissão: <span className="text-slate-300 italic">{cert.issueDate}</span>
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/5 p-5 rounded-2xl mb-8 group-hover:bg-amber-500/[0.02] transition-all">
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                         <BookOpen className="w-3 h-3" /> Curso Superior
                      </div>
                      <div className="text-sm font-bold text-white leading-tight uppercase italic">{cert.course}</div>
                      <div className="mt-4 flex justify-between items-center bg-black/20 p-2 rounded-xl">
                         <span className="text-[9px] font-black text-slate-600 uppercase italic">G.P.A Acadêmico</span>
                         <span className="text-xs font-black text-amber-400 font-mono tracking-widest">{cert.grade} / 10.0</span>
                      </div>
                   </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6">
                   <div className="flex flex-col gap-1">
                      <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">AXIS_AUTH_HASH</div>
                      <code className="text-[10px] font-mono text-amber-500 font-black tracking-widest">{cert.code}</code>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-3 bg-white/5 hover:bg-amber-500/20 border border-white/10 rounded-xl text-slate-400 hover:text-amber-400 transition-all group/btn">
                         <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button className="p-3 bg-white/5 hover:bg-blue-500/20 border border-white/10 rounded-xl text-slate-400 hover:text-blue-400 transition-all group/btn">
                         <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                   </div>
                </div>
                
                {/* Large Background Seal */}
                <div className="absolute -bottom-10 -right-10 p-10 opacity-0 group-hover:opacity-[0.03] transition-opacity -rotate-12 pointer-events-none scale-150">
                   <ShieldCheck className="w-40 h-40 text-white" />
                </div>
             </Card>
           ))}
        </div>
      </div>

      {/* Issuance Modal (simplified for implementation but following the design language) */}
      {isEmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="bg-[#111827] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">🎓 Nova Autenticação Axis</h3>
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
