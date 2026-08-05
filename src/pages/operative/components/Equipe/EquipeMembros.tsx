import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Pencil, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { TeamMember } from "../../hooks/useEquipe";

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (m: TeamMember) => void;
}

function TeamMemberCard({ member, onEdit }: TeamMemberCardProps) {
  return (
    <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-white/10 text-white">
          {member.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
        </div>
        <div>
          <h3 className="font-bold text-white group-hover:text-[#2563EB]">{member.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[#2563EB] font-bold uppercase">{member.role}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] text-slate-400">{member.email}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] text-cyan-400 font-bold">{member.squad}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${member.status === "Ativo" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-yellow-500/20 text-yellow-500"}`}>
          {member.status}
        </span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEdit(member)}>
          <Pencil className="w-4 h-4 text-slate-400 hover:text-white" />
        </Button>
      </div>
    </Card>
  );
}

interface EquipeMembrosProps {
  filteredTeam: TeamMember[];
  memberSearch: string;
  onMemberSearchChange: (v: string) => void;
  onAdmitir: () => void;
  onEditMember: (m: TeamMember) => void;
}

export function EquipeMembros({ filteredTeam, memberSearch, onMemberSearchChange, onAdmitir, onEditMember }: EquipeMembrosProps) {
  return (
    <motion.div
      key="members"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Membros do Time</h2>
          <p className="text-sm text-slate-400 mt-1">Visibilidade total de hierarquia e acessos.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <BarChart3 className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Filtrar por nome, cargo ou squad..."
              className="bg-[var(--color-surface-elevated)]/40 border border-white/5 pl-11 pr-6 py-3 rounded-2xl text-xs text-white outline-none focus:border-blue-500/50 w-80 transition-all shadow-2xl"
              value={memberSearch}
              onChange={(e) => onMemberSearchChange(e.target.value)}
            />
          </div>
          <Button onClick={onAdmitir} className="gap-2 h-12 bg-blue-600 hover:bg-blue-700 font-bold px-6 rounded-2xl shadow-xl shadow-blue-600/20">
            <Plus className="w-5 h-5" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredTeam.map((member) => (
          <TeamMemberCard key={member.id ?? `${member.email}-${member.name}`} member={member} onEdit={onEditMember} />
        ))}
        {filteredTeam.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-white font-black">Nenhum colaborador encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">Refine seus termos de busca ou filtros.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
