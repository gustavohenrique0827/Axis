import React, { useState, useMemo } from "react";
import { Product } from "../../types";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Plus, Package, DollarSign, Edit, Search, Grid, List, Copy, Trash2, 
  Settings, Layers, Activity, FileSpreadsheet, TrendingUp, Coins, 
  Download, Sparkles, RotateCcw, ShieldAlert, Check, HelpCircle, ArrowUpDown,
  Percent, Truck, Tag, X, ArrowLeft, ArrowRight, FileText, Image, Info, Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { PageContainer } from "../../components/PageContainer";

export default function Catalog() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Tab and Interactive state inside modal
  const [activeTab, setActiveTab] = useState<"info" | "comercial" | "estoque" | "arquivos">("info");
  const [simulateTax, setSimulateTax] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, size: string, date: string, type: string}[]>([
    { name: "folders_manual_tecnico.pdf", size: "1.8 MB", date: "24/05/2026", type: "pdf" },
    { name: "produto_foto_principal.png", size: "720 KB", date: "24/05/2026", type: "png" }
  ]);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSKU, setFormSKU] = useState("");
  const [formCategory, setFormCategory] = useState("Software");
  const [formType, setFormType] = useState<"Serviço" | "Assinatura" | "Digital" | "Físico">("Software" as any);
  const [formPrice, setFormPrice] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formCommission, setFormCommission] = useState("5");
  const [formStockMin, setFormStockMin] = useState("10");
  const [formStockMax, setFormStockMax] = useState("100");
  const [formProvider, setFormProvider] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formDimensions, setFormDimensions] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCurrentStock, setFormCurrentStock] = useState("0");

  // Initial Product Data
  const [products, setProducts] = useState<Product[]>([
    { 
      id: "prod-1", 
      sku: "CONS-ENT-001", 
      name: "Consultoria Enterprise", 
      category: "Serviços", 
      type: "Serviço",
      price: 4500, 
      cost: 1200, 
      margin: 73.3, 
      commission: 8, 
      active: true, 
      stockMin: 0, 
      stockMax: 200,
      provider: "Diretoria Técnica",
      isBestSeller: true,
      currentStock: 50,
      tags: ["consultoria", "vendas-complexas", "b2b"]
    },
    { 
      id: "prod-7", 
      sku: "CONS-ENT-PRO-001", 
      name: "Consultoria Enterprise Pro", 
      category: "Serviços", 
      type: "Serviço",
      price: 7500, 
      cost: 2000, 
      margin: 73.3, 
      commission: 7, 
      active: true, 
      stockMin: 0, 
      stockMax: 100,
      currentStock: 20,
      provider: "Diretoria Técnica",
      tags: ["consultoria", "enterprise", "vendas-"],
      isBestSeller: false
    },
    { 
      id: "prod-2", 
      sku: "SETUP-PRO-002", 
      name: "Setup PRO", 
      category: "Implantação", 
      type: "Serviço",
      price: 2000, 
      cost: 450, 
      margin: 77.5, 
      commission: 5, 
      active: true, 
      stockMin: 2, 
      stockMax: 30,
      currentStock: 10,
      provider: "Time Logística",
      tags: ["setup", "onboarding", "tecnico"]
    },
    { 
      id: "prod-3", 
      sku: "SOFT-LIC-003", 
      name: "Licença Usuário Adicional G-Suite", 
      category: "Software", 
      type: "Assinatura",
      price: 150, 
      cost: 48, 
      margin: 68, 
      commission: 3, 
      active: true, 
      stockMin: 5, 
      stockMax: 500,
      currentStock: 100,
      provider: "Google API Inc",
      isBestSeller: true,
      tags: ["cloud", "licencas", "saas"]
    },
    { 
      id: "prod-4", 
      sku: "TREIN-PRES-004", 
      name: "Treinamento Presencial Avançado", 
      category: "Serviços", 
      type: "Serviço",
      price: 3500, 
      cost: 1500, 
      margin: 57.1, 
      commission: 10, 
      active: false, 
      stockMin: 1, 
      stockMax: 10,
      currentStock: 5,
      provider: "L&D Partners",
      tags: ["educacional", "presencial", "equipes"]
    },
    { 
      id: "prod-5", 
      sku: "MENT-EXEC-005", 
      name: "Mentoria Executiva Comercial", 
      category: "Mentoria", 
      type: "Serviço",
      price: 12000, 
      cost: 3000, 
      margin: 75, 
      commission: 15, 
      active: true, 
      stockMin: 0, 
      stockMax: 5,
      currentStock: 2,
      provider: "Presidente Board",
      tags: ["board", "vip", "estrategia"]
    },
    { 
      id: "prod-6", 
      sku: "KIT-INFRA-006", 
      name: "Kit Roteador Starlink + Repetidores", 
      category: "Físico", 
      type: "Físico",
      price: 4950, 
      cost: 3100, 
      margin: 37.3, 
      commission: 4, 
      active: true, 
      stockMin: 3, 
      stockMax: 400,
      currentStock: 150,
      provider: "SpaceX Brazil Ltda",
      tags: ["hardware", "starlink", "infra-estrutura"]
    } as any
  ]);

  // Dynamic calculations for Margin as user types pricing
  const computedMargin = useMemo(() => {
    const p = parseFloat(formPrice) || 0;
    const c = parseFloat(formCost) || 0;
    if (p <= 0) return 0;
    return Math.round(((p - c) / p) * 1000) / 10;
  }, [formPrice, formCost]);

  // Unique list of categories
  const categories = ["Todas", "Software", "Serviços", "Implantação", "Mentoria", "Físico"];
  const types = ["Todos", "Serviço", "Assinatura", "Digital", "Físico"];

  // Open creation modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSKU("PROD-" + Math.floor(1000 + Math.random() * 9000));
    setFormCategory("Software");
    setFormType("Digital" as any);
    setFormPrice("");
    setFormCost("");
    setFormCommission("5");
    setFormStockMin("5");
    setFormStockMax("100");
    setFormProvider("Interno");
    setFormTags("novo, crm");
    setFormIsBestSeller(false);
    setFormDimensions("");
    setFormWeight("");
    setFormMaterial("");
    setFormDescription("");
    setFormCurrentStock("0");
    setActiveTab("info");
    setSimulateTax(false);
    setAttachments([
      { name: "folders_manual_tecnico.pdf", size: "1.8 MB", date: "24/05/2026", type: "pdf" },
      { name: "produto_foto_principal.png", size: "720 KB", date: "24/05/2026", type: "png" }
    ]);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(p);
    setFormName(p.name);
    setFormSKU(p.sku);
    setFormCategory(p.category);
    setFormType(p.type as any);
    setFormPrice(p.price.toString());
    setFormCost(p.cost.toString());
    setFormCommission(p.commission.toString());
    setFormStockMin(p.stockMin.toString());
    setFormStockMax(p.stockMax.toString());
    setFormProvider(p.provider || "Interno");
    setFormTags(p.tags.join(", "));
    setFormIsBestSeller(!!p.isBestSeller);
    setFormDimensions(p.dimensions || "");
    setFormWeight(p.weight?.toString() || "");
    setFormMaterial(p.material || "");
    setFormDescription(p.description || "");
    setFormCurrentStock(p.currentStock.toString());
    setActiveTab("info");
    setSimulateTax(false);
    setAttachments([
      { name: `especificacoes_${p.sku.toLowerCase()}.pdf`, size: "1.4 MB", date: "25/05/2026", type: "pdf" },
      { name: `foto_catalogo_${p.sku.toLowerCase()}.jpg`, size: "940 KB", date: "25/05/2026", type: "jpg" }
    ]);
    setIsModalOpen(true);
  };

  // Save product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSKU.trim() || !formPrice) {
      toast.error("Por favor, preencha todos os campos obrigatórios (Nome, SKU e Preço Venda)");
      return;
    }

    const priceNum = parseFloat(formPrice) || 0;
    const costNum = parseFloat(formCost) || 0;
    const commNum = parseFloat(formCommission) || 0;
    const stockMinNum = parseInt(formStockMin) || 0;
    const stockMaxNum = parseInt(formStockMax) || 0;
    // Calculate Margin: ((Price - Cost) / Price) * 100
    const marginRatio = priceNum > 0 ? parseFloat((((priceNum - costNum) / priceNum) * 100).toFixed(1)) : 0;

    const parsedTags = formTags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

    if (editingProduct) {
      // Edit
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        sku: formSKU,
        name: formName,
        category: formCategory,
        type: formType as any,
        price: priceNum,
        cost: costNum,
        margin: marginRatio,
        commission: commNum,
        stockMin: stockMinNum,
        stockMax: stockMaxNum,
        currentStock: parseInt(formCurrentStock) || 0,
        provider: formProvider,
        tags: parsedTags,
        isBestSeller: formIsBestSeller,
        dimensions: formDimensions,
        weight: parseFloat(formWeight) || 0,
        material: formMaterial,
        description: formDescription
      } : p));
      toast.success("Produto atualizado com sucesso!");
    } else {
      // Create new
      const nProd: Product = {
        id: "prod-" + Math.random().toString(36).substr(2, 9),
        sku: formSKU,
        name: formName,
        category: formCategory,
        type: formType as any,
        price: priceNum,
        cost: costNum,
        margin: marginRatio,
        commission: commNum,
        active: true,
        stockMin: stockMinNum,
        stockMax: stockMaxNum,
        currentStock: parseInt(formCurrentStock) || 0,
        provider: formProvider,
        isBestSeller: formIsBestSeller,
        tags: parsedTags,
        dimensions: formDimensions,
        weight: parseFloat(formWeight) || 0,
        material: formMaterial,
        description: formDescription
      };
      setProducts(prev => [nProd, ...prev]);
      toast.success("Novo produto adicionado ao catálogo!");
    }

    setIsModalOpen(false);
  };

  // Quick toggle active status
  const toggleActiveStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.active;
        toast.info(nextState ? `Produto '${p.name}' ativado.` : `Produto '${p.name}' inativado.`);
        return { ...p, active: nextState };
      }
      return p;
    }));
  };

  // Duplicate product flow
  const duplicateProduct = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Product = {
      ...p,
      id: "prod-" + Math.random().toString(36).substr(2, 9),
      sku: p.sku + "-COPY",
      name: p.name + " (Cópia)",
      active: true
    };
    setProducts(prev => [duplicated, ...prev]);
    toast.success(`Dublicado: Novo SKU duplicado '${duplicated.sku}' gerado.`);
  };

  // Delete product
  const deleteProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Deseja realmente excluir este item do catálogo?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produto removido do catálogo.");
    }
  };

  // Bulk Actions
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredProducts.map(p => p.id);
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const executeBulkStatus = (activate: boolean) => {
    if (selectedIds.length === 0) return;
    setProducts(prev => prev.map(p => 
      selectedIds.includes(p.id) ? { ...p, active: activate } : p
    ));
    toast.success(`${selectedIds.length} produtos atualizados com sucesso.`);
    setSelectedIds([]);
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Excluir definitivamente os ${selectedIds.length} produtos selecionados?`)) {
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      toast.success(`${selectedIds.length} produtos excluídos.`);
      setSelectedIds([]);
    }
  };

  // Excel simulation exporter
  const exportToExcelSimulator = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Compilando base de produtos ERP e mapeando margens...',
        success: 'Catálogo exportado! Nome do Arquivo: "CRM_CATALOGO_PRODUTOS.xlsx"',
        error: 'Erro ao compilar exportação'
      }
    );
  };

  // Process filters
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.provider && p.provider.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(p.type);
        const matchesStatus = selectedStatus === "Todos" || 
                              (selectedStatus === "Ativos" && p.active) || 
                              (selectedStatus === "Inativos" && !p.active);
        
        return matchesSearch && matchesCategory && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "margin-desc") return b.margin - a.margin;
        return 0;
      });
  }, [products, searchTerm, selectedCategories, selectedTypes, selectedStatus, sortBy]);

  // Metrics overview
  const totalSkuCount = products.length;
  const activeSkuCount = products.filter(p => p.active).length;
  const averageMarginVal = useMemo(() => {
    const list = products.filter(p => p.active);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.margin, 0);
    return Math.round((sum / list.length) * 10) / 10;
  }, [products]);

  const bestSellerCount = products.filter(p => p.isBestSeller).length;

  return (
    <PageContainer
      title="Produtos & SKUs Axis"
      description="Painel Central de Gestão de Preços, Margem de Lucro, SKU e Comissionamento Comercial."
      actions={
        <div className="flex gap-2">
          <Button 
            onClick={exportToExcelSimulator}
            className="gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 h-11 text-[10px] uppercase font-black transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha
          </Button>

          <Button 
            onClick={handleOpenAddModal} 
            className="gap-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl px-5 h-11 font-black uppercase text-[10px] shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        {/* Modern metrics row mapping ERP elements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#111827]/60 border-white/5 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Total de SKUs</span>
            <p className="text-2xl font-black text-white">{totalSkuCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111827]/60 border-white/5 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">SKUs em Operação</span>
            <p className="text-2xl font-black text-emerald-450 text-emerald-400">{activeSkuCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111827]/60 border-white/5 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Margem Ativa Média</span>
            <p className="text-2xl font-black text-blue-450 text-white font-mono">{averageMarginVal}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="bg-[#111827]/60 border-white/5 p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Produtos Favoritos / BestSellers</span>
            <p className="text-2xl font-black text-amber-400 font-mono">{bestSellerCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Advanced search and filters bar */}
      <Card className="bg-[#111827]/80 border-white/5 p-4 shadow-xl">
        <div className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search inputs */}
            <div className="relative md:col-span-4">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por SKU, nome ou fornecedor..."
                className="w-full bg-[#0B1120] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/40"
              />
            </div>

            {/* Category selection */}
            <div className="md:col-span-4 flex flex-wrap gap-1.5 items-center">
                {categories.filter(c => c !== "Todas").map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                        className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${selectedCategories.includes(cat) ? "bg-[#2563EB] text-white" : "bg-[#0B1120] text-slate-400 hover:bg-white/10"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Type categorization */}
            <div className="md:col-span-4 flex flex-wrap gap-1.5 items-center">
                {types.filter(t => t !== "Todos").map(tp => (
                    <button
                        key={tp}
                        onClick={() => setSelectedTypes(prev => prev.includes(tp) ? prev.filter(t => t !== tp) : [...prev, tp])}
                        className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${selectedTypes.includes(tp) ? "bg-[#2563EB] text-white" : "bg-[#0B1120] text-slate-400 hover:bg-white/10"}`}
                    >
                         {tp}
                    </button>
                ))}
            </div>

            {/* Inactive or active status */}
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-[#2563EB]/40"
              >
                <option value="Todos">Qualquer Status</option>
                <option value="Ativos">Apenas Ativos</option>
                <option value="Inativos">Apenas Inativos</option>
              </select>
            </div>

            {/* Sorting trigger */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-[#2563EB]/40"
              >
                <option value="name-asc">Ordem Alfabética A-Z</option>
                <option value="name-desc">Ordem Alfabética Z-A</option>
                <option value="price-desc">Maior Preço</option>
                <option value="price-asc">Menor Preço</option>
                <option value="margin-desc">Maior Margem Lucro</option>
              </select>
            </div>
          </div>

          {/* Action Bulk Operations bar */}
          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold">{filteredProducts.length} itens correspondentes</span>
              
              {selectedIds.length > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-[#2563EB] font-black">{selectedIds.length} selecionados</span>
                </>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {/* Grid or table layout selector */}
              <div className="flex border border-white/10 rounded-lg p-0.5 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                  title="Visão Grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                  title="Visão Tabela"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div className="bg-[#1E293B] border border-white/10 p-1 rounded-xl flex items-center gap-1.5">
                  <button
                    onClick={() => executeBulkStatus(true)}
                    className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase rounded"
                  >
                    Ativar
                  </button>
                  <button
                    onClick={() => executeBulkStatus(false)}
                    className="px-2 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black uppercase rounded"
                  >
                    Inativar
                  </button>
                  <button
                    onClick={executeBulkDelete}
                    className="p-1 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"
                    title="Excluir Selecionados"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </Card>

      {/* Main product representation mapping */}
      {filteredProducts.length === 0 ? (
        <Card className="p-16 flex flex-col items-center justify-center text-center bg-[#111827]/40 border-white/5">
          <Package className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
          <h3 className="text-white font-bold text-lg mb-1">Nenhum SKU encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Nenhum produto atende a estes parâmetros de filtro atuais. Modifique os termos de pesquisa ou adicione um novo produto ao catálogo.
          </p>
          <Button onClick={handleOpenAddModal} className="mt-6 font-bold text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2">
            Adicionar Primeiro Produto
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        
        // 1. Grid Card View Mode (Best Visual design)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <Card 
                key={p.id} 
                onClick={() => handleToggleSelection(p.id)}
                className={`p-5 border relative group transition-all duration-300 select-none cursor-pointer hover:shadow-2xl hover:border-[#2563EB]/30 overflow-hidden ${
                  p.active 
                    ? "bg-[#111827]/85 border-white/5" 
                    : "bg-[#111827]/40 border-white/5 opacity-50"
                } ${isSelected ? "ring-2 ring-[#2563EB] border-[#2563EB]" : ""}`}
              >
                
                {/* Upper quick edit badge elements */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleActiveStatus(p.id, e); }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      p.active ? "bg-emerald-550/15 text-emerald-400 bg-emerald-500/10" : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {p.active ? "Ativo" : "Pausado"}
                  </button>

                  <button 
                    onClick={(e) => handleOpenEditModal(p, e)}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors"
                    title="Editar produto"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => duplicateProduct(p, e)}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors"
                    title="Duplicar Produto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={(e) => deleteProduct(p.id, e)}
                    className="p-1.5 hover:bg-white/10 text-rose-400 hover:text-rose-500 rounded-md transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Left check for bulk multi selection */}
                <div 
                  className={`absolute left-4 top-4 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    isSelected ? "bg-[#2563EB] border-transparent" : "border-white/25 bg-slate-900 group-hover:border-white/50"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                </div>

                {/* Core description parameters */}
                <div className="mt-4 flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    p.type === "Serviço" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                    p.type === "Assinatura" ? "bg-[#06B6D4]/10 border-[#06B6D4]/20 text-[#06B6D4]" : 
                    p.type === "Digital" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  }`}>
                     <Package className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-white truncate leading-snug group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </h3>
                      {p.isBestSeller && (
                        <span className="bg-amber-500/10 border border-amber-500/25 px-1 rounded text-[8px] text-amber-400 font-extrabold uppercase shrink-0 tracking-wide">
                          BestSeller
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                      {p.category} • SKU: <span className="font-mono text-slate-400">{p.sku}</span>
                    </p>
                  </div>
                </div>

                {/* Sub-details fields (Stock thresholds, Commission, Supplier) */}
                <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 p-3 bg-white/[0.015] border border-white/5 rounded-xl text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">Fornecedor</span>
                    <span className="text-slate-350 truncate font-semibold block">{p.provider || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">Estoque</span>
                    <span className={`font-mono font-black flex items-center gap-1 ${p.currentStock <= p.stockMin ? "text-rose-400" : "text-emerald-400"}`}>
                      {p.currentStock} / {p.stockMin}
                      {p.currentStock <= p.stockMin && <ShieldAlert className="w-3 h-3"/>}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">Margem Líquida</span>
                    <span className={`font-mono font-black ${p.margin > 60 ? "text-emerald-450 text-emerald-400" : "text-amber-400"}`}>
                      {p.margin}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-black">Comissão Vendedor</span>
                    <span className="text-white font-semibold flex items-center gap-1 shrink-0 font-mono">
                      <Coins className="w-3 h-3 text-[#06B6D4]" /> {p.commission}%
                    </span>
                  </div>
                </div>

                {/* Bottom line with price calculations summary */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#06B6D4] font-black uppercase block tracking-wider">Preço de Venda</span>
                    <div className="flex items-center gap-1 font-mono font-black text-base text-white mt-0.5">
                      <DollarSign className="w-4 h-4 text-emerald-450 text-emerald-400" /> 
                      {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      {p.type === "Assinatura" && <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">/Mês</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-black uppercase block">Custo Unitário</span>
                    <span className="text-xs font-mono text-slate-400 font-semibold block mt-0.5">
                      R$ {p.cost ? p.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                    </span>
                  </div>
                </div>

                {/* Tags row in card bottom */}
                <div className="mt-3.5 flex gap-1 items-center overflow-x-auto scrollbar-none">
                  {p.tags.slice(0, 3).map((tag, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedCategories(prev => prev.includes(tag) ? prev : [...prev, tag]); 
                        setSearchTerm(tag);
                      }} 
                      className="text-[8px] bg-white/5 px-2 py-0.5 text-slate-400 font-bold rounded-full lowercase tracking-wide shrink-0 hover:bg-[#2563EB]/20 hover:text-white"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[#2563EB]"></div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        
        // 2. List Grid Table view mode (Highly compacted dashboard style)
        <Card className="bg-[#111827]/85 border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[9px] uppercase font-black text-slate-400 tracking-wider border-b border-white/5">
                  <th className="py-3 px-4 w-10">
                    <input 
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded bg-slate-900 border-white/20 focus:ring-[#2563EB] w-3.5 h-3.5"
                    />
                  </th>
                  <th className="py-3 px-4">Produto / SKU</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-right">Custo Origem</th>
                  <th className="py-3 px-4 text-center">Margem</th>
                  <th className="py-3 px-4 text-center">Comissão</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => handleToggleSelection(p.id)}
                      className={`hover:bg-white/[0.02] text-xs transition-colors cursor-pointer ${!p.active ? "opacity-60" : ""} ${isSelected ? "bg-[#2563EB]/5" : ""}`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelection(p.id)}
                          className="rounded bg-slate-900 border-white/22 focus:ring-[#2563EB] w-3.5 h-3.5"
                        />
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#2563EB] shrink-0" />
                          <div className="min-w-0">
                            <span className="block font-black hover:text-blue-400 truncate">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-medium">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-350">{p.category}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          p.type === "Serviço" ? "bg-purple-500/10 text-purple-400" :
                          p.type === "Assinatura" ? "bg-cyan-500/10 text-cyan-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-white">
                        R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-slate-400">
                        R$ {p.cost ? p.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                      </td>
                      <td className="py-4 px-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${p.margin > 60 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {p.margin}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-[#06B6D4] font-bold">{p.commission}%</td>
                      <td className="py-4 px-4 text-slate-400 max-w-[120px] truncate">{p.provider || "-"}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleActiveStatus(p.id, e); }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase leading-none ${
                            p.active ? "bg-emerald-550/15 text-emerald-400 bg-emerald-500/10" : "bg-slate-550/15 text-slate-400"
                          }`}
                        >
                          {p.active ? "Ativo" : "OFF"}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={(e) => handleOpenEditModal(p, e)}
                            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => duplicateProduct(p, e)}
                            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => deleteProduct(p.id, e)}
                            className="p-1 hover:bg-white/10 text-rose-400 hover:text-rose-500 rounded transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* AI Suggested Kits and Cross-Sell Combo block */}
      <Card className="p-5 border-dashed border-white/10 bg-[#111827]/40 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                G-AI Combinations Suggestion Module
              </h4>
              <p className="text-[11px] text-slate-500">
                A IA analisou as margens e calculou o seguinte kit sugerido de alta rentabilidade para vendas casadas.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => {
              toast.success("Combo Promocional 'Setup Max Pro' importado para as propostas!");
            }}
            className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg shrink-0 transition-all"
          >
            Adicionar Combo Sugerido
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#2563EB] font-bold block uppercase tracking-wide">Combo Premium</span>
              <p className="text-xs font-bold text-white mt-0.5">Setup PRO + Consultoria</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">R$ 5.850,00</span>
          </div>

          <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#2563EB] font-bold block uppercase tracking-wide">Desconto do Combo</span>
              <p className="text-xs font-bold text-white mt-0.5">Desconto de 10% Aplicado</p>
            </div>
            <span className="text-xs font-bold text-rose-400 mt-0.5 font-mono">-R$ 650,00</span>
          </div>

          <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-amber-400 font-bold block uppercase tracking-wide">Média Margem Líquida</span>
              <p className="text-xs font-bold text-white mt-0.5">Rentabilidade Combinada</p>
            </div>
            <span className="text-xs font-bold text-white font-mono mt-0.5">74.5%</span>
          </div>
        </div>
      </Card>

      {/* COMPREHENSIVE REGISTRATION / EDIT MODAL (Rich Fields with Live calculations) */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
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

            {/* Modal Forms fields body (Height constrained with overflow auto) */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              
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
                          Nome do Produto <strong className="text-rose-400">*</strong>
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
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider font-semibold">Descrição comercial rápida</label>
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
                        <span className="text-[9px] text-slate-500 font-boldCode lowercase">separe com vírgulas</span>
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
                          <span>Preço de Venda (R$) <strong className="text-rose-450 text-rose-400">*</strong></span>
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
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
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
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider font-semibold">Estoque Máximo Alvo</label>
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
                        <Download className="w-6 h-6 animate-bounce" />
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

            {/* Form Action Controls (Fixed footer) */}
            <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center bg-white/[0.01] gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {/* Step indicator progress pips */}
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
                    className="flex-1 sm:flex-initial h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-5 transition-all gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Salvar Produto ERP
                  </Button>
                )}
              </div>
            </div>

          </Card>
        </div>
      )}
    </div>
  </PageContainer>
  );
}
