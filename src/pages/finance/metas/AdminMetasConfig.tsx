import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { 
  Target, Sparkles, AlertTriangle, ShieldCheck
} from "lucide-react";
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { toast } from "sonner";
import { SquadMeta, AlertMessage } from "./useFinanceiroMetas";

interface AdminMetasConfigProps {
  squads: SquadMeta[];
  setSquads: React.Dispatch<React.SetStateAction<SquadMeta[]>>;
  selectedSquadId: string;
  setSelectedSquadId: (id: string) => void;
  formName: string;
  setFormName: (val: string) => void;
  formFocus: string;
  setFormFocus: (val: string) => void;
  formMeta: number;
  setFormMeta: (val: number) => void;
  formBaseComissao: number;
  setFormBaseComissao: (val: number) => void;
  formBonusSuperador: number;
  setFormBonusSuperador: (val: number) => void;
  formPeriod: "monthly" | "quarterly";
  setFormPeriod: (val: "monthly" | "quarterly") => void;
  period: "monthly" | "quarterly" | "annual";
  setPeriod: (val: "monthly" | "quarterly" | "annual") => void;
  attentionThreshold: number;
  setAttentionThreshold: (val: number) => void;
  alerts: AlertMessage[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertMessage[]>>;
}

export function AdminMetasConfig({
  squads,
  setSquads,
  selectedSquadId,
  setSelectedSquadId,
  formName,
  setFormName,
  formFocus,
  setFormFocus,
  formMeta,
  setFormMeta,
  formBaseComissao,
  setFormBaseComissao,
  formBonusSuperador,
  setFormBonusSuperador,
  formPeriod,
  setFormPeriod,
  period,
  setPeriod,
  attentionThreshold,
  setAttentionThreshold,
  alerts,
  setAlerts
}: AdminMetasConfigProps) {
  const salesEvolutionData = [
    { name: "Semana 1", GTech: 20000, Palmas: 60000, Outbound: 10000 },
    { name: "Semana 2", GTech: 45000, Palmas: 120000, Outbound: 25000 },
    { name: "Semana 3", GTech: 68000, Palmas: 195000, Outbound: 32000 },
    { name: "Semana 4 (Proj)", GTech: 89000, Palmas: 265000, Outbound: 45000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Distribution Chart */}
      <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0 rounded-3xl">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Evolução do Faturamento Semanal</h4>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Divisão proporcional por Squad ativo</span>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesEvolutionData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickFormatter={(val) => `R$ ${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                itemStyle={{ fontSize: "10px" }}
              />
              <Bar dataKey="Palmas" fill="#3b82f6" stackId="a" name="Palmas Apple" />
              <Bar dataKey="GTech" fill="#10b981" stackId="a" name="G-Tech" />
              <Bar dataKey="Outbound" fill="#6366f1" stackId="a" name="Outbound" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Formulário de Configuração - Área do Administrador */}
      <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0 rounded-3xl">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configuração de Metas (Admin)</h4>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Ajustar faturamento OTE e períodos das equipes</span>

        <form onSubmit={(e) => {
          e.preventDefault();
          setSquads(prev => prev.map(s => {
            if (s.id === selectedSquadId) {
              return {
                ...s,
                name: formName,
                focus: formFocus,
                meta: formMeta,
                comissaoPercent: formBaseComissao,
                bonusSuperador: formBonusSuperador
              };
            }
            return s;
          }));
          toast.success(`Configurações de metas salvas para o ${formName}!`);
        }} className="space-y-4">
          
          {/* Seleção do Squad */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Selecione o Squad</label>
            <select 
              value={selectedSquadId}
              onChange={(e) => setSelectedSquadId(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {squads.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Nome do Squad */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Squad</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Foco Comercial */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Foco Comercial</label>
            <input 
              type="text"
              value={formFocus}
              onChange={(e) => setFormFocus(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Meta Base & Período (Mensal / Trimestral) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Meta Alvo (R$)</label>
              <input 
                type="number"
                value={formMeta}
                onChange={(e) => setFormMeta(Number(e.target.value))}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Período Alvo</label>
              <select 
                value={formPeriod}
                onChange={(e) => {
                  const selectedPeriod = e.target.value as "monthly" | "quarterly";
                  setFormPeriod(selectedPeriod);
                  setPeriod(selectedPeriod === "monthly" ? "monthly" : "quarterly");
                }}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
          </div>

          {/* OTE - Comissão Base & Bônus */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Comissão Base (%)</label>
              <input 
                type="number"
                step="0.1"
                min="1"
                max="25"
                value={formBaseComissao}
                onChange={(e) => setFormBaseComissao(Number(e.target.value))}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Bônus OTE (R$)</label>
              <input 
                type="number"
                value={formBonusSuperador}
                onChange={(e) => setFormBonusSuperador(Number(e.target.value))}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Gatilho Alerta de Atenção (%) */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Gatilho Alerta de Atenção (%)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="50"
                max="150"
                value={attentionThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAttentionThreshold(val);
                }}
                className="flex-1 bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-xs text-slate-500 font-bold font-mono">%</span>
            </div>
            <span className="text-[8px] text-slate-500 block">Define o percentual para as notificações toast e relatórios executivos.</span>
          </div>

          <div className="pt-2 flex gap-2">
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Salvar Meta
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                const newId = `squad-custom-${Date.now()}`;
                const newSquad: SquadMeta = {
                  id: newId,
                  name: `Novo Squad ${squads.length + 1}`,
                  focus: "Novos leads & Contas Médias",
                  meta: 150000,
                  faturamento: 0,
                  comissaoPercent: 5,
                  bonusSuperador: 2500,
                  closers: 1,
                  sdrs: 1
                };
                setSquads(prev => [...prev, newSquad]);
                setSelectedSquadId(newId);
                toast.success("Novo squad comercial provisionado com sucesso!");
              }}
              className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-10 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer"
            >
              + Novo
            </Button>
          </div>
        </form>
      </Card>

      {/* Alert and Warning center feeds */}
      <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Alertas & Gatilhos</h4>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex gap-2 w-full text-left">
              {alert.type === "success" ? (
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : alert.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                  {alert.message}
                </p>
                <span className="text-[8px] font-bold text-slate-600 block mt-1 font-mono uppercase">
                  {alert.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-4 border border-dashed border-white/10 hover:border-white/20 bg-transparent text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          onClick={() => {
            setAlerts(p => [
              {
                id: Date.now().toString(),
                time: "Agora",
                type: "info",
                message: "Log de alertas atualizado de acordo com o funil comercial."
              },
              ...p
            ]);
            toast.success("Logs recarregados em tempo de execução!");
          }}
        >
          Recarregar Alertas
        </Button>
      </Card>

    </div>
  );
}
