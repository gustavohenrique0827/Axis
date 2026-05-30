import React, { useState, useMemo } from "react";
import { Product } from "../../../types";
import { toast } from "sonner";

export function useProdutoForm() {
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
    const marginRatio = priceNum > 0 ? parseFloat((((priceNum - costNum) / priceNum) * 100).toFixed(1)) : 0;
    const parsedTags = formTags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

    if (editingProduct) {
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

  const handleSelectAll = (filteredProducts: Product[]) => {
    const visibleIds = filteredProducts.map(p => p.id);
    if (selectedIds.length === visibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  return {
    viewMode, setViewMode,
    searchTerm, setSearchTerm,
    selectedCategories, setSelectedCategories,
    selectedTypes, setSelectedTypes,
    selectedStatus, setSelectedStatus,
    sortBy, setSortBy,
    selectedIds, setSelectedIds,
    isModalOpen, setIsModalOpen,
    editingProduct, setEditingProduct,
    activeTab, setActiveTab,
    simulateTax, setSimulateTax,
    attachments, setAttachments,
    formName, setFormName,
    formSKU, setFormSKU,
    formCategory, setFormCategory,
    formType, setFormType,
    formPrice, setFormPrice,
    formCost, setFormCost,
    formCommission, setFormCommission,
    formStockMin, setFormStockMin,
    formStockMax, setFormStockMax,
    formProvider, setFormProvider,
    formTags, setFormTags,
    formIsBestSeller, setFormIsBestSeller,
    formDimensions, setFormDimensions,
    formWeight, setFormWeight,
    formMaterial, setFormMaterial,
    formDescription, setFormDescription,
    formCurrentStock, setFormCurrentStock,
    products, setProducts,
    categories, types,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveProduct,
    toggleActiveStatus,
    duplicateProduct,
    deleteProduct,
    handleToggleSelection,
    executeBulkStatus,
    executeBulkDelete,
    handleSelectAll
  };
}
