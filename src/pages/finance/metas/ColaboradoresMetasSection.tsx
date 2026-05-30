import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { 
  Users, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { SquadMeta, ColaboradorMeta } from "./useFinanceiroMetas";

interface ColaboradoresMetasSectionProps {
  period: "monthly" | "quarterly" | "annual";
  colaboradores: ColaboradorMeta[];
  setColaboradores: React.Dispatch<React.SetStateAction<ColaboradorMeta[]>>;
  squads: SquadMeta[];
  selectedColabId: string;
  setSelectedColabId: (id: string) => void;
  colabName: string;
  setColabName: (val: string) => void;
  colabSquadId: string;
  setColabSquadId: (val: string) => void;
  colabMeta: number;
  setColabMeta: (val: number) => void;
  colabRealizado: number;
  setColabRealizado: (val: number) => void;
}

export function ColaboradoresMetasSection({
  period,
  colaboradores,
  setColaboradores,
  squads,
  selectedColabId,
  setSelectedColabId,
  colabName,
  setColabName,
  colabSquadId,
  setColabSquadId,
  colabMeta,
  setColabMeta,
  colabRealizado,
  setColabRealizado
}: ColaboradoresMetasSectionProps) {
  return (
    <div className="mt-8">
      <div className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500 animate-pulse" />
          Metas de Colaboradores Individuais
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
          Acompanhamento individual dos vendedores corporativos comparado com a performance do seu squad correspondente
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Listagem de Colaboradores com progresso individual e side-by-side de squad */}
        <Card className="xl:col-span-2 p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between rounded-3xl">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">Vendedores Cadastrados & Desempenho</h4>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Visão unificada: progresso pessoal vs. progresso geral do squad</p>
              </div>
            </div>

            <div className="space-y-4">
              {colaboradores.map(colab => {
                const mySquad = squads.find(s => s.id === colab.squadId) || squads[0];
                
                // Compute collaborator progress percent
                const colabPct = colab.meta > 0 ? Math.min(100, Math.round((colab.realizado / colab.meta) * 100)) : 0;
                
                // Compute squad progress percent
                const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
                const squadMetaReal = mySquad.meta * mult;
                const squadFaturamentoReal = mySquad.faturamento * mult;
                const squadPct = squadMetaReal > 0 ? Math.min(100, Math.round((squadFaturamentoReal / squadMetaReal) * 100)) : 0;

                return (
                  <div key={colab.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                          {colab.name.charAt(0)}
                        </span>
                        <div>
                          <span className="text-xs font-black text-white uppercase tracking-tight block leading-none">{colab.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">{mySquad?.name || "Sem Squad"}</span>
                        </div>
                      </div>

                      {/* Dual Progress sliders or indicators */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {/* Progress Collaborator */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                            <span>Progresso Pessoal</span>
                            <span className="font-bold text-blue-400">{colabPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${colabPct}%` }} />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                            <span>Realizado: R$ {colab.realizado.toLocaleString("pt-BR")}</span>
                            <span>Meta: R$ {colab.meta.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>

                        {/* Progress Squad side-by-side */}
                        <div className="space-y-1">
                          <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center">
                            <span>Progresso Completo do Squad</span>
                            <span className="font-bold text-emerald-400">{squadPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${squadPct}%` }} />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                            <span>Squad Faturado: R$ {squadFaturamentoReal.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right button/actions */}
                    <div className="flex flex-row md:flex-col items-end gap-2 shrink-0 justify-end pt-2 md:pt-0">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setSelectedColabId(colab.id);
                          toast.info(`Editando metas para o colaborador ${colab.name}`);
                        }}
                        className="h-8 px-3 rounded-lg border border-white/5 text-slate-300 hover:text-white bg-white/5 uppercase text-[9px] tracking-wider font-extrabold cursor-pointer"
                      >
                        Editar Meta
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setColaboradores(prev => prev.filter(c => c.id !== colab.id));
                          toast.error(`Colaborador ${colab.name} removido!`);
                        }}
                        className="h-8 px-3 rounded-lg border border-rose-500/10 text-rose-400 hover:bg-rose-500/10 uppercase text-[9px] tracking-wider font-bold cursor-pointer"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-mono text-right font-bold uppercase tracking-widest">
            Totalizadores individuais vinculados aos canais de comissionamento ativos.
          </div>
        </Card>

        {/* Form de Configuração do Colaborador (Admin) */}
        <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0 rounded-3xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Metas de Colaborador (Form)
          </h4>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Cadastrar ou atualizar metas comerciais individuais</span>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!colabName.trim()) {
              toast.error("Por favor, preencha o nome do colaborador!");
              return;
            }

            if (selectedColabId === "new") {
              const newColabObj: ColaboradorMeta = {
                id: `colab-custom-${Date.now()}`,
                name: colabName,
                squadId: colabSquadId,
                meta: colabMeta,
                realizado: colabRealizado
              };
              setColaboradores(prev => [...prev, newColabObj]);
              toast.success(`Colaborador ${colabName} cadastrado com sucesso!`);
              setColabName("");
              setColabMeta(50000);
              setColabRealizado(10000);
            } else {
              setColaboradores(prev => prev.map(c => {
                if (c.id === selectedColabId) {
                  return {
                    ...c,
                    name: colabName,
                    squadId: colabSquadId,
                    meta: colabMeta,
                    realizado: colabRealizado
                  };
                }
                return c;
              }));
              toast.success(`Metas de ${colabName} atualizadas com sucesso!`);
            }
            setSelectedColabId("new");
          }} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ficha do Colaborador</label>
              <select 
                value={selectedColabId}
                onChange={(e) => setSelectedColabId(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="new">+ Cadastrar Novo Colaborador</option>
                {colaboradores.map(c => (
                  <option key={c.id} value={c.id}>Editar: {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Vendedor</label>
              <input 
                type="text"
                placeholder="Ex: Carlos Eduardo..."
                value={colabName}
                onChange={(e) => setColabName(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Squad Associado</label>
              <select 
                value={colabSquadId}
                onChange={(e) => setColabSquadId(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {squads.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-wrap">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Meta Alvo (R$)</label>
                <input 
                  type="number"
                  value={colabMeta}
                  onChange={(e) => setColabMeta(Number(e.target.value))}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Realizado (R$)</label>
                <input 
                  type="number"
                  value={colabRealizado}
                  onChange={(e) => setColabRealizado(Number(e.target.value))}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                {selectedColabId === "new" ? "Cadastrar Meta" : "Salvar Alterações"}
              </Button>
              {selectedColabId !== "new" && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedColabId("new")}
                  className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-10 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                >
                  Novo
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
