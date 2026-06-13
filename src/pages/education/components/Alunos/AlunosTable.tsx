import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Users } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  progress: number;
  status: string;
  avatar: string;
  grades: any[];
}

interface AlunosTableProps {
  students: Student[];
  onManage: (student: Student) => void;
}

export function AlunosTable({ students, onManage }: AlunosTableProps) {
  return (
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
          {students.length > 0 ? students.map((aluno) => (
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
                  onClick={() => onManage(aluno)}
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
  );
}
