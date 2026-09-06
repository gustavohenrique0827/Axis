import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { GraduationCap, Star } from "lucide-react";

export function AlunosInsight() {
  return (
    <Card className="p-10 bg-gradient-to-br from-emerald-600/10 via-transparent to-blue-600/10 border-white/5 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform">
        <GraduationCap className="w-40 h-40 text-blue-400" />
      </div>
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Star className="w-4 h-4 animate-pulse" /> Aurora Edu-Analytics
          </h3>
          <h4 className="text-2xl font-black text-white italic mb-4 tracking-tighter">Predição de Abandono (Churn Acadêmico)</h4>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "Sem dados suficientes de alunos para gerar predições comportamentais."
          </p>
        </div>
        <div className="flex justify-end gap-4 opacity-50 pointer-events-none">
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/10 text-white text-xs font-black uppercase tracking-widest">
            Gerar Relatório
          </Button>
          <Button className="bg-blue-600 text-white h-12 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/30">
            Ativar Robô
          </Button>
        </div>
      </div>
    </Card>
  );
}
