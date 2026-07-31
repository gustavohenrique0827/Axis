import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Award, Calendar, BookOpen, ShieldCheck, Download, Share2 } from "lucide-react";

interface Certificate {
  id: string;
  student: string;
  course: string;
  issueDate: string;
  code: string;
  status: "Emitido" | "Processando" | "Revogado";
  grade: string;
}

interface CertificadosGridProps {
  certs: Certificate[];
}

export function CertificadosGrid({ certs }: CertificadosGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certs.map((cert) => (
        <Card key={cert.id} className="group relative overflow-hidden bg-[var(--color-surface-elevated)]/80 border-white/5 hover:border-amber-500/20 transition-all p-8 flex flex-col justify-between min-h-[380px] rounded-[32px]">
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-2xl group-hover:bg-amber-500/20 transition-all">
                <Award className="w-7 h-7 text-amber-500" />
              </div>
              <Badge className={`${
                cert.status === "Emitido" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                cert.status === "Processando" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
          <div className="absolute -bottom-10 -right-10 p-10 opacity-0 group-hover:opacity-[0.03] transition-opacity -rotate-12 pointer-events-none scale-150">
            <ShieldCheck className="w-40 h-40 text-white" />
          </div>
        </Card>
      ))}
    </div>
  );
}
