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
          <Button variant="outline">
             Biblioteca
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Criar Fluxo
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-20">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leads em Fluxo", value: "0", icon: Users },
          { label: "Emails Enviados", value: "0", icon: Mail },
          { label: "Conversões Assist.", value: "0", icon: MousePointer2 },
          { label: "Eficiência Média", value: "0%", icon: BarChart3 },
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou gatilho..."
            className="w-full pl-12 h-12 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2">
           <button
             onClick={() => setActiveFilter(activeFilter === 'Ativa' ? null : 'Ativa')}
             className={`inline-flex items-center rounded-full h-10 px-4 cursor-pointer transition-all border text-xs ${activeFilter === 'Ativa' ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
           >
             Ativas
           </button>
           <button
             onClick={() => setActiveFilter(activeFilter === 'Pausada' ? null : 'Pausada')}
             className={`inline-flex items-center rounded-full h-10 px-4 cursor-pointer transition-all border text-xs ${activeFilter === 'Pausada' ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
           >
             Pausadas
           </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className={`p-6 ${item.status === 'Pausada' ? 'opacity-70' : ''}`}>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <Zap className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <h3 className="text-sm font-medium text-white mb-0.5">{item.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Ativa' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                         {item.trigger}
                      </div>
                   </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                   item.status === 'Ativa' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                   item.status === 'Pausada' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                   'text-slate-400 border-white/10 bg-white/5'
                }`}>
                  {item.status}
                </span>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-xs text-slate-500 mb-1">Passos</div>
                   <div className="text-lg font-semibold text-white">{item.steps}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-xs text-slate-500 mb-1">Ativos</div>
                   <div className="text-lg font-semibold text-white">{item.activeCount}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                   <div className="text-xs text-slate-500 mb-1">Conversão</div>
                   <div className="text-lg font-semibold text-white">{item.conversion}</div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-xs text-slate-500">Última execução: {item.lastRun}</div>
                <div className="flex gap-2">
                   <Button
                    onClick={() => toggleStatus(item.id)}
                    size="icon"
                    variant="ghost"
                   >
                      {item.status === 'Ativa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                   </Button>
                   <Button size="icon" variant="ghost">
                      <Settings className="w-4 h-4" />
                   </Button>
                   <Button size="icon" variant="ghost">
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
          <Card className="w-full max-w-md p-6">
            <h2 className="text-lg font-medium text-white mb-4">Criar Novo Fluxo</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome da Automação</label>
                <Input
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Ex: Boas-vindas Black Friday"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Gatilho Inicial</label>
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
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFlow}>
                Criar Automação
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
