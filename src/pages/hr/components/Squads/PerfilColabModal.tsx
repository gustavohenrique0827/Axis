import { X, Users, Mail, Calendar } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface PerfilColabModalProps {
  colab: any | null;
  onClose: () => void;
}

export function PerfilColabModal({ colab, onClose }: PerfilColabModalProps) {
  if (!colab) return null;

  const statusDot =
    colab.status === "Ativo" ? "bg-emerald-500" :
    colab.status === "Férias" ? "bg-amber-500" :
    "bg-rose-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200" onClick={e => e.stopPropagation()}>

        <div className="h-24 bg-white/5 border-b border-white/5 relative flex items-end justify-center">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border-4 border-[var(--color-surface)] -mb-10 flex items-center justify-center text-slate-400">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="px-8 pt-14 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {colab.status}
          </div>
          <h2 className="text-xl font-semibold text-white">{colab.nome}</h2>
          <p className="text-xs text-slate-400 mt-1">{colab.cargo}</p>

          <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-5 mt-6 mb-6 text-left">
            <div>
              <div className="text-xs text-slate-500 mb-1">Departamento</div>
              <div className="text-sm text-white">{colab.departamento || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Desempenho</div>
              <div className="text-sm text-white">{colab.desempenho ?? 0}%</div>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-400">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">{colab.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="text-sm">Admissão: {colab.dataAdmissao || "—"}</span>
            </div>
          </div>

          <Button onClick={onClose} className="w-full mt-8" size="lg">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
