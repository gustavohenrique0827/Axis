import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Store, Users, Key, Target, Briefcase, DollarSign, ExternalLink } from "lucide-react";
import { ActionModal } from "../../../components/ui/ActionModal";

export function ConfigEmpresaFiliais() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filiais / Unidades</h1>
          <p className="text-sm text-slate-400">Cadastre múltiplas unidades da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Filial</Button>
      </div>

      <div className="grid gap-4">
        {[].map((filial: any, i) => (
          <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                 <Store className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                 <h4 className="font-bold text-white">{filial.nome}</h4>
                 <div className="text-xs text-slate-400 mt-1 flex gap-3">
                    <span>CNPJ: {filial.cnpj}</span>
                    <span>{filial.cidade}</span>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${filial.status === 'Principal' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'bg-emerald-500/20 text-emerald-400'}`}>{filial.status}</span>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Filial"
        actionText="Cadastrar Filial"
        fields={[
          { name: "nome", label: "Nome da Unidade", type: "text", required: true },
          { name: "cnpj", label: "CNPJ", type: "text", required: true },
          { name: "cidade", label: "Cidade / Estado", type: "text", required: true }
        ]}
      />
    </div>
  );
}

export function ConfigEmpresaEquipe() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe & Convites</h1>
          <p className="text-sm text-slate-400">Convide novos membros para sua empresa no Axis.</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Users className="w-4 h-4 mr-2" /> Convidar Membro</Button>
      </div>
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <p className="text-slate-400">Gerenciamento de equipe movido para o menu principal. Acesse "Equipe" na barra lateral esquerda.</p>
         <Button onClick={() => window.location.href='/app/equipe'} className="mt-4 bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Gestão de Equipe <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>
    </div>
  );
}

export function ConfigEmpresaPermissoes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis & Permissões</h1>
          <p className="text-sm text-slate-400">Controle o nível de acesso (RBAC) de cada perfil.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Perfil</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {[].map((p: any, i) => (
           <Card key={i} className="p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-2 rounded-lg ${p.bg}`}>
                    <p.icon className={`w-5 h-5 ${p.color}`} />
                 </div>
                 <div className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">{p.usuarios} usuários</div>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">{p.perfil}</h3>
              <p className="text-xs text-slate-400 h-8">{p.modulos}</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                 <button className="text-xs font-bold text-[#2563EB] hover:text-blue-400 uppercase tracking-widest">Editar Permissões</button>
              </div>
           </Card>
        ))}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Perfil"
        actionText="Cadastrar Perfil"
        fields={[
          { name: "nome", label: "Nome do Perfil", type: "text", required: true },
          { name: "modulos", label: "Módulos de Acesso (Separados por vírgula)", type: "text" }
        ]}
      />
    </div>
  );
}
