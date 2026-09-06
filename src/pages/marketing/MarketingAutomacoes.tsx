import { useState } from "react";
import {
  Zap, Search, Plus, Play,
  Users, Mail,
  BarChart3, Pause, Trash2,
  MousePointer2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Modal } from "../../components/ui/modal";
import { confirmDialog } from "../../components/ui/confirm-dialog";

interface Automation {
  id: string;
  name: string;
  trigger: string | null;
  steps: number;
  active_count: number;
  conversion_rate: number;
  status: 'Ativa' | 'Pausada' | 'Rascunho';
  last_run: string | null;
}

import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";

import { useData } from "../../contexts/DataContext";

export default function MarketingAutomacoes() {
  const { marketingAutomations, addMarketingAutomation, updateMarketingAutomation, deleteMarketingAutomation } = useData();
  const automations = marketingAutomations as Automation[];
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowTrigger, setNewFlowTrigger] = useState("Novo Lead");

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) {
      toast.error("Preencha o nome da automação");
      return;
    }
    addMarketingAutomation({
      id: Math.random().toString(36).substring(7),
      name: newFlowName,
      trigger: newFlowTrigger,
      steps: 1,
      active_count: 0,
      conversion_rate: 0,
      status: "Rascunho",
      last_run: null,
    });
    setIsCreateModalOpen(false);
    setNewFlowName("");
    toast.success("Novo fluxo criado com sucesso!");
  };

  const toggleStatus = (id: string) => {
    const a = automations.find(a => a.id === id);
    if (a) {
      const nextStatus = a.status === 'Ativa' ? 'Pausada' : 'Ativa';
      updateMarketingAutomation(id, { status: nextStatus });
      toast.success(`Automação "${a.name}" ${nextStatus === 'Ativa' ? 'ativada' : 'pausada'}`);
    }
  };

  const filtered = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                         (a.trigger || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !activeFilter || a.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer
      title="Automações"
      description="Crie fluxos automatizados disparados por eventos do CRM (novo lead, compra aprovada, etc)."
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" /> Criar Fluxo
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-20">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leads em Fluxo", value: automations.reduce((s, a) => s + (a.active_count || 0), 0).toString(), icon: Users, color: "text-indigo-500" },
          // Envio de e-mail em massa por automação ainda não existe no S.P.Y. — mostrar
          // "—" em vez de um número de exemplo até existir uma fonte real.
          { label: "Emails Enviados", value: "—", icon: Mail, color: "text-blue-500" },
          { label: "Conversões Assist.", value: "—", icon: MousePointer2, color: "text-emerald-500" },
          { label: "Eficiência Média", value: automations.length > 0 ? `${(automations.reduce((s, a) => s + (a.conversion_rate || 0), 0) / automations.length).toFixed(1)}%` : "—", icon: BarChart3, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
            <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[var(--color-surface-elevated)]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou gatilho..." 
            className="w-full bg-[var(--color-surface)] border-white/5 pl-12 h-12 rounded-xl text-sm italic focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveFilter(activeFilter === 'Ativa' ? null : 'Ativa')}
             className={`inline-flex items-center rounded-full h-10 px-4 cursor-pointer transition-all border border-white/5 text-[9px] uppercase tracking-widest font-black ${activeFilter === 'Ativa' ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
           >
             Ativas
           </button>
           <button 
             onClick={() => setActiveFilter(activeFilter === 'Pausada' ? null : 'Pausada')}
             className={`inline-flex items-center rounded-full h-10 px-4 cursor-pointer transition-all border border-white/5 text-[9px] uppercase tracking-widest font-black ${activeFilter === 'Pausada' ? 'bg-amber-600 text-white border-amber-500' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
           >
             Pausadas
           </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className={`p-6 border-white/5 hover:border-purple-500/30 transition-all ${item.status === 'Pausada' ? 'bg-[var(--color-surface-elevated)]/30 opacity-80' : 'bg-[var(--color-surface-elevated)]/60'}`}>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                      <Zap className={`w-6 h-6 ${item.status === 'Ativa' ? 'text-purple-500 animate-pulse' : 'text-slate-600'}`} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white mb-0.5">{item.name}</h3>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Ativa' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                         {item.trigger}
                      </div>
                   </div>
                </div>
                <Badge className={`${
                   item.status === 'Ativa' ? 'bg-emerald-500/10 text-emerald-500' : 
                   item.status === 'Pausada' ? 'bg-amber-500/10 text-amber-500' : 
                   'bg-slate-500/10 text-slate-500'
                } font-black uppercase tracking-widest text-[9px] px-2.5 py-1 border-none`}>
                  {item.status}
                </Badge>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Passos</div>
                   <div className="text-xl font-display font-black text-white italic">{item.steps}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Ativos</div>
                   <div className="text-xl font-display font-black text-white italic">{item.active_count}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Conversão</div>
                   <div className="text-xl font-display font-black text-emerald-500 italic">{item.conversion_rate.toFixed(1)}%</div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[10px] font-medium text-slate-600">Última execução: {item.last_run || "nunca executada"}</div>
                <div className="flex gap-2">
                   <Button
                    onClick={() => toggleStatus(item.id)}
                    size="icon"
                    variant="ghost"
                    className={`w-10 h-10 rounded-xl bg-white/5 transition-all ${item.status === 'Ativa' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                   >
                      {item.status === 'Ativa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                   </Button>
                   <Button
                    onClick={async () => {
                      if (!(await confirmDialog({ title: "Excluir automação", description: `Excluir o fluxo "${item.name}"? Essa ação não pode ser desfeita.` }))) return;
                      deleteMarketingAutomation(item.id);
                      toast.success("Automação removida.");
                    }}
                    size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
             </div>
          </Card>
        ))}
      </div>
      </div>

      {/* Modal de Criação */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Fluxo"
        description="Configure o nome e gatilho de disparo da régua de automação."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 block">Nome da Automação</label>
            <Input 
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Ex: Boas-vindas Black Friday"
              className="bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 block">Gatilho Inicial</label>
            <select 
              className="w-full h-10 px-3 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
              value={newFlowTrigger}
              onChange={(e) => setNewFlowTrigger(e.target.value)}
            >
              <option value="Novo Lead">Novo Lead</option>
              <option value="Carrinho Abandonado">Carrinho Abandonado</option>
              <option value="Compra Aprovada">Compra Aprovada</option>
              <option value="Data Específica">Data Específica</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border-subtle)]">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="text-xs font-bold">
              Cancelar
            </Button>
            <Button onClick={handleCreateFlow} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold">
              Criar Automação
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
