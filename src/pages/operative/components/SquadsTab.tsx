import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users2, Users, UserPlus, Shield, Zap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { TeamMember, Squad } from "../hooks/useEquipe";

interface SquadsTabProps {
  squads: Squad[];
  team: TeamMember[];
  expandedSquads: string[];
  toggleSquad: (squadName: string) => void;
  moveMember: (name: string, newSquad: string) => void;
}

export function SquadsTab({ squads, team, moveMember }: SquadsTabProps) {
  const [selectedSquad, setSelectedSquad] = useState<string>(squads[0]?.name ?? "");
  const [addUser, setAddUser] = useState("");

  const selected = squads.find(s => s.name === selectedSquad);
  const members = team.filter(m => m.squad === selectedSquad);
  const outside = team.filter(m => m.squad !== selectedSquad);

  function handleAdd() {
    if (!addUser || !selectedSquad) return;
    moveMember(addUser, selectedSquad);
    setAddUser("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Gestão de Squads</h2>
        <p className="text-sm text-slate-400 mt-1">Células dinâmicas de conversão e atendimento especializado.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Squad Cards Grid */}
        <div className="lg:col-span-2">
          {squads.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl gap-3">
              <Users2 className="w-8 h-8 text-slate-500" />
              <p className="text-sm text-slate-400">Nenhuma squad criada</p>
              <p className="text-xs text-slate-500">Use o painel lateral para criar sua primeira squad</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {squads.map((squad) => {
                const count = team.filter(m => m.squad === squad.name).length;
                const isActive = selectedSquad === squad.name;

                return (
                  <Card
                    key={squad.name}
                    onClick={() => setSelectedSquad(squad.name)}
                    className={`p-5 cursor-pointer transition-colors ${isActive ? "border-white/30" : "hover:border-white/15"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-500"}`} />
                        <span className="text-xs">{isActive ? "Selecionada" : "Squad"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users2 className="w-3.5 h-3.5" />
                        {count}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{squad.name}</h3>
                    {squad.leader && (
                      <p className="text-xs text-slate-400 mt-1">Líder: {squad.leader}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Member Panel */}
        <AnimatePresence mode="wait">
          {selectedSquad && selected && (
            <motion.div
              key={selectedSquad}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white-text/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">Membros</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{members.length} na squad</p>
                  </div>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>

                {/* Member list */}
                <div className="flex-1 p-3 space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {members.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-300 shrink-0">
                          {m.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="text-sm text-white">{m.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{m.role}</span>
                    </div>
                  ))}

                  {members.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                      <Users className="w-6 h-6 text-slate-500" />
                      <p className="text-xs text-slate-500">Sem membros</p>
                    </div>
                  )}
                </div>

                {/* Add to squad */}
                <div className="p-4 border-t border-white-text/10 space-y-3">
                  <p className="text-xs text-slate-400">Adicionar à Equipe</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-500">Usuário</label>
                      <select
                        value={addUser}
                        onChange={e => setAddUser(e.target.value)}
                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors"
                      >
                        <option value="">Adicionar...</option>
                        {outside.map(m => (
                          <option key={m.name} value={m.name}>{m.name.split(' ')[0]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Função</label>
                      <select className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-white/30 transition-colors">
                        {['Membro', 'Closer', 'SDR', 'Gestor'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAdd}
                    disabled={!addUser}
                    className="w-full gap-2 text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Adicionar à Equipe
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats row */}
      {squads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users2, label: "Total Squads", value: squads.length },
            { icon: Users, label: "Total Membros", value: team.length },
            { icon: Shield, label: "Líderes Ativos", value: squads.filter(s => s.leader).length },
            { icon: Zap, label: "Média / Squad", value: squads.length > 0 ? (team.length / squads.length).toFixed(1) : "0" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
