import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MoreHorizontal, Mail, Phone, Calendar, Search, Settings2, Users, Flame, CheckCircle2 } from "lucide-react";
import { NewLeadModal } from "../../components/ui/NewLeadModal";
import { LeadDetailsModal } from "../../components/ui/LeadDetailsModal";
import { useData } from "../../contexts/DataContext";

import { PageContainer } from "../../components/PageContainer";

export default function Leads() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState("Todas");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const { leads, updateLead } = useData();

  const temperatureOrder: Record<string, number> = {
    "quente": 3,
    "morno": 2,
    "frio": 1,
    "none": 0
  };

  const filteredLeads = leads
    .filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(l => temperatureFilter === "Todas" || (l.temperature === temperatureFilter))
    .sort((a, b) => {
      const valA = temperatureOrder[a.temperature || "none"] || 0;
      const valB = temperatureOrder[b.temperature || "none"] || 0;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

  const statsSummary = {
    total: leads.length,
    hot: leads.filter(l => l.priority === 'Alta').length,
    closed: leads.filter(l => l.status === 'Fechado').length
  };

  return (
    <PageContainer
      title="Gestão de Leads Axis"
      description="Centralize, qualifique e converta oportunidades em clientes de forma inteligente."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Temp:</span>
            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="bg-[#111827] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2563EB] h-10"
            >
              <option value="Todas">Todas</option>
              <option value="quente">🔥 Quente</option>
              <option value="morno">☀️ Morno</option>
              <option value="frio">❄️ Frio</option>
            </select>
          </div>
          <Button variant="outline" className="h-10 border-white/10 bg-[#111827] text-white hover:bg-white/5">
            <Settings2 className="w-4 h-4 mr-2" /> Filtros
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="h-10 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold h-11 px-6 rounded-xl">
            Adicionar Lead
          </Button>
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 border-[#2563EB]/20 bg-[#111827]/80 backdrop-blur-xl group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total de Leads</span>
             <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <h3 className="text-3xl font-extrabold text-white">{statsSummary.total}</h3>
        </Card>
        <Card className="p-5 border-yellow-500/20 bg-[#111827]/80 backdrop-blur-xl group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Alta Prioridade</span>
             <Flame className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-yellow-500">{statsSummary.hot}</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Urgentes</span>
          </div>
        </Card>
        <Card className="p-5 border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ganhos Mês</span>
             <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400">{statsSummary.closed}</h3>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar leads por nome, empresa ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#111827]/50 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#2563EB] w-full"
          />
        </div>
      </div>

      {/* Desktop / Tablet Table View */}
      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nome & Empresa</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status / Prioridade</th>
                <th className="px-6 py-4">Valor Estimado</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Última Interação</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-[#06B6D4] transition-colors">{lead.name}</div>
                    <div className="text-slate-400 text-xs">{lead.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3 h-3 text-slate-500" /> {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 mt-1 text-xs">
                      <Phone className="w-3 h-3 text-slate-500" /> {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                        <span className={`w-fit px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                            lead.status === "Novo" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            lead.status === "Qualificado" ? "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20" :
                            lead.status === "Em Negociação" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            lead.status === "Fechado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                        {lead.status}
                        </span>
                        <span className={`w-fit px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                            lead.priority === "Alta" ? "bg-red-500/20 text-red-500" :
                            lead.priority === "Média" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-blue-500/20 text-blue-500"
                        }`}>
                            {lead.priority}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{lead.value}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.seller || ""}
                      onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                      className="bg-[#0B1120]/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#2563EB] cursor-pointer hover:bg-white/5"
                    >
                      <option value="" className="text-slate-400">Sem Vendedor</option>
                      <option value="Carlos Eduardo Mendes" className="text-white">Carlos Eduardo Mendes</option>
                      <option value="Ana Silva" className="text-white">Ana Silva</option>
                      <option value="Roberto Ramos" className="text-white">Roberto Ramos</option>
                      <option value="Juliana Costa" className="text-white">Juliana Costa</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {lead.date}
                    </div>
                    <div className="text-[10px] mt-1 italic">{lead.title}</div>
                    {lead.timeIdle !== undefined && (
                      <div className="mt-2 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                           lead.timeIdle > 7 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse inline-block' : 'bg-slate-800 text-slate-400 inline-block'
                        }`}>
                          ⏳ {lead.timeIdle} dias sem contato
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card List View (Phones) */}
      <div className="space-y-4 sm:hidden">
        {filteredLeads.map((lead) => (
          <Card 
            key={lead.id} 
            onClick={() => setSelectedLead(lead)} 
            className="p-4 bg-[#111827]/80 border-white/5 active:border-white/20 transition-all flex flex-col gap-3 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm group-hover:text-[#06B6D4] transition-colors truncate">{lead.name}</h4>
                <p className="text-xs text-slate-400 truncate">{lead.company}</p>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase shrink-0 ${
                lead.priority === "Alta" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                lead.priority === "Média" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}>
                {lead.priority}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-2.5 bg-white/[0.01] px-2 rounded-lg">
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Valor Estimado</span>
                <span className="font-mono text-white text-xs">{lead.value}</span>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Status</span>
                <span className={`w-fit px-2 py-0.5 text-[8px] font-black rounded-full border block ${
                  lead.status === "Novo" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  lead.status === "Qualificado" ? "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20" :
                  lead.status === "Em Negociação" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                  lead.status === "Fechado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 flex-wrap gap-1">
              <span className="truncate">{lead.email}</span>
              <span className="shrink-0 font-medium">{lead.phone}</span>
            </div>

            <div className="mt-1 bg-[#0B1120] border border-white/5 px-2 py-1.5 rounded-lg flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-[8px] text-slate-500 uppercase font-black shrink-0">Responsável:</span>
              <select
                value={lead.seller || ""}
                onChange={(e) => updateLead(lead.id, { seller: e.target.value })}
                className="bg-transparent text-[10px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 cursor-pointer min-w-0"
              >
                <option value="" className="text-slate-400 bg-[#111827]">Sem Vendedor</option>
                <option value="Carlos Eduardo Mendes" className="text-white bg-[#111827]">Carlos Eduardo Mendes</option>
                <option value="Ana Silva" className="text-white bg-[#111827]">Ana Silva</option>
                <option value="Roberto Ramos" className="text-white bg-[#111827]">Roberto Ramos</option>
                <option value="Juliana Costa" className="text-white bg-[#111827]">Juliana Costa</option>
              </select>
            </div>
          </Card>
        ))}
        {filteredLeads.length === 0 && (
          <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
            Nenhum lead encontrado
          </div>
        )}
      </div>

      <NewLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <LeadDetailsModal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} lead={selectedLead} />
    </PageContainer>
  );
}
