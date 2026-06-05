import { 
  Brain, TrendingUp, Wallet, Sparkles
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { toast } from "sonner";
import { Squad, Lead } from "../../../types";

interface SquadsTabContentProps {
  squads: Squad[];
  leads: Lead[];
  handleDeleteSquad: (id: string) => void;
  updateSquad: (id: string, sq: Partial<Squad>) => void;
  oteBaseSalary: string;
  setOteBaseSalary: (val: string) => void;
  oteCommPercentage: string;
  setOteCommPercentage: (val: string) => void;
  oteVendasRealizadas: string;
  setOteVendasRealizadas: (val: string) => void;
  oteAtingimentoMeta: string;
  setOteAtingimentoMeta: (val: string) => void;
  calcVariable: number;
  calcBonus: number;
  totalOTE: number;
}

export function SquadsTabContent({
  squads,
  leads,
  handleDeleteSquad,
  updateSquad,
  oteBaseSalary,
  setOteBaseSalary,
  oteCommPercentage,
  setOteCommPercentage,
  oteVendasRealizadas,
  setOteVendasRealizadas,
  oteAtingimentoMeta,
  setOteAtingimentoMeta,
  calcVariable,
  calcBonus,
  totalOTE,
}: SquadsTabContentProps) {
  return (
    <div className="space-y-6">
      
      {/* Context Notice Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-400" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Estrutura de Squads sob Medida</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Agrupe Closers e SDRs de alta performance, atribua metas regionais e automatize a passagem de bastão de leads de iPhones.</p>
          </div>
        </div>
      </div>

      {/* Squads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {squads.map((sq) => {
          const percent = Math.min(100, Math.round((sq.faturamentoAlcancado / sq.meta) * 100));
          
          const squadLeadsCount = leads.filter(l => sq.membros.some(m => l.seller && m.includes(l.seller))).length || 1;
          const cac = sq.orcamentoMensal / squadLeadsCount;

          return (
            <Card key={sq.id} className="p-6 bg-[#111827]/70 border border-white/10 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 className="font-bold text-white text-md tracking-tight uppercase">{sq.nome}</h3>
                  </div>
                  <Button 
                    onClick={() => handleDeleteSquad(sq.id)}
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                   <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Orçamento</span>
                      <span className="text-xs font-bold text-white tracking-tight">R$ {sq.orcamentoMensal.toLocaleString()}</span>
                   </div>
                   <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">CAC Estimado</span>
                      <span className="text-xs font-bold text-blue-400 tracking-tight italic">R$ {cac.toFixed(2)}</span>
                   </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-white/5 p-3.5 rounded-2xl border border-white/5 mb-5 leading-normal italic font-medium">
                  "{sq.focoComercial}"
                </div>

                {/* Squad composition details */}
                <div className="mb-5 space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Membros Conectados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sq.membros.map((m, idx) => (
                      <div key={idx} className="inline-flex items-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[8px] px-2.5 py-1">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Progress bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-slate-500 uppercase tracking-widest">Meta de Faturamento</span>
                    <span className="font-extrabold text-blue-400">{percent}% atingido</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                    <span>Realizado: R$ {sq.faturamentoAlcancado.toLocaleString()}</span>
                    <span className="text-slate-400">Objetivo: R$ {sq.meta.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-black uppercase text-[8px]">SDRs: {sq.sdrCount}</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-black uppercase text-[8px]">Closers: {sq.closersCount}</Badge>
                </div>
                <button 
                  onClick={() => {
                    const value = Math.round(Math.random() * 25000);
                    updateSquad(sq.id, { faturamentoAlcancado: sq.faturamentoAlcancado + value });
                    toast.success(`+R$ ${value.toLocaleString()} injetados no faturamento de ${sq.nome}!`);
                  }}
                  className="text-[9px] font-black text-blue-500 hover:text-white hover:bg-blue-600 bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3 h-3" /> Simular Venda
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* OTE (On-Target Earnings) Real Time Calculator Section */}
      <Card className="p-6 sm:p-10 bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Wallet className="w-40 h-40 text-white" />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Ferramenta Integrada de RH & Planejamento</span>
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight mt-1">Calculadora de OTE & Comissões (SDR / Closer)</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Simule o On-Target Earnings de corretores ou assessores da sua operation baseando-se nas metas comerciais recomendadas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Salário Base Mensal (R$)</label>
                <Input 
                  type="number"
                  value={oteBaseSalary}
                  onChange={(e) => setOteBaseSalary(e.target.value)}
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Taxa de Comissão (% sobre vendas)</label>
                <Input 
                  type="number"
                  value={oteCommPercentage}
                  onChange={(e) => setOteCommPercentage(e.target.value)}
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Volume de Vendas Faturado (R$)</label>
                <Input 
                  type="number"
                  value={oteVendasRealizadas}
                  onChange={(e) => setOteVendasRealizadas(e.target.value)}
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Atingimento da Meta Squad (%)</label>
                <Input 
                  type="number"
                  value={oteAtingimentoMeta}
                  onChange={(e) => setOteAtingimentoMeta(e.target.value)}
                  className="bg-white/5 border-white/5 h-11 text-sm rounded-xl"
                />
                <span className="text-[8px] text-slate-500 font-bold block">Meta &gt;= 100% libera Bônus Superador de 25% do Base!</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { l: "SDR Comercial", s: "2200", c: "2", v: "50000" },
                { l: "Closer Closer", s: "4500", c: "5", v: "120000" },
                { l: "Líder de Squad", s: "6000", c: "6.5", v: "180000" }
              ].map((loader, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setOteBaseSalary(loader.s);
                    setOteCommPercentage(loader.c);
                    setOteVendasRealizadas(loader.v);
                    setOteAtingimentoMeta("100");
                    toast.info(`Simulador pré-carregado para: ${loader.l}`);
                  }}
                  className="p-2 py-2.5 bg-slate-900 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider text-center"
                >
                  💼 {loader.l}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated OTE Outputs Card */}
          <div className="lg:col-span-5 p-6 bg-slate-950/80 border border-[#2563EB]/25 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#2563EB]">ESTRUTURA DE GANHOS ESTIMADOS</span>
              
              <div className="border-b border-white/5 pb-3">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">On-Target Earnings (OTE Total)</div>
                <div className="text-3xl font-display font-black text-white italic mt-1 font-mono">
                  R$ {totalOTE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Fixo Mensal Garantido:</span>
                  <span className="font-semibold text-white">R$ {parseFloat(oteBaseSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Comissão Variável Estimada:</span>
                  <span className="font-semibold text-emerald-400">+ R$ {calcVariable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Acelerador de Alto Desempenho:</span>
                  <span className={`font-semibold ${calcBonus > 0 ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`}>
                    {calcBonus > 0 ? `+ R$ ${calcBonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Não Qualificado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <Button 
                onClick={() => {
                  toast.success(`Parâmetros de comissionamento de R$ ${totalOTE.toLocaleString()} salvos para o colaborador!`);
                }}
                className="w-full bg-[#2563EB] hover:bg-blue-600 font-black text-[9px] uppercase tracking-widest h-11 rounded-xl"
              >
                Aplicar Modelo Salarial
              </Button>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}
