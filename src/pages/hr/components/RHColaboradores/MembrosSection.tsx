import { useRef } from "react";
import {
  Users, Search, UserPlus, Mail, Calendar,
  MoreVertical, TrendingUp, ShieldCheck, X,
  UserX, Coffee, Plane, Pencil,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";

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
          { label: "Total de Colaboradores", value: filtered.length, icon: Users },
          { label: "Vendas & SDRs Ativos", value: "0", icon: UserPlus },
          { label: "Engajamento Médio", value: "0%", icon: TrendingUp },
          { label: "Meta Geral Batida", value: "0%", icon: ShieldCheck },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nome, cargo ou departamento..."
            className="w-full bg-transparent border-white/5 pl-12 h-12 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          {["Todos", "Tecnologia", "Produtos", "Vendas"].map((cat) => (
            <button
              key={cat}
              onClick={() => onSearchChange(cat === "Todos" ? "" : cat)}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((colab) => {
          const statusDot =
            colab.status === "Ativo" ? "bg-emerald-500" :
            colab.status === "Férias" ? "bg-amber-500" :
            "bg-rose-500";
          return (
          <Card key={colab.id} className="group overflow-hidden hover:border-white/10 transition-all p-0">
            <div className="h-20 bg-white/5 border-b border-white/5 flex items-end justify-center p-0">
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border-4 border-[var(--color-surface-elevated)] -mb-10 flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <div className="p-6 pt-12 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                {colab.status}
              </div>
              <h3 className="text-base font-semibold text-white">{colab.nome}</h3>
              <div className="text-xs text-slate-500 mb-6">{colab.cargo}</div>
              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 mb-6">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Departamento</div>
                  <div className="text-xs text-slate-300">{colab.departamento}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Desempenho</div>
                  <div className="text-xs text-slate-300">{colab.desempenho}%</div>
                </div>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs truncate">{colab.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">Admissão: {colab.dataAdmissao}</span>
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                <Button
                  variant="subtle"
                  onClick={() => onVerPerfil(colab)}
                  className="flex-1 h-10 text-xs"
                >
                  Ver Perfil
                </Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => onEditColab(colab)}
                  className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5"
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
                    <div className="absolute right-0 bottom-12 z-50 w-48 bg-[var(--color-surface)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                      <button onClick={() => onChangeStatus(colab, "Férias")} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                        <Plane className="w-3.5 h-3.5" /> Marcar como Férias
                      </button>
                      <button onClick={() => onChangeStatus(colab, "Afastado")} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                        <Coffee className="w-3.5 h-3.5" /> Marcar como Afastado
                      </button>
                      <button onClick={() => onChangeStatus(colab, "Ativo")} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                        <Users className="w-3.5 h-3.5" /> Marcar como Ativo
                      </button>
                      <div className="border-t border-white/5" />
                      <button onClick={() => onDesligar(colab)} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                        <UserX className="w-3.5 h-3.5" /> Desligar Colaborador
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>
    </>
  );
}
