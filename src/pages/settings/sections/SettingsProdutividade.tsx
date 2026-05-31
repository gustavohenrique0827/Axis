import React, { useState, useMemo } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, DollarSign, TrendingUp, AlertCircle, Briefcase, Target, Zap } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { ActionModal } from "../../../components/ui/ActionModal";
import { toast } from "sonner";

export function ConfigProdutividadeCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { squads, leads } = useData();

    const cacData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return squads.map(sq => {
            // Count leads assigned to members of this squad in current month
            const newLeads = leads.filter(l => {
                const leadDate = new Date(l.date.replace('Hoje, ', '').replace('Ontem, ', '')); // Simple parser
                const isCurrentMonth = leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
                return isCurrentMonth && sq.membros.some(m => l.seller && m.includes(l.seller.split(' ')[0]));
            }).length;

            const cac = newLeads > 0 ? (sq.orcamentoMensal / newLeads) : 0;

            return {
                name: sq.nome.split(' ')[1] || sq.nome,
                cac: cac,
                leads: newLeads,
                budget: sq.orcamentoMensal
            };
        });
    }, [squads, leads]);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorias & Produtividade</h1>
                    <p className="text-sm text-slate-400">Organize as tarefas e visualize o CAC por time comercial.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>

            {/* CAC Visualization Section */}
            <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden relative group">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Custo de Aquisição (CAC) por Squad
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Investimento Mensal / Novos Leads (Mês Atual)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cacData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', color: '#fff' }}
                                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'CAC']}
                                />
                                <Bar dataKey="cac" radius={[4, 4, 0, 0]} barSize={32}>
                                    {cacData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.cac > 200 ? '#f43f5e' : '#10b981'} fillOpacity={0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {cacData.map((sq, i) => (
                            <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase truncate max-w-[150px]">{sq.name}</span>
                                    <span className={`text-[10px] font-black ${sq.cac > 200 ? 'text-rose-400' : 'text-emerald-400'}`}>R$ {sq.cac.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase">
                                    <span>leads: {sq.leads}</span>
                                    <span>verba: R$ {sq.budget}</span>
                                </div>
                            </div>
                        ))}
                        {cacData.some(s => s.leads === 0) && (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[9px] text-amber-500 font-bold uppercase">Alguns squads estão sem leads novos este mês</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                {[].map((cat: any, i) => (
                    <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${cat.cor}`}></div>
                            <span className="font-semibold text-slate-200">{cat.nome}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
                    </Card>
                ))}
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Categoria de Tarefa"
                fields={[
                { name: "nome", label: "Nome da Categoria", type: "text", required: true },
                { name: "cor", label: "Cor", type: "select", options: ["Azul", "Verde", "Vermelho", "Laranja", "Roxo"] }
                ]}
            />
        </div>
    );
}

export function ConfigFinanceiroCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Planos de Contas (Categorias)</h1>
                    <p className="text-sm text-slate-400">Categorias para classificar receitas e despesas.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>
            
            <div className="space-y-6">
                <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-[#10B981] flex items-center gap-2"><DollarSign className="w-5 h-5" /> Receitas</h3>
                    <div className="space-y-2">
                        {[].map((cat: any, i) => (
                            <div key={i} className="p-3 bg-[#0B1120] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Despesas</h3>
                    <div className="space-y-2">
                        {[].map((cat: any, i) => (
                            <div key={i} className="p-3 bg-[#0B1120] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Plano de Constas"
                fields={[
                { name: "nome", label: "Nome da Categoria", type: "text", required: true },
                { name: "tipo", label: "Tipo", type: "select", options: ["Receita", "Despesa"] }
                ]}
            />
        </div>
    );
}

export function ConfigFinanceiroSquads() {
  const { squads, updateSquad, leads } = useData();

  const handleUpdateBudget = (id: string, budget: string) => {
    updateSquad(id, { orcamentoMensal: parseFloat(budget) || 0 });
    toast.success("Orçamento do squad atualizado!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Gestão Financeira de Times & CAC <Briefcase className="w-5 h-5 text-blue-500"/></h1>
        <p className="text-sm text-slate-400 mt-1">Configure o orçamento mensal de cada squad para cálculo automático de Custo de Aquisição de Clientes (CAC) em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {squads.map(sq => {
          const squadLeadsCount = leads.filter(l => sq.membros.some(m => l.seller && m.includes(l.seller))).length || 1;
          const cac = sq.orcamentoMensal / squadLeadsCount;

          return (
            <Card key={sq.id} className="bg-[#111827]/80 border border-white/10 p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{sq.nome}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{sq.membros.length} Integrantes</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-2/3 justify-end items-center">
                <div className="w-full sm:w-48 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Orçamento Mensal (Spend)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">R$</span>
                    <input 
                      type="number"
                      defaultValue={sq.orcamentoMensal}
                      onBlur={(e) => handleUpdateBudget(sq.id, e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/10 p-2 px-4 rounded-xl text-center min-w-[120px]">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">CAC Sugerido</span>
                  <span className="text-sm font-bold text-white italic">R$ {cac.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3">
        <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-white block mb-0.5 uppercase tracking-wide">Como funciona o CAC por Squad?</strong>
          O sistema cruza o orçamento mensal alocado acima com os leads ganhos/gerados atribuídos aos membros do squad. 
          O cálculo é: <code className="text-yellow-400 font-mono">Orcamento / Total_Leads_no_Periodo</code>. 
          Manter orçamentos precisos permite que a IA identifique qual squad tem a melhor eficiência financeira na prospecção.
        </p>
      </div>
    </div>
  );
}
