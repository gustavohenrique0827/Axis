import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { MessageSquare, ExternalLink, Bell, Plus, Sparkles } from "lucide-react";
import { NovoModeloModal } from "../../../components/ui/NovoModeloModal";
import { Reorder } from "motion/react";
import { toast } from "sonner";
import { useData } from "../../../contexts/DataContext";

export function ConfigEngajamentoModelos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([
    { id: "1", nome: "Saudação Inicial", tipo: "WhatsApp", uso: 142, conteudo: "Olá {{name}}, como posso ajudar?" }
  ]);

  const handleSave = (data: any) => {
    const newTemplate = {
      ...data,
      id: Math.random().toString(36).substring(7),
      uso: 0
    };
    setTemplates([newTemplate, ...templates]);
    toast.success("Modelo de mensagem salvo!");
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modelos de Mensagem</h1>
          <p className="text-sm text-slate-400">Gerencie os templates de comunicação automatizada da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Modelo</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((modelo: any, i) => (
          <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <MessageSquare className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">{modelo.nome}</h4>
                <div className="text-xs text-slate-400 mt-1 flex gap-2 items-center">
                  <span className="bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{modelo.tipo}</span>
                  <span>&bull;</span>
                  <span>Usado: {modelo.uso}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 shrink-0">Editar Modelo</Button>
          </Card>
        ))}
      </div>

      <NovoModeloModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export function ConfigEngajamentoAutomacoes() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regras de Automação</h1>
          <p className="text-sm text-slate-400">Gatilhos do sistema baseados em eventos do pipeline.</p>
        </div>
        <Button onClick={() => window.location.href = '/app/automacoes'} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Automação</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <p className="text-slate-400">O construtor central de automações agora possui uma tela dedicada em tela cheia.</p>
        <Button onClick={() => window.location.href = '/app/automacoes'} className="mt-4 bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Abrir Motor de Automação <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>
    </div>
  );
}

export function ConfigBusinessDashboard() {
  const [selectedKPIs, setSelectedKPIs] = useState<{ name: string, alertEnabled: boolean, target: number }[]>([]);
  const [availableKPIs] = useState(['Receita (MRR)', 'Leads Totais', 'Conversão', 'Win Rate', 'Churn Rate', 'Score IA Médio']);

  const toggleKPI = (kpiName: string) => {
    if (selectedKPIs.find(k => k.name === kpiName)) {
      setSelectedKPIs(prev => prev.filter(p => p.name !== kpiName));
    } else {
      setSelectedKPIs(prev => [...prev, { name: kpiName, alertEnabled: false, target: 0 }]);
    }
  };

  const updateKPI = (name: string, field: 'alertEnabled' | 'target', value: any) => {
    setSelectedKPIs(prev => prev.map(k => k.name === name ? { ...k, [field]: value } : k));
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Nome,Alerta,Meta"].concat(selectedKPIs.map(kpi => `${kpi.name},${kpi.alertEnabled},${kpi.target}`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_kpis.csv");
    document.body.appendChild(link);
    link.click();
    toast.success("Relatório de KPIs exportado com sucesso!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Negócios</h1>
          <p className="text-sm text-slate-400">Personalize os KPIs e alertas da tela inicial.</p>
        </div>
        <Button onClick={handleExport} className="bg-white/10 hover:bg-white/20 border border-white/10">Exportar Relatório</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <Reorder.Group axis="y" values={selectedKPIs} onReorder={setSelectedKPIs} className="space-y-4">
          {selectedKPIs.map((kpi) => (
            <Reorder.Item key={kpi.name} value={kpi} className="flex items-center justify-between p-4 bg-[#0B1120] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">{kpi.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={kpi.alertEnabled} onChange={(e) => updateKPI(kpi.name, 'alertEnabled', e.target.checked)} className="rounded border-white/10 bg-white/5" />
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Bell className="w-3 h-3" /> Alerta (Meta: {kpi.target})</span>
                  <input type="number" value={kpi.target} onChange={(e) => updateKPI(kpi.name, 'target', Number(e.target.value))} className="w-20 bg-[#111827] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleKPI(kpi.name)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 cursor-pointer"
                />
              </div>
            </Reorder.Item>
          ))}
          {availableKPIs.filter(kpi => !selectedKPIs.find(s => s.name === kpi)).map(kpi => (
            <div key={kpi} className="flex items-center justify-between p-4 bg-[#0B1120] border border-white/5 rounded-xl opacity-60">
              <span className="font-bold text-white">{kpi}</span>
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleKPI(kpi)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 cursor-pointer"
              />
            </div>
          ))}
        </Reorder.Group>
        <Button onClick={() => toast.success("Configuração de Dashboard salva com sucesso!")} className="mt-6 bg-[#2563EB] hover:bg-blue-600 font-bold px-6">Salvar Dashboards</Button>
      </Card>
    </div>
  )
}
