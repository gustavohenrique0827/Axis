import { useRef } from "react";
import {
  Users, Search, UserPlus, Mail, Calendar,
  MoreVertical, TrendingUp, ShieldCheck, X,
  UserX, Coffee, Plane, Pencil,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";

interface MembrosSectionProps {
  filtered: any[];
  search: string;
  onSearchChange: (v: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onVerPerfil: (colab: any) => void;
  onEditColab: (colab: any) => void;
  onChangeStatus: (colab: any, status: string) => void;
  onDesligar: (colab: any) => void;
}

export function MembrosSection({
  filtered, search, onSearchChange,
  menuOpenId, setMenuOpenId, onVerPerfil, onEditColab,
  onChangeStatus, onDesligar,
}: MembrosSectionProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Colaboradores", value: filtered.length, icon: Users, color: "text-indigo-500" },
          { label: "Vendas & SDRs Ativos", value: "0", icon: UserPlus, color: "text-emerald-500" },
          { label: "Engajamento Médio", value: "0%", icon: TrendingUp, color: "text-blue-500" },
          { label: "Meta Geral Batida", value: "0%", icon: ShieldCheck, color: "text-rose-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-[#111827]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
            <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[#111827]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nome, cargo ou departamento..."
            className="w-full bg-transparent border-white/5 pl-12 h-12 rounded-xl text-sm italic"
          />
        </div>
        <div className="flex items-center gap-3">
          {["Todos", "Tecnologia", "Produtos", "Vendas"].map((cat) => (
            <button
              key={cat}
              onClick={() => onSearchChange(cat === "Todos" ? "" : cat)}
              className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((colab) => (
          <Card key={colab.id} className="group overflow-hidden bg-[#111827]/60 border-white/5 hover:border-indigo-500/30 transition-all p-0">
            <div className="h-24 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 flex items-end justify-center p-0">
              <div className="w-20 h-20 rounded-2xl bg-[#0B1120] border-4 border-[#111827] -mb-10 flex items-center justify-center text-indigo-500">
                <Users className="w-8 h-8 opacity-40" />
              </div>
            </div>
            <div className="p-6 pt-12 text-center">
              <Badge className={`${
                colab.status === "Ativo"    ? "bg-emerald-500/10 text-emerald-500" :
                colab.status === "Férias"   ? "bg-blue-500/10 text-blue-500" :
                                              "bg-rose-500/10 text-rose-500"
              } font-black uppercase tracking-widest text-[8px] px-2.5 py-0.5 border-none mb-3`}>
                {colab.status}
              </Badge>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{colab.nome}</h3>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">{colab.cargo}</div>
              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 mb-6">
                <div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Departamento</div>
                  <div className="text-[10px] font-bold text-slate-300">{colab.departamento}</div>
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Desempenho</div>
                  <div className="text-[10px] font-bold text-emerald-500">{colab.desempenho}%</div>
                </div>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium truncate">{colab.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Admissão: {colab.dataAdmissao}</span>
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                <Button
                  onClick={() => onVerPerfil(colab)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 rounded-xl font-black uppercase tracking-widest text-[9px]"
                >
                  Ver Perfil
                </Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => onEditColab(colab)}
                  className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 border border-white/5"
                  title="Editar perfil"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <div className="relative" ref={menuOpenId === colab.id ? menuRef : null}>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => setMenuOpenId(menuOpenId === colab.id ? null : colab.id)}
                    className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {menuOpenId === colab.id && (
                    <div className="absolute right-0 bottom-12 z-50 w-48 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                      <button onClick={() => onChangeStatus(colab, "Férias")} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-blue-400 transition-colors text-left">
                        <Plane className="w-3.5 h-3.5" /> Marcar como Férias
                      </button>
                      <button onClick={() => onChangeStatus(colab, "Afastado")} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-amber-400 transition-colors text-left">
                        <Coffee className="w-3.5 h-3.5" /> Marcar como Afastado
                      </button>
                      <button onClick={() => onChangeStatus(colab, "Ativo")} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-emerald-400 transition-colors text-left">
                        <Users className="w-3.5 h-3.5" /> Marcar como Ativo
                      </button>
                      <div className="border-t border-white/5" />
                      <button onClick={() => onDesligar(colab)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                        <UserX className="w-3.5 h-3.5" /> Desligar Colaborador
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
