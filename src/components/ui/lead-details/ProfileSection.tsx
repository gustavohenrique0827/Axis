import React, { useState, useMemo } from "react";
import { Card } from "../card";
import {
  Sparkles, Brain, ArrowRight, Tag, Trophy,
  Phone, MessageSquare, Mail, FileCheck,
} from "lucide-react";
import { Button } from "../button";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProfileDataForm } from "./ProfileDataForm";

interface ProfileSectionProps {
  lead: any;
  companyName: string;
  setCompanyName: (val: string) => void;
  leadName: string;
  setLeadName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  value: string;
  setValue: (val: string) => void;
  seller: string;
  setSeller: (val: string) => void;
  priority: "Alta" | "Média" | "Baixa";
  setPriority: (val: any) => void;
  score: number;
  temperature: "Quente" | "Morno" | "Frio";
  probability: number;
  slaStatus: string;
  timeIdle: string;
  customTags: string[];
  newTagInput: string;
  setNewTagInput: (val: string) => void;
  isEditingInline: boolean;
  setIsEditingInline: (val: boolean) => void;
  tempColors: Record<string, string>;
  customLeadFields: any[];
  customFieldsState: Record<string, string | number>;
  setCustomFieldsState: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleConvertLead: () => void;
  setAlterationLogs: any;
  setActiveTab: (tab: string) => void;
  setChatChannel: (ch: any) => void;
  applyMessageTemplate: (tpl: string) => void;
  updateLead: any;
}

export function ProfileSection({
  lead,
  companyName, setCompanyName,
  leadName, setLeadName,
  phone, setPhone,
  email, setEmail,
  title, setTitle,
  value, setValue,
  seller, setSeller,
  priority, setPriority,
  score, temperature, probability, slaStatus, timeIdle,
  customTags, newTagInput, setNewTagInput,
  isEditingInline, setIsEditingInline,
  customLeadFields, customFieldsState, setCustomFieldsState,
  handleAddTag, handleRemoveTag, handleConvertLead,
  setAlterationLogs, setActiveTab, setChatChannel,
  applyMessageTemplate, updateLead,
}: ProfileSectionProps) {
  const [cnpjFetching, setCnpjFetching] = useState(false);
  const { leads: allLeads, colaboradores, addLeadActivity: addActivityCtx } = useData();

  const sellerOptions = useMemo(() => {
    const fromColab = (colaboradores as any[])
      .filter((c: any) => c.status !== "Desligado" && c.departamento === "Vendas")
      .map((c: any) => c.nome)
      .filter(Boolean);
    if (fromColab.length > 0) return fromColab as string[];
    return [...new Set((allLeads as any[]).map((l: any) => l.seller).filter(Boolean))] as string[];
  }, [colaboradores, allLeads]);

  const displayValue = useMemo(() => {
    if (!value) return "R$ 0,00";
    const num = parseFloat(String(value).replace(/[^\d,.-]/g, "").replace(",", "."));
    if (isNaN(num) || num === 0) return value as string;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  }, [value]);

  const fetchCnpjData = async () => {
    const digits = (lead.cnpj || "").replace(/\D/g, "");
    if (digits.length !== 14) return;
    setCnpjFetching(true);
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.nome_fantasia || data.razao_social) setCompanyName(data.nome_fantasia || data.razao_social);
        if (data.email && !email) setEmail(data.email.toLowerCase());
        if (data.ddd_telefone_1 && !phone) {
          const raw = data.ddd_telefone_1.replace(/\D/g, "").slice(0, 11);
          const fmt = raw.length === 11
            ? `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`
            : `(${raw.slice(0,2)}) ${raw.slice(2,6)}-${raw.slice(6)}`;
          setPhone(fmt);
        }
      }
    } finally {
      setCnpjFetching(false);
    }
  };

  const quickActions = [
    {
      label: "WhatsApp", icon: MessageSquare, color: "text-[#25D366]",
      bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/20",
      action: () => window.open(`https://wa.me/55${phone.replace(/\D/g, "")}`, "_blank"),
    },
    {
      label: "Instagram", icon: Phone, color: "text-pink-400",
      bg: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",
      action: () => window.open("https://instagram.com", "_blank"),
    },
    {
      label: "Ligação VoIP", icon: Phone, color: "text-cyan-400",
      bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20",
      action: () => {
        addActivityCtx(lead.id, "Ligação", "Ligação VoIP", "Discagem virtual executada pelo sistema Axis.", seller || "Sistema");
        toast.success("Ligação VoIP registrada!");
      },
    },
    {
      label: "E-mail", icon: Mail, color: "text-amber-400",
      bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
      action: () => window.open(`mailto:${email}`),
    },
    {
      label: "Contrato", icon: FileCheck, color: "text-emerald-400",
      bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
      action: () =>
        setAlterationLogs((prev: any[]) => [
          { id: Date.now().toString(), author: seller || "Sistema", desc: "Contrato criado via DocuSign", time: "Agora" },
          ...prev,
        ]),
    },
    {
      label: "Converter", icon: Trophy, color: "text-purple-400",
      bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
      action: handleConvertLead,
    },
  ];

  return (
    <div className="space-y-3">

      <ProfileHeroCard
        temperature={temperature}
        companyName={companyName}
        leadName={leadName}
        displayValue={displayValue}
        slaStatus={slaStatus}
        priority={priority}
        score={score}
        probability={probability}
        timeIdle={timeIdle}
      />

      <ProfileDataForm
        isEditingInline={isEditingInline}
        setIsEditingInline={setIsEditingInline}
        companyName={companyName} setCompanyName={setCompanyName}
        leadName={leadName} setLeadName={setLeadName}
        phone={phone} setPhone={setPhone}
        email={email} setEmail={setEmail}
        title={title} setTitle={setTitle}
        value={value} setValue={setValue}
        displayValue={displayValue}
        seller={seller} setSeller={setSeller}
        priority={priority} setPriority={setPriority}
        sellerOptions={sellerOptions}
        lead={lead}
        updateLead={updateLead}
        customLeadFields={customLeadFields}
        customFieldsState={customFieldsState}
        setCustomFieldsState={setCustomFieldsState}
        cnpjFetching={cnpjFetching}
        onFetchCnpj={fetchCnpjData}
      />

      {/* ── Quick Actions ── */}
      <Card className="border-white/10 bg-[#111827]/70 p-4">
        <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3">Ações Rápidas</h4>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map(({ label, icon: Icon, color, bg, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex flex-col items-center gap-1.5 py-3 ${bg} border rounded-xl transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-[8px] font-black uppercase text-center leading-tight px-1 ${color}`}>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── AI Copilot Recommendation ── */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-[#111827] p-4 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/[0.07] rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/[0.06] rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Recomendação Axis CoPilot</span>
            </div>
            <span className="text-[8px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Sparkles className="w-2 h-2 animate-pulse" /> IA
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Score <strong className="text-cyan-300">{score}</strong> — este lead demonstra interesse em produtos recorrentes.
            Envie a proposta{" "}
            <strong className="text-white">Consultoria Enterprise + Licença Usuário</strong>{" "}
            hoje mesmo para antecipar o fechamento.
          </p>
          <div className="mt-3 bg-[#070E1A]/60 rounded-xl p-2.5 border border-cyan-500/15 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Sugestão de ação:</span>
            <button
              onClick={() => {
                setActiveTab("whatsapp");
                setChatChannel("whatsapp");
                applyMessageTemplate("Olá {client}! Preparei a proposta para {company}. Segue em anexo.");
              }}
              className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
            >
              Aplicar Proposta <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tags ── */}
      <Card className="border-white/10 bg-[#111827]/70 overflow-hidden p-0">
        <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <h4 className="text-[8px] font-black uppercase tracking-widest text-cyan-500/60 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Tags Corporativas
          </h4>
        </div>
        <div className="p-3.5 space-y-3">
          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
            {customTags.length === 0 ? (
              <span className="text-[10px] text-slate-600 italic self-center">Nenhuma tag adicionada ainda</span>
            ) : (
              customTags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  title="Clique para remover"
                  className="group flex items-center gap-1 bg-blue-500/10 hover:bg-rose-500/10 text-blue-300 hover:text-rose-400 border border-blue-500/15 hover:border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer"
                >
                  #{tag}
                  <span className="text-[8px] font-black opacity-0 group-hover:opacity-100">&times;</span>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Nova tag... (Enter para adicionar)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all"
            />
            <Button
              size="sm"
              onClick={handleAddTag}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/20 px-3 font-black shrink-0"
            >
              +
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
