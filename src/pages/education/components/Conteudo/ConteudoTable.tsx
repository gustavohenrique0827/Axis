import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { FileText, Video, HelpCircle, MoreVertical } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: "Video" | "PDF" | "Quiz" | "Artigo";
  module: string;
  course: string;
  duration?: string;
  lastUpdate: string;
  accessCount: number;
  status: "Publicado" | "Rascunho" | "Em Revisão" | "Arquivado";
}

interface ConteudoTableProps {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
}

export function ConteudoTable({ items, onEdit }: ConteudoTableProps) {
  return (
    <Card className="bg-[var(--color-surface-elevated)]/80 border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-10">Material Educacional</th>
              <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso / Módulo</th>
              <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
              <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Performance</th>
              <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onEdit(item)}>
                <td className="p-6 pl-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/20 transition-all">
                      {item.type === "Video" ? <Video className="w-5 h-5" /> : item.type === "PDF" ? <FileText className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-1">{item.title}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic font-mono">ID: {item.id} • UPDATED: {item.lastUpdate}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-xs font-bold text-slate-300 mb-1">{item.module}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[150px]">{item.course}</p>
                </td>
                <td className="p-6">
                  <Badge className="bg-white/5 border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                    {item.type}
                  </Badge>
                </td>
                <td className="p-6">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white font-mono">{item.accessCount}</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter italic">Views</span>
                    </div>
                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (item.accessCount / 500) * 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="p-6 pr-10 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                      item.status === "Publicado" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" :
                      item.status === "Em Revisão" ? "bg-amber-500/5 text-amber-400 border-amber-500/20" :
                      "bg-slate-500/5 text-slate-500 border-white/5"
                    }`}>
                      {item.status}
                    </span>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
