import React, { useState, useMemo, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, DollarSign, TrendingUp, AlertCircle, Briefcase, Target, Zap } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { NovaCategoriaTarefaModal } from "../../../components/ui/modals/productivity/NovaCategoriaTarefaModal";
import { NovoPlanoContasModal } from "../../../components/ui/modals/settings/NovoPlanoContasModal";
import { toast } from "sonner";

export function ConfigProdutividadeCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { squads, leads } = useData();
    const [categories, setCategories] = useState<any[]>([
        { id: "1", nome: "Follow-up", cor: "bg-blue-500" },
        { id: "2", nome: "Reunião", cor: "bg-purple-500" },
        { id: "3", nome: "Proposta", cor: "bg-emerald-500" }
    ]);

    const handleSave = (data: any) => {
        setCategories([{ ...data, id: Date.now().toString() }, ...categories]);
        toast.success("Categoria de tarefa criada!");
        setIsModalOpen(false);
    };

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
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 px-6"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>

            {/* CAC Visualization Section */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm text-slate-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-400" /> Custo de Aquisição (CAC) por Squad
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Investimento Mensal / Novos Leads (Mês Atual)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cacData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff10', borderRadius: '12px' }}
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
                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{sq.name}</span>
                                    <span className={`text-xs font-medium ${sq.cac > 200 ? 'text-rose-400' : 'text-emerald-400'}`}>R$ {sq.cac.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                    <span>leads: {sq.leads}</span>
                                    <span>verba: R$ {sq.budget}</span>
                                </div>
                            </div>
                        ))}
                        {cacData.some(s => s.leads === 0) && (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] text-amber-500">Alguns squads estão sem leads novos este mês</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                {categories.map((cat: any, i) => (
                    <Card key={i} className="p-4 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${cat.cor}`}></div>
                            <span className="font-semibold text-slate-200">{cat.nome}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
                    </Card>
                ))}
            </div>

            <NovaCategoriaTarefaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}

export function ConfigFinanceiroCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string, nome: string, tipo: "Receita" | "Despesa" }[]>(() => {
        const saved = localStorage.getItem("axis_finance_categories");
        return saved ? JSON.parse(saved) : [
            { id: "1", nome: "Vendas PRO", tipo: "Receita" },
            { id: "2", nome: "Licença Mensal", tipo: "Receita" },
            { id: "3", nome: "Servidores AWS", tipo: "Despesa" },
            { id: "4", nome: "Marketing & Ads", tipo: "Despesa" }
        ];
    });

    useEffect(() => {
        localStorage.setItem("axis_finance_categories", JSON.stringify(categories));
    }, [categories]);

    const handleSave = (data: { nome: string, tipo: "Receita" | "Despesa" }) => {
        setCategories(prev => [...prev, { ...data, id: Date.now().toString() }]);
        toast.success("Nova categoria financeira cadastrada!");
        setIsModalOpen(false);
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Planos de Contas (Categorias)</h1>
                    <p className="text-sm text-slate-400">Categorias para classificar receitas e despesas.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 px-6"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>

            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="font-medium text-lg mb-4 text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Receitas</h3>
                    <div className="space-y-2">
                        {categories.filter(c => c.tipo === "Receita").map((cat, i) => (
                            <div key={i} className="p-3 bg-[var(--color-surface)] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat.nome}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-medium text-lg mb-4 text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-rose-400" /> Despesas</h3>
                    <div className="space-y-2">
                        {categories.filter(c => c.tipo === "Despesa").map((cat, i) => (
                            <div key={i} className="p-3 bg-[var(--color-surface)] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat.nome}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <NovoPlanoContasModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
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
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Gestão Financeira de Times & CAC <Briefcase className="w-5 h-5 text-slate-400" /></h1>
                <p className="text-sm text-slate-400 mt-1">Configure o orçamento mensal de cada squad para cálculo automático de Custo de Aquisição de Clientes (CAC) em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {squads.map(sq => {
                    const squadLeadsCount = leads.filter(l => sq.membros.some(m => l.seller && m.includes(l.seller))).length || 1;
                    const cac = sq.orcamentoMensal / squadLeadsCount;

                    return (
                        <Card className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                <Target className="w-4 h-4 text-slate-400" />
                                <div>
                                    <h4 className="text-sm font-medium text-white">{sq.nome}</h4>
                                    <p className="text-xs text-slate-500">{sq.membros.length} Integrantes</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 w-full md:w-2/3 justify-end items-center">
                                <div className="w-full sm:w-48 space-y-1.5">
                                    <label className="text-xs text-slate-500 block">Orçamento Mensal (Spend)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">R$</span>
                                        <input
                                            type="number"
                                            defaultValue={sq.orcamentoMensal}
                                            onBlur={(e) => handleUpdateBudget(sq.id, e.target.value)}
                                            className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-2 px-4 rounded-xl text-center min-w-[120px]">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">CAC Sugerido</span>
                                    <span className="text-sm font-medium text-white">R$ {cac.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-white block mb-0.5">Como funciona o CAC por Squad?</strong>
                    O sistema cruza o orçamento mensal alocado acima com os leads ganhos/gerados atribuídos aos membros do squad.
                    O cálculo é: <code className="text-amber-400 font-mono">Orcamento / Total_Leads_no_Periodo</code>.
                    Manter orçamentos precisos permite que a IA identifique qual squad tem a melhor eficiência financeira na prospecção.
                </p>
            </div>
        </div>
    );
}
