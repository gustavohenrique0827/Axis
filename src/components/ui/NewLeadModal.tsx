import React, { useState, useMemo } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Sparkles, Target, AlertTriangle, User, Building2, Briefcase,
  Mail, Phone, Hash, Link as LinkIcon, Users, Building, Tag, Search,
  ChevronDown, CheckCircle2,
} from "lucide-react";
import { formatPhone, validatePhone } from "../../lib/utils";

export function NewLeadModal({ isOpen, onClose, firstStageId = "1" }: { isOpen: boolean; onClose: () => void; firstStageId?: string }) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const { leads, addLead, customLeadFields, clienteBase, colaboradores } = useData();
  const { user, allTenantModules } = useAuth();
  const isMaster = user?.isMaster || user?.tenantName?.includes("G-Tech");

  const [selectedTenant, setSelectedTenant] = useState(user?.tenantName || "G-Tech Master");

  // Client selector state
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [cnpjValue, setCnpjValue] = useState("");
  const [companyValue, setCompanyValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

  const [cnpjStatus, setCnpjStatus] = useState<{
    status: "idle" | "checking" | "active" | "inactive" | "invalid";
    message?: string;
  }>({ status: "idle" });

  const [linkedinLink, setLinkedinLink] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [teamSize, setTeamSize] = useState("");

  const isEmailDuplicate = leads.some(
    (l) => l.email.toLowerCase() === emailValue.toLowerCase() && emailValue !== ""
  );
  const isCnpjDuplicate = leads.some((l) => l.cnpj === cnpjValue && cnpjValue !== "");

  const [selectedSeller, setSelectedSeller] = useState<string>("");

  // Sellers from colaboradores, fallback to leads-derived list
  const sellerOptions = useMemo<string[]>(() => {
    if (colaboradores && colaboradores.length > 0) {
      return colaboradores
        .filter((c: any) => c.nome && c.status !== "Desligado")
        .map((c: any) => c.nome as string);
    }
    return Array.from(new Set(leads.map((l: any) => l.seller).filter(Boolean))) as string[];
  }, [colaboradores, leads]);

  // Auto-set default seller
  useMemo(() => {
    if (!selectedSeller && sellerOptions.length > 0) setSelectedSeller(sellerOptions[0]);
  }, [sellerOptions]);

  // Detect pipeline based on seller's cargo
  const sellerPipelineId = useMemo(() => {
    if (!selectedSeller || !colaboradores?.length) return "comercial";
    const colab = colaboradores.find((c: any) => c.nome === selectedSeller);
    if (!colab) return "comercial";
    const cargo = (colab.cargo || "").toLowerCase();
    return cargo.includes("sdr") ? "sdr" : "comercial";
  }, [selectedSeller, colaboradores]);

  // Filtered clients for search dropdown
  const filteredClients = useMemo(() => {
    if (!clienteBase) return [];
    const q = clientSearch.toLowerCase();
    return clienteBase.filter((c: any) =>
      (c.name || c.nome || "").toLowerCase().includes(q)
    ).slice(0, 30);
  }, [clienteBase, clientSearch]);

  function handleSelectClient(client: any) {
    const name = client.name || client.nome || "";
    setSelectedClientId(client.id);
    setSelectedClientName(name);
    setClientSearch(name);
    setCompanyValue(name);
    if (client.cnpj && !cnpjValue) setCnpjValue(client.cnpj);
    if (client.email && !emailValue) setEmailValue(client.email);
    if (client.phone && !phoneValue) setPhoneValue(formatPhone(client.phone));
    setShowClientDropdown(false);
  }

  function clearClient() {
    setSelectedClientId("");
    setSelectedClientName("");
    setClientSearch("");
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(formatPhone(e.target.value));
  };

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const { formatCNPJ } = await import("../../lib/utils");
    const formatted = formatCNPJ(rawVal);
    setCnpjValue(formatted);

    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 14) {
      setCnpjStatus({ status: "checking" });
      try {
        const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
        if (resp.ok) {
          const result = await resp.json();
          const isActive = result.situacao_cadastral === 2;
          setCnpjStatus({
            status: isActive ? "active" : "inactive",
            message: result.descricao_situacao_cadastral,
          });
          if (result.nome_fantasia || result.razao_social) {
            setCompanyValue(result.nome_fantasia || result.razao_social);
          }
          if (result.email && !emailValue) {
            setEmailValue(result.email.toLowerCase());
          }
          if (result.ddd_telefone_1 && !phoneValue) {
            setPhoneValue(formatPhone(result.ddd_telefone_1.replace(/\D/g, "")));
          }
        } else {
          const errorData = await resp.json().catch(() => ({}));
          setCnpjStatus({
            status: "invalid",
            message: errorData.message || "CNPJ não encontrado na base de dados.",
          });
        }
      } catch {
        setCnpjStatus({ status: "invalid", message: "Falha na conexão de validação." });
      }
    } else {
      setCnpjStatus({ status: "idle" });
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
          notes: formData.get("notes"),
        }),
      });
      const data = await response.json();
      if (data.tags) setTags(data.tags.join(", "));
    } catch {
      // ignore
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cnpj = cnpjValue;

    for (const field of customLeadFields) {
      if (field.validationRegex) {
        const regex = new RegExp(field.validationRegex);
        const fieldValue = (formData.get(field.name) as string) || "";
        if (!regex.test(fieldValue)) {
          import("sonner").then(({ toast }) =>
            toast.error(`Erro: Campo ${field.name} inválido (regex: ${field.validationRegex})`)
          );
          return;
        }
      }
    }

    if (cnpjStatus.status === "invalid") {
      import("sonner").then(({ toast }) =>
        toast.error(`Erro: CNPJ Inválido! (${cnpjStatus.message})`)
      );
      return;
    }

    if (!validatePhone(phoneValue)) {
      import("sonner").then(({ toast }) =>
        toast.error("Erro: Número de Telefone Inválido!")
      );
      return;
    }

    if (cnpjStatus.status === "inactive") {
      import("sonner").then(({ toast }) =>
        toast.warning(`Alerta de Risco: Este CNPJ está INATIVO/DESATIVADO! (${cnpjStatus.message})`)
      );
    }

    const { validateCNPJ } = await import("../../lib/utils");
    if (cnpj && !validateCNPJ(cnpj)) {
      import("sonner").then(({ toast }) => toast.error("Estrutura do CNPJ inválida!"));
      return;
    }

    setLoading(true);

    addLead({
      name: formData.get("name") as string,
      company: companyValue || (formData.get("company") as string),
      cnpj,
      email: emailValue,
      phone: phoneValue,
      status: "Novo",
      value: "R$ 0",
      date: "Hoje",
      seller: selectedSeller || sellerOptions[0] || "Não Atribuído",
      title: "Novo Negócio",
      priority: "Média",
      pipelineId: sellerPipelineId,
      stageId: firstStageId,
      lead_interesse_cliente: formData.get("lead_interesse_cliente") as string,
      tenantName: selectedTenant,
      clientId: selectedClientId || undefined,
      clientName: selectedClientName || undefined,
      customFields: { linkedinLink, currentRole, teamSize },
    });

    setLoading(false);
    // Reset
    setCnpjValue("");
    setCompanyValue("");
    setEmailValue("");
    setPhoneValue("");
    setLinkedinLink("");
    setCurrentRole("");
    setTeamSize("");
    setClientSearch("");
    setSelectedClientId("");
    setSelectedClientName("");
    setSelectedSeller(sellerOptions[0] || "");
    setCnpjStatus({ status: "idle" });
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
          <Button variant="ghost" onClick={onClose} className="text-slate-400">
            Cancelar
          </Button>
          <Button
            form="new-lead-form"
            type="submit"
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6"
          >
            {loading ? "Salvando..." : "Criar Lead"}
          </Button>
        </>
      }
    >
      <form id="new-lead-form" onSubmit={handleSubmit} className="space-y-8">

        {/* ── CLIENTE EXISTENTE ── */}
        <div className="space-y-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <label className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> Vincular a Cliente Existente
            <span className="ml-auto text-[9px] text-slate-500 font-normal normal-case tracking-normal">
              Opcional — preenche dados automaticamente
            </span>
          </label>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                  if (!e.target.value) clearClient();
                }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                placeholder={
                  clienteBase && clienteBase.length > 0
                    ? `Buscar entre ${clienteBase.length} clientes...`
                    : "Nenhum cliente cadastrado ainda"
                }
                className="w-full bg-[#0B1120]/60 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white text-xs focus:border-blue-500/40 focus:outline-none transition-all placeholder:text-slate-600"
              />
              {selectedClientId ? (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              )}
            </div>

            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-[#0d1626] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                {filteredClients.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => handleSelectClient(c)}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                  >
                    <Building className="w-3 h-3 text-slate-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{c.name || c.nome}</p>
                      {c.cnpj && (
                        <p className="text-[9px] text-slate-500 font-mono">{c.cnpj}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedClientId && (
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Vinculado: {selectedClientName}
              <button
                type="button"
                onClick={clearClient}
                className="ml-2 text-slate-500 hover:text-rose-400 bg-transparent border-none cursor-pointer text-[10px]"
              >
                ✕ desvincular
              </button>
            </p>
          )}
        </div>

        {/* ── INFORMAÇÕES BÁSICAS ── */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <User className="w-4 h-4 text-blue-400" /> Informações Básicas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Nome Principal
              </label>
              <input
                name="name"
                required
                type="text"
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="Nome completo do lead"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Sufixo / Título (opcional)
              </label>
              <input
                name="nameSuffix"
                type="text"
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="Ex: Diretor de TI, Dr."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail Comercial
              </label>
              <input
                name="email"
                required
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="contato@empresa.com"
              />
              {isEmailDuplicate && (
                <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                  <AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Celular / WhatsApp
              </label>
              <input
                name="phone"
                type="tel"
                value={phoneValue}
                onChange={handlePhoneChange}
                maxLength={15}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all font-mono"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Origem Principal
              </label>
              <select className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all">
                <option>Site (Orgânico)</option>
                <option>Google Ads</option>
                <option>Meta Ads</option>
                <option>Indicação</option>
                <option>Prospecção Ativa</option>
              </select>
            </div>

            {/* ── VENDEDOR DINÂMICO ── */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Vendedor Responsável
                {sellerOptions.length === 0 && (
                  <span className="text-[9px] text-amber-400 font-bold ml-1">(sem colaboradores)</span>
                )}
              </label>
              <select
                name="seller"
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
              >
                {sellerOptions.length > 0 ? (
                  sellerOptions.map((s) => (
                    <option key={s} value={s} className="bg-[#111827]">
                      {s}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Carlos Eduardo Mendes" className="bg-[#111827]">Carlos Eduardo Mendes</option>
                    <option value="Ana Silva" className="bg-[#111827]">Ana Silva</option>
                    <option value="Roberto Ramos" className="bg-[#111827]">Roberto Ramos</option>
                  </>
                )}
              </select>
              {selectedSeller && (
                <p className={`text-[10px] font-black flex items-center gap-1 ${sellerPipelineId === "sdr" ? "text-purple-400" : "text-blue-400"}`}>
                  <Target className="w-3 h-3" />
                  Pipeline: {sellerPipelineId === "sdr" ? "SDR (pré-venda)" : "Comercial (closer)"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── DADOS EMPRESARIAIS ── */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Building2 className="w-4 h-4 text-emerald-400" /> Dados Empresariais
          </h4>
          <div className="p-5 bg-[#0B1120]/30 rounded-xl border border-white/5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Documento CNPJ
                </span>
                <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Receita Federal Sync
                </span>
              </label>
              <input
                name="cnpj"
                maxLength={18}
                value={cnpjValue}
                onChange={handleCnpjChange}
                type="text"
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all font-mono"
                placeholder="Digite o CNPJ para auto-preenchimento..."
              />
              <div className="mt-2 min-h-[24px]">
                {isCnpjDuplicate && (
                  <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1 font-bold bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                    <AlertTriangle className="w-3 h-3" /> Já cadastrado no CRM!
                  </p>
                )}
                {cnpjStatus.status === "checking" && (
                  <p className="text-[10px] text-blue-400 animate-pulse font-bold uppercase tracking-widest flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md w-fit">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Buscando dados...
                  </p>
                )}
                {cnpjStatus.status === "active" && (
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                    <Target className="w-3 h-3" /> CNPJ Validado e Ativo
                  </p>
                )}
                {cnpjStatus.status === "inactive" && (
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                    <AlertTriangle className="w-3 h-3" /> Situação: {cnpjStatus.message}
                  </p>
                )}
                {cnpjStatus.status === "invalid" && (
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-md w-fit">
                    <AlertTriangle className="w-3 h-3" /> {cnpjStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Razão Social / Fantasia
                </label>
                <input
                  name="company"
                  type="text"
                  value={companyValue}
                  onChange={(e) => setCompanyValue(e.target.value)}
                  className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                  placeholder="Preenchido automaticamente..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Website Corporativo
                </label>
                <input
                  name="website"
                  type="url"
                  className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTEXTO & QUALIFICAÇÃO ── */}
        <div className="space-y-5">
          <h4 className="text-sm font-black text-white border-b border-white/5 pb-2 mb-2 flex items-center gap-2 uppercase tracking-wide mt-2">
            <Briefcase className="w-4 h-4 text-purple-400" /> Contexto & Qualificação (SDR)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Tamanho da Equipe
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
              >
                <option value="">Indefinido</option>
                <option value="1-10">1 a 10 pessoas</option>
                <option value="11-50">11 a 50 pessoas</option>
                <option value="51-200">51 a 200 pessoas</option>
                <option value="200+">Corporação (+200)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Cargo do Decisor
              </label>
              <input
                name="currentRole"
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="Ex: C-Level, Diretor de Marketing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Interesses Tecnológicos
              </label>
              <input
                name="lead_interesse_cliente"
                type="text"
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="Ex: Solução X, Integração Y"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                URL do LinkedIn
              </label>
              <input
                name="linkedinLink"
                type="url"
                value={linkedinLink}
                onChange={(e) => setLinkedinLink(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all"
                placeholder="https://linkedin.com/in/"
              />
            </div>
          </div>

          {isMaster && (
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl mt-4">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Target className="w-4 h-4" /> Distribuição de Tenant (Master)
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full bg-[#0B1120]/80 border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="G-Tech Master">Minha Base (G-Tech)</option>
                {Object.keys(allTenantModules)
                  .filter((t) => !t.includes("G-Tech"))
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              Notas & Descobertas
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={suggestTags}
                disabled={aiLoading}
                className="h-7 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 gap-1.5 rounded-md px-3 font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3 h-3" /> {aiLoading ? "Processando..." : "Gerar Tags com IA"}
              </Button>
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 transition-all resize-none"
              placeholder="Transcreva dores, objeções e informações críticas aqui..."
            />
            <input
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              type="text"
              className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm italic"
              placeholder="Ex: enterprise, prioridade_alta, tech_lead (separados por vírgula)"
            />
          </div>
        </div>

      </form>
    </Modal>
  );
}
