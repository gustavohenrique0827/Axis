import React, { useState } from 'react';
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { formatCNPJ, validateCNPJ } from "../../lib/utils";

export default function ConfigEmpresaDados() {
  const [cnpj, setCnpj] = useState("00.000.000/0001-00");

  const handleSave = () => {
    if (!validateCNPJ(cnpj)) {
      toast.error("CNPJ inválido. Verifique o formato.");
      return;
    }
    toast.success('Dados salvos com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dados da Empresa</h1>
        <p className="text-sm text-slate-400">Gerencie informações cadastrais da sua empresa.</p>
      </div>

      <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Razão Social</label>
              <input type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none" defaultValue="G-Tech Systems LTDA" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Nome Fantasia</label>
              <input type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none" defaultValue="G-Tech" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">CNPJ</label>
              <input 
                type="text" 
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                maxLength={18}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Inscrição Estadual</label>
              <input type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none" placeholder="Opcional" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Endereço Completo</label>
            <input type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button onClick={handleSave} className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 text-white">
            Salvar Alterações
          </button>
        </div>
      </Card>
    </div>
  );
}
