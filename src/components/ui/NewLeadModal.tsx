import React, { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, Target, AlertTriangle } from "lucide-react";
import { formatPhone, validatePhone } from "../../lib/utils";

export function NewLeadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { leads, addLead, customLeadFields } = useData();
  const { user, allTenantModules } = useAuth();
  const isMaster = user?.isMaster || user?.tenantName?.includes("G-Tech");
  
  const [selectedTenant, setSelectedTenant] = useState(user?.tenantName || "G-Tech Master");

  // State for CNPJ real-time validation
  const [cnpjValue, setCnpjValue] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  
  const [cnpjStatus, setCnpjStatus] = useState<{
    status: 'idle' | 'checking' | 'active' | 'inactive' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  // Custom SDR funnels extra
  const [linkedinLink, setLinkedinLink] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const isEmailDuplicate = leads.some(l => l.email.toLowerCase() === emailValue.toLowerCase() && emailValue !== "");
  const isCnpjDuplicate = leads.some(l => l.cnpj === cnpjValue && cnpjValue !== "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(formatPhone(e.target.value));
  };

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const { formatCNPJ } = await import('../../lib/utils');
    const formatted = formatCNPJ(rawVal);
    setCnpjValue(formatted);

    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 14) {
      setCnpjStatus({ status: 'checking' });
      try {
        // Using BrasilAPI directly in the client
        const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
        if (resp.ok) {
          const result = await resp.json();
          // 2 = ATIVA
          const isActive = result.situacao_cadastral === 2;
          
          setCnpjStatus({ 
            status: isActive ? 'active' : 'inactive', 
            message: result.descricao_situacao_cadastral 
          });
          
          // Auto-fill company name
          if (result.nome_fantasia || result.razao_social) {
            setCompanyValue(result.nome_fantasia || result.razao_social);
          }

          // Auto-fill e-mail if empty
          if (result.email && !emailValue) {
            setEmailValue(result.email.toLowerCase());
          }

          // Auto-fill phone if empty
          if (result.ddd_telefone_1 && !phoneValue) {
            const rawPhone = result.ddd_telefone_1.replace(/\D/g, "");
            const formatted = formatPhone(rawPhone);
            setPhoneValue(formatted);
          }
        } else {
          const errorData = await resp.json().catch(() => ({}));
          setCnpjStatus({ 
            status: 'invalid', 
            message: errorData.message || "CNPJ não encontrado na base de dados." 
          });
        }
      } catch (err) {
        setCnpjStatus({ status: 'invalid', message: "Falha na conexão de validação." });
      }
    } else {
      setCnpjStatus({ status: 'idle' });
    }
  };

  const suggestTags = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAiLoading(true);
    const form = document.getElementById("new-lead-form") as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("/api/leads/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          company: companyValue,
          notes: formData.get("notes")
        }),
      });
      const data = await response.json();
      if (data.tags) {
         setTags(data.tags.join(", "));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cnpj = cnpjValue;

    // Apply custom validations
    for (const field of customLeadFields) {
      if (field.validationRegex) {
        const regex = new RegExp(field.validationRegex);
        const fieldValue = formData.get(field.name) as string || "";
        if (!regex.test(fieldValue)) {
            import('sonner').then(({ toast }) => toast.error(`Erro: Campo ${field.name} inválido (regex: ${field.validationRegex})`));
            return;
        }
      }
    }

    if (cnpjStatus.status === 'invalid') {
      import('sonner').then(({ toast }) => toast.error(`Erro: CNPJ Inválido! (${cnpjStatus.message})`));
      return;
    }

    if (!validatePhone(phoneValue)) {
      import('sonner').then(({ toast }) => toast.error(`Erro: Número de Telefone Inválido!`));
      return;
    }

    if (cnpjStatus.status === 'inactive') {
      import('sonner').then(({ toast }) => toast.warning(`Alerta de Risco: Este CNPJ está INATIVO/DESATIVADO! (${cnpjStatus.message})`));
    }

    const { validateCNPJ } = await import('../../lib/utils');
    if (cnpj && !validateCNPJ(cnpj)) {
      import('sonner').then(({ toast }) => toast.error("Estrutura do CNPJ inválida!"));
      return;
    }

    setLoading(true);
    
    addLead({
      name: formData.get('name') as string,
      company: companyValue || (formData.get('company') as string),
      cnpj,
      email: emailValue,
      phone: phoneValue,
      status: "Novo",
      value: "R$ 0",
      date: "Hoje",
      seller: (formData.get('seller') as string) || "Carlos Eduardo Mendes",
      title: "Novo Negócio",
      priority: "Média",
      stageId: '1',
      lead_interesse_cliente: formData.get('lead_interesse_cliente') as string,
      tenantName: selectedTenant,
      customFields: {
        linkedinLink,
        currentRole,
        teamSize
      }
    });

    setLoading(false);
    // Reset local states
    setCnpjValue("");
    setCompanyValue("");
    setEmailValue("");
    setPhoneValue("");
    setLinkedinLink("");
    setCurrentRole("");
    setTeamSize("");
    setCnpjStatus({ status: 'idle' });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Novo Lead"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button form="new-lead-form" type="submit" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6">
            {loading ? "Salvando..." : "Criar Lead"}
          </Button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nome</label>
            <input name="name" required type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="Nome do lead" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Sufixo do Nome (opcional)</label>
            <input name="nameSuffix" type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="Ex: Diretor, Jr." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Empresa</label>
            <input 
              name="company" 
              type="text" 
              value={companyValue}
              onChange={(e) => setCompanyValue(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="Nome da empresa" 
            />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-400">Website (opcional)</label>
             <input name="website" type="url" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="https://www.exemplo.com" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">E-mail</label>
            <input 
              name="email" 
              required 
              type="email" 
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="E-mail de contato" 
            />
            {isEmailDuplicate && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1 font-semibold"><AlertTriangle className="w-3 h-3" /> Este e-mail já existe na base de leads!</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">CNPJ</label>
            <input 
              name="cnpj" 
              maxLength={18}
              value={cnpjValue}
              onChange={handleCnpjChange}
              type="text" 
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="00.000.000/0001-00" 
            />
            {isCnpjDuplicate && (
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1 font-semibold"><AlertTriangle className="w-3 h-3" /> Este CNPJ já possui registro de lead!</p>
            )}
            {cnpjStatus.status === 'checking' && (
              <p className="text-[10px] text-blue-400 animate-pulse mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Consulta Síncrona Receita Federal...
              </p>
            )}
            {cnpjStatus.status === 'active' && (
              <p className="text-[10px] text-emerald-400 mt-1 font-black uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3" /> CNPJ Verificado e Ativo
              </p>
            )}
            {cnpjStatus.status === 'inactive' && (
              <p className="text-[10px] text-amber-500 mt-1 font-black uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Situação: {cnpjStatus.message || "Irregular"}
              </p>
            )}
            {cnpjStatus.status === 'invalid' && (
              <p className="text-[10px] text-red-500 mt-1 font-black uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {cnpjStatus.message || "CNPJ Inválido!"}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Telefone / WhatsApp</label>
            <input 
              name="phone" 
              type="tel" 
              value={phoneValue}
              onChange={handlePhoneChange}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="(00) 00000-0000" 
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Tamanho da Equipe (SDR)</label>
            <select 
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="">Selecione...</option>
              <option value="1-10">1 a 10</option>
              <option value="11-50">11 a 50</option>
              <option value="51-200">51 a 200</option>
              <option value="200+">Mais de 200</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Cargo Atual (SDR)</label>
            <input 
              name="currentRole" 
              type="text" 
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="Ex: Diretor de Vendas" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Link do LinkedIn (SDR)</label>
            <input 
              name="linkedinLink" 
              type="url" 
              value={linkedinLink}
              onChange={(e) => setLinkedinLink(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" 
              placeholder="https://linkedin.com/in/usuario" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Origem</label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option>Site (Orgânico)</option>
              <option>Google Ads</option>
              <option>Meta Ads</option>
              <option>Indicação</option>
              <option>Prospecção Ativa</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Vendedor Responsável</label>
            <select name="seller" defaultValue="Carlos Eduardo Mendes" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option>Carlos Eduardo Mendes</option>
              <option>Ana Silva</option>
              <option>Roberto Ramos</option>
              <option>Juliana Costa</option>
            </select>
          </div>
        </div>

        {isMaster && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
               <Target className="w-3.5 h-3.5" /> Cliente / Tenant (Destinatário)
            </label>
            <select 
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full bg-[#0B1120] border border-blue-500/20 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="G-Tech Master">Minha Base (G-Tech)</option>
              {Object.keys(allTenantModules).filter(t => !t.includes("G-Tech")).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Interesse do Cliente (opcional)</label>
          <input name="lead_interesse_cliente" type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="Ex: Cloud, Security, AI" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Notas Adicionais</label>
          <textarea name="notes" rows={3} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="Informações relevantes sobre este lead..."></textarea>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-400">Tags</label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={suggestTags} 
              disabled={aiLoading}
              className="text-xs text-purple-400 gap-1 hover:text-purple-300"
            >
              <Sparkles className="w-3 h-3" />
              {aiLoading ? "Sugerindo..." : "IA Sugerir Tags"}
            </Button>
          </div>
          <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} type="text" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="Tags separadas por vírgula" />
        </div>
      </form>
    </Modal>
  );
}
