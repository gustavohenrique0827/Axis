import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Package, DollarSign, Layers, FileSpreadsheet, X, Wand2, Percent,
  Coins, TrendingUp, ShieldAlert, Check, Truck, Download, FileText, Image,
  ArrowLeft, ArrowRight, Building2, Search, ChevronDown, CheckCircle2, Building
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Product } from "../../../types";

interface ProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  activeTab: "info" | "comercial" | "estoque" | "arquivos";
  setActiveTab: (tab: "info" | "comercial" | "estoque" | "arquivos") => void;
  simulateTax: boolean;
  setSimulateTax: (val: boolean) => void;
  attachments: {name: string, size: string, date: string, type: string}[];
  setAttachments: React.Dispatch<React.SetStateAction<{name: string, size: string, date: string, type: string}[]>>;

  // client association
  clientSearch: string;
  setClientSearch: (v: string) => void;
  clientId: string;
  clientName: string;
  showClientDropdown: boolean;
  setShowClientDropdown: (v: boolean) => void;
  filteredClients: any[];
  handleSelectClient: (c: any) => void;
  clearClient: () => void;

  formName: string;
  setFormName: (val: string) => void;
  formSKU: string;
  setFormSKU: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formType: "Serviço" | "Assinatura" | "Digital" | "Físico";
  setFormType: (val: any) => void;
  formPrice: string;
  setFormPrice: (val: string) => void;
  formCost: string;
  setFormCost: (val: string) => void;
  formCommission: string;
  setFormCommission: (val: string) => void;
  formStockMin: string;
  setFormStockMin: (val: string) => void;
  formStockMax: string;
  setFormStockMax: (val: string) => void;
  formProvider: string;
  setFormProvider: (val: string) => void;
  formTags: string;
  setFormTags: (val: string) => void;
  formIsBestSeller: boolean;
  setFormIsBestSeller: (val: boolean) => void;
  formDimensions: string;
  setFormDimensions: (val: string) => void;
  formWeight: string;
  setFormWeight: (val: string) => void;
  formMaterial: string;
  setFormMaterial: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formCurrentStock: string;
  setFormCurrentStock: (val: string) => void;
  
  categories: string[];
  handleSaveProduct: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ProdutoModal({
  isOpen,
  onClose,
  editingProduct,
  activeTab,
  setActiveTab,
  simulateTax,
  setSimulateTax,
  attachments,
  setAttachments,
  clientSearch,
  setClientSearch,
  clientId,
  clientName,
  showClientDropdown,
  setShowClientDropdown,
  filteredClients,
  handleSelectClient,
  clearClient,
  formName,
  setFormName,
  formSKU,
  setFormSKU,
  formCategory,
  setFormCategory,
  formType,
  setFormType,
  formPrice,
  setFormPrice,
  formCost,
  setFormCost,
  formCommission,
  setFormCommission,
  formStockMin,
  setFormStockMin,
  formStockMax,
  setFormStockMax,
  formProvider,
  setFormProvider,
  formTags,
  setFormTags,
  formIsBestSeller,
  setFormIsBestSeller,
  formDimensions,
  setFormDimensions,
  formWeight,
  setFormWeight,
  formMaterial,
  setFormMaterial,
  formDescription,
  setFormDescription,
  formCurrentStock,
  setFormCurrentStock,
  categories,
  handleSaveProduct
}: ProdutoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-[#0B1120] border border-white/10 shadow-3xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Title bar */}
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-white/[0.02] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#2563EB]/10 rounded-lg flex items-center justify-center text-[#2563EB]">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                {editingProduct ? "Editar Produto / Serviço" : "Cadastrar Novo Item ERP"}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mapeamento fiscal e parâmetros comerciais integrados. Todas as alterações impactam as margens do CRM em tempo real.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors ml-4 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs List */}
        <div className="px-5 py-2 border-b border-white/5 bg-[#0B1120] flex gap-1 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "info", label: "Cadastro", icon: Package },
            { id: "comercial", label: "Comercial & Margem", icon: DollarSign },
            { id: "estoque", label: "Estoque & Logística", icon: Layers },
            { id: "arquivos", label: "Mídia & Anexos", icon: FileSpreadsheet }
          ].map(t => {
            const IconComp = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-[#2563EB]" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Forms fields body */}
        <form id="produto-erp-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Client Association */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Vincular a Cliente
                    <span className="ml-auto text-[9px] text-slate-500 font-normal normal-case">Opcional — produto global da empresa se não informado</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); if (!e.target.value) clearClient(); }}
                      onFocus={() => setShowClientDropdown(true)}
                      onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                      placeholder={filteredClients.length > 0 ? `Buscar cliente...` : "Nenhum cliente cadastrado"}
                      className="w-full bg-[#0B1120]/60 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white text-xs focus:border-blue-500/40 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                    {clientId
                      ? <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                      : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    }
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-[#0d1626] border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                        {filteredClients.map((c: any) => (
                          <button key={c.id} type="button" onMouseDown={() => handleSelectClient(c)}
                            className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer">
                            <Building className="w-3 h-3 text-slate-500 shrink-0" />
                            <p className="text-xs font-bold text-white">{c.name || c.nome}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {clientId && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Vinculado: {clientName}
                      <button type="button" onClick={clearClient} className="ml-2 text-slate-500 hover:text-rose-400 bg-transparent border-none cursor-pointer text-[10px]">
                        ✕ desvincular
                      </button>
                    </p>
                  )}
                </div>

                {/* Step Banner */}
                <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#2563EB] shrink-0 font-black text-xs font-mono">1</div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Identificação Geral do Produto</h4>
                    <p className="text-[10px] text-slate-500">Defina o nome do item comercial, categoria e o código SKU identificador único.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Product Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">
                      Nome do Produto <strong className="text-rose-450 text-rose-455 text-rose-400">*</strong>
                    </label>
                    <input 
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Licença Enterprise SaaS"
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-medium transition-all"
                      required
                    />
                  </div>

                  {/* SKU Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider flex justify-between items-center">
                      <span>SKU identificador <strong className="text-rose-400">*</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          let prefix = "PROD";
                          if (formName.trim().length > 2) {
                            prefix = formName.trim().split(" ").map(w => w.substring(0, 3).toUpperCase()).join("-").slice(0, 12);
                          }
                          const rand = Math.floor(100 + Math.random() * 900);
                          setFormSKU(`${prefix}-${rand}`);
                          toast.success("SKU estruturado gerado com sucesso!");
                        }}
                        className="text-[9px] text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
                        title="Auto-gerar SKU a partir do nome"
                      >
                        <Wand2 className="w-2.5 h-2.5" /> Auto-gerar
                      </button>
                    </label>
                    <input 
                      type="text"
                      value={formSKU}
                      onChange={(e) => setFormSKU(e.target.value.toUpperCase())}
                      placeholder="Ex: SOFT-LIC-999"
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-mono font-bold transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Categoria</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-[#2563EB]/40"
                    >
                      {categories.filter(c => c !== "Todas").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Tipo de Item</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-[#2563EB]/40"
                    >
                      <option value="Serviço">Serviço</option>
                      <option value="Assinatura">Assinatura</option>
                      <option value="Digital">Digital</option>
                      <option value="Físico">Físico</option>
                    </select>
                  </div>
                </div>

                {/* Best Seller Check Card */}
                <div className="p-4 bg-[#111827]/30 border border-white/5 rounded-xl flex items-center justify-between group transition-all">
                  <div className="space-y-0.5">
                    <label htmlFor="checkboxBestSeller" className="text-xs font-bold text-white cursor-pointer select-none">
                      Produto Destaque (BestSeller)
                    </label>
                    <p className="text-[10px] text-slate-500">Adiciona uma etiqueta visual de alta conversão para o time comercial.</p>
                  </div>
                  <input
                    type="checkbox"
                    id="checkboxBestSeller"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-white/20 bg-slate-900 focus:ring-[#2563EB] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Descrição comercial rápida</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Licenciamento anual com suporte 24/7 incluso e SLAs de resposta em até 1 hora."
                    className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 h-20 placeholder-slate-600"
                  />
                </div>

                {/* Filter tags split by comma */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider flex items-center justify-between">
                    <span>Tags / Palavras-chave</span>
                    <span className="text-[9px] text-slate-500 font-bold lowercase">separe com vírgulas</span>
                  </label>
                  <input 
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Ex: licenca, b2b, anual, cloud"
                    className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-semibold"
                  />
                  {/* Popular Quick-add Tags tags */}
                  <div className="flex gap-1.5 flex-wrap pt-1 items-center">
                    <span className="text-[9px] text-slate-500 uppercase font-black mr-1">Sugestões:</span>
                    {["saas", "premium", "suporte", "vip", "hardware", "anual"].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const list = formTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
                          if (!list.includes(tag)) {
                            list.push(tag);
                            setFormTags(list.join(", "));
                          }
                        }}
                        className="bg-white/5 hover:bg-[#2563EB]/20 hover:text-[#2563EB] transition-colors border border-white/5 rounded px-2 py-0.5 text-[9px] text-slate-400 font-bold lowercase"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "comercial" && (
              <motion.div
                key="comercial"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* Step Banner */}
                <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 font-black text-xs font-mono">2</div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Comercial & Precificação</h4>
                    <p className="text-[10px] text-slate-500">Configure o preço final de venda para o cliente, custo de origem e comissão dos vendedores.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price to client */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider flex items-center justify-between">
                      <span>Preço de Venda (R$) <strong className="text-rose-455 text-rose-400">*</strong></span>
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number"
                        step="any"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Ex: 4500"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-mono font-bold text-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Cost standard */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Custo de Aquisição (R$)</label>
                    <div className="relative">
                      <Coins className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number"
                        step="any"
                        value={formCost}
                        onChange={(e) => setFormCost(e.target.value)}
                        placeholder="Ex: 1200"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-mono text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Commission % */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Comissão Vendedor (%)</label>
                    <div className="relative">
                      <Percent className="w-3.5 h-3.5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number"
                        value={formCommission}
                        onChange={(e) => setFormCommission(e.target.value)}
                        placeholder="Ex: 5"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-mono text-cyan-400 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Highly stylized margin card detail simulator */}
                {(() => {
                  const p = parseFloat(formPrice) || 0;
                  const c = parseFloat(formCost) || 0;
                  const commPercent = parseFloat(formCommission) || 0;
                  const commissionVal = (p * commPercent) / 100;
                  const taxRate = simulateTax ? 0.08 : 0;
                  const estimatedTaxVal = p * taxRate;
                  const netProfitRaw = Math.max(0, p - c - commissionVal - estimatedTaxVal);
                  const netMarginVal = p > 0 ? Math.round((netProfitRaw / p) * 1000) / 10 : 0;
                  
                  let rentabilityLabel = "Digite valores acima";
                  let rentabilityColor = "text-slate-400 bg-slate-400/10 border-slate-400/20";
                  
                  if (p > 0) {
                    if (netMarginVal >= 55) {
                      rentabilityLabel = "Rentabilidade Excelente (Foco B2B Alto Lucro)";
                      rentabilityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    } else if (netMarginVal >= 30) {
                      rentabilityLabel = "Rentabilidade Saudável (Padrão de Mercado)";
                      rentabilityColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                    } else {
                      rentabilityLabel = "Rentabilidade Muito Baixa (Recomenda-se Ajustar Preço)";
                      rentabilityColor = "text-rose-450 text-rose-400 bg-rose-500/10 border-rose-500/20";
                    }
                  }

                  return (
                    <div className="border border-white/5 rounded-xl bg-white/[0.01] p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Detalhamento de Rentabilidade CRM
                        </h5>
                        {p > 0 && (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rentabilityColor}`}>
                            {rentabilityLabel}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                        <div className="p-3 bg-white/[0.015] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Faturamento Bruto</span>
                          <span className="text-sm font-bold text-white font-mono block mt-1">R$ {p.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="p-3 bg-white/[0.015] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Custo Origem</span>
                          <span className="text-sm font-bold text-rose-400 font-mono block mt-1">-R$ {c.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="p-3 bg-white/[0.015] border border-white/5 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Comissão ({commPercent}%)</span>
                          <span className="text-sm font-bold text-slate-400 font-mono block mt-1">-R$ {commissionVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="p-3 bg-white/[0.015] border border-[#2563EB]/20 bg-[#2563EB]/5 rounded-xl">
                          <span className="text-[9px] text-[#2563EB] uppercase font-black block">Lucro Estimado</span>
                          <span className="text-sm font-black text-emerald-400 font-mono block mt-1">R$ {netProfitRaw.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Tax simulator switch toggle checkbox */}
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            id="taxSimulationCheck"
                            checked={simulateTax}
                            onChange={(e) => setSimulateTax(e.target.checked)}
                            className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] bg-slate-900 border-white/20 cursor-pointer"
                          />
                          <label htmlFor="taxSimulationCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                            Simular imposto do Simples Nacional comercial (8%)
                          </label>
                        </div>
                        
                        {p > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-white">
                            <span className="text-slate-500 text-[10px] uppercase font-bold">Margem Real Líquida:</span>
                            <span className="font-mono font-black text-emerald-400 text-sm">{netMarginVal}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === "estoque" && (
              <motion.div
                key="estoque"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Step Banner */}
                <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-black text-xs font-mono">3</div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Controle Logístico & Fornecedor</h4>
                    <p className="text-[10px] text-slate-500">Insira limites de estoque para avisos automáticos e configure o fornecedor desse SKU.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Minimum trigger */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Mínimo Alerta</label>
                    <input 
                      type="number"
                      value={formStockMin}
                      onChange={(e) => setFormStockMin(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-mono"
                    />
                  </div>

                  {/* Current stock */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Atual Físico</label>
                    <input 
                      type="number"
                      value={formCurrentStock}
                      onChange={(e) => setFormCurrentStock(e.target.value)}
                      placeholder="Ex: 50"
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-mono"
                    />
                  </div>

                  {/* Max stock target */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Máximo Alvo</label>
                    <input 
                      type="number"
                      value={formStockMax}
                      onChange={(e) => setFormStockMax(e.target.value)}
                      placeholder="Ex: 200"
                      className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Fornecedor / Distribuidor de Entrada</label>
                  <input 
                    type="text"
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    placeholder="Ex: Cisco Solutions Inc ou Fornecedor Local"
                    className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-medium"
                  />
                </div>

                {/* Stock status indicator badge alerts */}
                {(() => {
                  const cur = parseInt(formCurrentStock) || 0;
                  const min = parseInt(formStockMin) || 0;
                  
                  return (
                    <div className="bg-[#111827]/40 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {cur <= min ? (
                          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-[#EF4444]">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-black block">Status Operacional Logística</span>
                          <span className="font-semibold text-white">
                            {cur <= min ? "Alerta de Estoque Crítico (Comprar do Fornecedor)" : "Nível do Estoque Adequado (Operando normal)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Physical Details Collapsible */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#2563EB]" /> Dimensões Físicas (Opcional)
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Dimensões (LxAxP)</label>
                      <input
                        type="text"
                        value={formDimensions}
                        onChange={(e) => setFormDimensions(e.target.value)}
                        placeholder="Ex: 10x15x20 cm"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Peso Total (kg)</label>
                      <input
                        type="number"
                        step="any"
                        value={formWeight}
                        onChange={(e) => setFormWeight(e.target.value)}
                        placeholder="Ex: 1.5"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Material / Composição</label>
                      <input
                        type="text"
                        value={formMaterial}
                        onChange={(e) => setFormMaterial(e.target.value)}
                        placeholder="Ex: Alumínio Fundido"
                        className="w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "arquivos" && (
              <motion.div
                key="arquivos"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* Step Banner */}
                <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0 font-black text-xs font-mono">4</div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Mídia & Documentação Relacionada</h4>
                    <p className="text-[10px] text-slate-500">Adicione catálogos de vendas em PDF, manuais técnicos ou imagens para envio automático ao CRM.</p>
                  </div>
                </div>

                {/* Interactive Dropzone Simulator */}
                <div className="relative border border-dashed border-[#2563EB]/20 bg-[#111827]/30 hover:bg-[#111827]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const filesArray = (Array.from(e.target.files) as File[]).map(file => ({
                          name: file.name,
                          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                          date: new Date().toLocaleDateString("pt-BR"),
                          type: file.name.split('.').pop() || "unknown"
                        }));
                        setAttachments(prev => [...prev, ...filesArray]);
                        toast.success("Arquivo(s) adicionados com sucesso!");
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="w-12 h-12 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  
                  <span className="text-slate-200 text-xs font-bold block">Arraste arquivos ou clique para pesquisar</span>
                  <span className="text-[10px] text-slate-500 mt-1.5 block max-w-sm">Suporta PDF, PNG, JPG, DOCX ou XLSX de até 25MB para anexar à documentação comercial do SKU.</span>
                </div>

                {/* Dynamic files list checklist mapping */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Arquivos Anexados ({attachments.length})</h5>
                  {attachments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 bg-[#111827]/20 border border-white/5 rounded-xl text-center">Nenhum anexo registrado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {attachments.map((file, idx) => {
                        const isPDF = file.type === "pdf";
                        const isImage = ["png", "jpg", "jpeg", "gif"].includes(file.type);
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[#111827] border border-white/5 rounded-xl group/item hover:border-[#2563EB]/25 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isPDF ? "bg-rose-500/10 text-rose-400" : isImage ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                                {isPDF ? <FileText className="w-4 h-4" /> : isImage ? <Image className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <span className="block text-xs font-bold text-white truncate max-w-[280px]">{file.name}</span>
                                <span className="text-[9px] font-mono text-slate-500 block">Tamanho: {file.size} • Adicionado em {file.date}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAttachments(prev => prev.filter((_, i) => i !== idx));
                                toast.info("Anexo removido.");
                              }}
                              className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                              title="Remover arquivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Form Action Controls */}
        <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center bg-white/[0.01] gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {["info", "comercial", "estoque", "arquivos"].map((step, index) => {
              const stepNames = ["Geral", "Preços", "Estoque", "Mídia"];
              const stepKeys = ["info", "comercial", "estoque", "arquivos"];
              const stepIndex = stepKeys.indexOf(activeTab);
              const isCurrent = activeTab === step;
              const isCompleted = stepIndex > index;
              
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveTab(step as any)}
                  className="group flex flex-col items-start"
                  title={stepNames[index]}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${
                      isCurrent ? "w-6 bg-[#2563EB]" : isCompleted ? "w-4 bg-emerald-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`} />
                    {isCurrent && <span className="text-[9px] text-slate-400 font-extrabold uppercase mr-1">{stepNames[index]}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {activeTab !== "info" && (
              <Button 
                type="button"
                onClick={() => {
                  const tabsArray: ("info" | "comercial" | "estoque" | "arquivos")[] = ["info", "comercial", "estoque", "arquivos"];
                  const curIdx = tabsArray.indexOf(activeTab);
                  if (curIdx > 0) setActiveTab(tabsArray[curIdx - 1]);
                }}
                className="flex-1 sm:flex-initial h-9 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl px-4 transition-all gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </Button>
            )}

            {activeTab !== "arquivos" ? (
              <Button 
                type="button"
                onClick={() => {
                  const tabsArray: ("info" | "comercial" | "estoque" | "arquivos")[] = ["info", "comercial", "estoque", "arquivos"];
                  const curIdx = tabsArray.indexOf(activeTab);
                  if (curIdx < tabsArray.length - 1) setActiveTab(tabsArray[curIdx + 1]);
                }}
                className="flex-1 sm:flex-initial h-9 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl px-4 transition-all gap-1.5"
              >
                Avançar <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="produto-erp-form"
                className="flex-1 sm:flex-initial h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-5 transition-all gap-1.5"
              >
                <Check className="w-4 h-4" /> Salvar Produto ERP
              </Button>
            )}
          </div>
        </div>

      </Card>
    </div>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
