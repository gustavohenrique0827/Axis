import { useState } from "react";
import { 
  Zap, Search, Plus, Filter, Play, 
  Settings, Users, Mail, MessageSquare,
  BarChart3, Clock, ChevronRight, Pause,
  Share2, MousePointer2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  steps: number;
  activeCount: number;
  conversion: string;
  status: 'Ativa' | 'Pausada' | 'Rascunho';
  lastRun: string;
}



import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";

import { useData } from "../../contexts/DataContext";

export default function MarketingAutomacoes() {
  const { marketingAutomations: automations, setMarketingAutomations } = useData();
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
    const newAutomation: Automation = {
      id: Math.random().toString(36).substring(7),
      name: newFlowName,
      trigger: newFlowTrigger,
      steps: 1,
      activeCount: 0,
      conversion: "0%",
      status: "Rascunho",
      lastRun: "-",
    };
    setMarketingAutomations([newAutomation, ...automations]);
    setIsCreateModalOpen(false);
    setNewFlowName("");
    toast.success("Novo fluxo criado com sucesso!");
  };

  const toggleStatus = (id: string) => {
    const a = automations.find(a => a.id === id);
    if (a) {
      const nextStatus = a.status === 'Ativa' ? 'Pausada' : 'Ativa';
      setMarketingAutomations(automations.map(a => a.id === id ? { ...a, status: nextStatus } : a));
      toast.success(`Automação "${a.name}" ${nextStatus === 'Ativa' ? 'ativada' : 'pausada'}`);
    }
  };

  const filtered = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                         a.trigger.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !activeFilter || a.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer
      title="Automações Axis"
      description="Orquestração de jornadas inteligentes e réguas de relacionamento preditivas via MIA-6."
      actions={
        <div className="flex items-center gap-3">
          <Button className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
             Biblioteca
          </Button>
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
          { label: "Leads em Fluxo", value: "0", icon: Users, color: "text-purple-500" },
          { label: "Emails Enviados", value: "0", icon: Mail, color: "text-blue-500" },
          { label: "Conversões Assist.", value: "0", icon: MousePointer2, color: "text-emerald-500" },
          { label: "Eficiência Média", value: "0%", icon: BarChart3, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border-white/5 backdrop-blur-md">
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
                   <div className="text-xl font-display font-black text-white italic">{item.activeCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Conversão</div>
                   <div className="text-xl font-display font-black text-emerald-500 italic">{item.conversion}</div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[10px] font-medium text-slate-600">Última execução: {item.lastRun}</div>
                <div className="flex gap-2">
                   <Button 
                    onClick={() => toggleStatus(item.id)}
                    size="icon" 
                    variant="ghost" 
                    className={`w-10 h-10 rounded-xl bg-white/5 transition-all ${item.status === 'Ativa' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                   >
                      {item.status === 'Ativa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                   </Button>
                   <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      <Settings className="w-4 h-4" />
                   </Button>
                   <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                      <Share2 className="w-4 h-4" />
                   </Button>
                </div>
             </div>
          </Card>
        ))}
      </div>
      </div>

      {/* Modal de Criação */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-[var(--color-surface)] border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Criar Novo Fluxo</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nome da Automação</label>
                <Input 
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Ex: Boas-vindas Black Friday"
                  className="bg-[var(--color-surface-elevated)] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Gatilho Inicial</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg bg-[var(--color-surface-elevated)] border border-white/10 text-white text-sm"
                  value={newFlowTrigger}
                  onChange={(e) => setNewFlowTrigger(e.target.value)}
                >
                  <option value="Novo Lead">Novo Lead</option>
                  <option value="Carrinho Abandonado">Carrinho Abandonado</option>
                  <option value="Compra Aprovada">Compra Aprovada</option>
                  <option value="Data Específica">Data Específica</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleCreateFlow} className="bg-purple-600 hover:bg-purple-700 text-white">
                Criar Automação
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
