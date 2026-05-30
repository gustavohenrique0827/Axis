import React, { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, Target, AlertTriangle, User, Building2, Briefcase, Mail, Phone, Hash, Link as LinkIcon, Users, Building, Tag } from "lucide-react";
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
      maxWidth="max-w-3xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button form="new-lead-form" type="submit" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6">
            {loading ? "Salvando..." : "Criar Lead"}
          </Button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-8">
        
        {/* ================= SEÇÃO BÁSICO ================= */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <User className="w-4 h-4 text-blue-400" /> Informações Básicas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Nome Principal</label>
              <input name="name" required type="text" className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="Nome completo do lead" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/> Sufixo / Título (opcional)</label>
              <input name="nameSuffix" type="text" className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="Ex: Diretor de TI, Dr." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> E-mail Comercial</label>
              <input 
                name="email" required type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" 
                placeholder="contato@empresa.com" 
              />
              {isEmailDuplicate && (
                <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit"><AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Celular / WhatsApp</label>
              <input 
                name="phone" type="tel" value={phoneValue} onChange={handlePhoneChange} maxLength={15}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all font-mono" 
                placeholder="(00) 00000-0000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">Origem Principal</label>
              <select className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all">
                <option>Site (Orgânico)</option>
                <option>Google Ads</option>
                <option>Meta Ads</option>
                <option>Indicação</option>
                <option>Prospecção Ativa</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">Vendedor Responsável</label>
              <select name="seller" defaultValue="Carlos Eduardo Mendes" className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all">
                <option>Carlos Eduardo Mendes</option>
                <option>Ana Silva</option>
                <option>Roberto Ramos</option>
                <option>Juliana Costa</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= SEÇÃO EMPRESA ================= */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Building2 className="w-4 h-4 text-emerald-400" /> Dados Empresariais
          </h4>
          <div className="p-5 bg-[#0B1120]/30 rounded-xl border border-white/5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5"/> Documento CNPJ</span>
                <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">Receita Federal Sync</span>
              </label>
              <input 
                name="cnpj" maxLength={18} value={cnpjValue} onChange={handleCnpjChange} type="text" 
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all font-mono" 
                placeholder="Digite o CNPJ para auto-preenchimento..." 
              />
              
              {/* Feedback States CNPJ */}
              <div className="mt-2 min-h-[24px]">
                {isCnpjDuplicate && <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit"><AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!</p>}
                {cnpjStatus.status === 'checking' && <p className="text-[10px] text-blue-400 animate-pulse font-bold uppercase tracking-widest flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md w-fit"><span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Buscando dados...</p>}
                {cnpjStatus.status === 'active' && <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md w-fit"><Target className="w-3 h-3" /> CNPJ Validado e Ativo</p>}
                {cnpjStatus.status === 'inactive' && <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md w-fit"><AlertTriangle className="w-3 h-3" /> Situação: {cnpjStatus.message}</p>}
                {cnpjStatus.status === 'invalid' && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-md w-fit"><AlertTriangle className="w-3 h-3" /> {cnpjStatus.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/> Razão Social / Fantasia</label>
                <input 
                  name="company" type="text" value={companyValue} onChange={(e) => setCompanyValue(e.target.value)}
                  className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" 
                  placeholder="Preenchido automaticamente..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5"/> Website Corporativo</label>
                <input name="website" type="url" className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="https://www.empresa.com" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= SEÇÃO SDR ================= */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide mt-2">
            <Briefcase className="w-4 h-4 text-purple-400" /> Contexto & Qualificação (SDR)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Tamanho da Equipe</label>
              <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all">
                <option value="">Indefinido</option>
                <option value="1-10">1 a 10 pessoas</option>
                <option value="11-50">11 a 50 pessoas</option>
                <option value="51-200">51 a 200 pessoas</option>
                <option value="200+">Corporação (+200)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">Cargo do Decisor</label>
              <input name="currentRole" type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="Ex: C-Level, Diretor de Marketing" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">Interesses Tecnológicos</label>
              <input name="lead_interesse_cliente" type="text" className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="Ex: Solução X, Integração Y" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">URL do LinkedIn</label>
              <input name="linkedinLink" type="url" value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all" placeholder="https://linkedin.com/in/" />
            </div>
          </div>

          {isMaster && (
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl mt-4">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                 <Target className="w-4 h-4" /> Distribuição de Tenant (Master)
              </label>
              <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="w-full bg-[#0B1120]/80 border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                <option value="G-Tech Master">Minha Base (G-Tech)</option>
                {Object.keys(allTenantModules).filter(t => !t.includes("G-Tech")).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Notas & Descobertas
              <Button type="button" variant="ghost" size="sm" onClick={suggestTags} disabled={aiLoading} className="h-7 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 gap-1.5 rounded-md px-3 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> {aiLoading ? "Processando..." : "Gerar Tags com IA"}
              </Button>
            </label>
            <textarea name="notes" rows={3} className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all resize-none" placeholder="Transcreva dores, objeções e informações críticas aqui..."></textarea>
            <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm italic" placeholder="Ex: enterprise, prioridade_alta, tech_lead (separados por vírgula)" />
          </div>
        </div>

      </form>
    </Modal>
  );
}
