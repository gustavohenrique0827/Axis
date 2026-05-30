import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Target, Columns3, ExternalLink } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { ActionModal } from "../../../components/ui/ActionModal";

export function ConfigCRMCampos() {
  const { customLeadFields, setCustomLeadFields } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const handleSave = (field: any) => {
    if (editingField) {
      setCustomLeadFields(customLeadFields.map(f => f.id === editingField.id ? { ...field, id: editingField.id } : f));
    } else {
      setCustomLeadFields([...customLeadFields, { ...field, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingField(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campos Personalizados (CRM)</h1>
          <p className="text-sm text-slate-400">Defina campos adicionais e validações para seus leads.</p>
        </div>
        <Button onClick={() => { setEditingField(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
      </div>
      
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <div className="space-y-3">
            {customLeadFields.map((field) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                 <div className="flex flex-col">
                   <span className="font-bold text-white">{field.name}</span>
                   <div className="flex gap-4 mt-0.5">
                     <span className="text-xs text-slate-500 font-mono">Tipo: {field.type}</span>
                     {field.validationRegex && <span className="text-xs text-slate-500 font-mono italic">Regex: {field.validationRegex}</span>}
                   </div>
                 </div>
                 <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white group-hover:opacity-100 opacity-0" onClick={() => { setEditingField(field); setIsModalOpen(true); }}>Editar</Button>
              </div>
            ))}
         </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? "Editar Campo" : "Novo Campo"}
        actionText="Salvar"
        fields={[
          { name: "name", label: "Nome do Campo", type: "text", required: true, defaultValue: editingField?.name },
          { name: "type", label: "Tipo de Dado", type: "select", options: ["Texto", "Número", "Data"], defaultValue: editingField?.type },
          { name: "required", label: "Obrigatório", type: "checkbox", defaultValue: editingField?.required },
          { name: "validationRegex", label: "Validação (Regex)", type: "text", defaultValue: editingField?.validationRegex }
        ]}
        onAction={(data: any) => handleSave(data)}
      />
    </div>
  );
}

export function ConfigCRMFunis() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funis & Etapas</h1>
          <p className="text-sm text-slate-400">Configure os pipelines de vendas da empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Funil</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Columns3 className="w-5 h-5 text-[#2563EB]" /> Funil Principal Exemplo</h3>
        <div className="space-y-3">
          {['Prospecção', 'Qualificação', 'Proposta Enviada', 'Negociação', 'Fechamento'].map((etapa, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-slate-400">{i+1}</div>
                 <span className="font-bold text-white">{etapa}</span>
               </div>
               <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar Etapa</Button>
            </div>
          ))}
        </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Funil"
        actionText="Criar Funil"
        fields={[
          { name: "nome", label: "Nome do Funil", type: "text", required: true }
        ]}
      />
    </div>
  );
}

export function ConfigCRMOrigens() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Origens de Leads</h1>
                    <p className="text-sm text-slate-400">Classificação de onde seus leads estão vindo.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Origem</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {['Google Ads', 'Meta Ads', 'Orgânico', 'Indicação', 'Prospecção Ativa (Outbound)', 'Parceiros'].map((origem, i) => (
                    <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex justify-between items-center gap-4 group">
                        <span className="font-semibold text-slate-200">{origem}</span>
                        <Target className="w-4 h-4 text-slate-500 group-hover:text-[#2563EB]" />
                    </Card>
                ))}
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Origem"
                actionText="Cadastrar Origem"
                fields={[
                { name: "nome", label: "Nome da Origem", type: "text", required: true }
                ]}
            />
        </div>
    );
}

export function ConfigCRMProdutos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customFields, setCustomFields] = useState([
    { id: 1, name: "Código SKU", type: "Texto" },
    { id: 2, name: "Peso (kg)", type: "Número" },
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-400">Personalize os dados de produtos e serviços.</p>
        </div>
      </div>
      
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <h3 className="font-bold text-lg mb-2">Acesso ao Catálogo</h3>
         <p className="text-slate-400 mb-4 text-sm">O catálogo principal foi movido para o menu lateral. Acesse "Produtos" na barra de navegação esquerda.</p>
         <Button onClick={() => window.location.href='/app/produtos'} className="bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Produtos <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg">Campos Personalizados</h3>
              <p className="text-sm text-slate-400">Adicione mais detalhes aos produtos (SKU, dimensões, atributos específicos).</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold h-9 bg-transparent border border-white/10 shadow-none"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
         </div>
         
         <div className="space-y-3">
           {customFields.map((field) => (
             <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{field.name}</span>
                  <span className="text-xs text-slate-500 font-mono mt-0.5">Tipo: {field.type}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">Editar Campo</Button>
             </div>
           ))}
         </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Campo Personalizado"
        actionText="Salvar Campo"
        fields={[
          { name: "nome", label: "Nome do Campo (ex: Código SKU)", type: "text", required: true },
          { name: "tipo", label: "Tipo de Dado", type: "select", options: ["Texto", "Número", "Data", "Verdadeiro / Falso (Checkbox)"] }
        ]}
      />
    </div>
  );
}
