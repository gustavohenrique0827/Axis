import React, { useState, useMemo } from "react";
import { Product } from "../../../types";
import { toast } from "sonner";
import { useData } from "../../../contexts/DataContext";

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
  const [attachments, setAttachments] = useState<{name: string, size: string, date: string, type: string}[]>([]);

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

  // Connected Product Data
  const { products, addProduct, updateProduct, deleteProduct, setProducts } = useData();

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
    setAttachments([]);
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
    setAttachments([]);
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
      updateProduct(editingProduct.id, {
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
      });
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
      addProduct(nProd);
      toast.success("Novo produto adicionado ao catálogo!");
    }

    setIsModalOpen(false);
  };

  const toggleActiveStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const product = products.find(p => p.id === id);
    if (product) {
      const nextState = !product.active;
      updateProduct(id, { active: nextState });
      toast.info(nextState ? `Produto '${product.name}' ativado.` : `Produto '${product.name}' inativado.`);
    }
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
    addProduct(duplicated);
    toast.success(`Dublicado: Novo SKU duplicado '${duplicated.sku}' gerado.`);
  };

  const deleteProductItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Deseja realmente excluir este item do catálogo?")) {
      deleteProduct(id);
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
    selectedIds.forEach(id => {
      updateProduct(id, { active: activate });
    });
    toast.success(`${selectedIds.length} produtos atualizados com sucesso.`);
    setSelectedIds([]);
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Excluir definitivamente os ${selectedIds.length} produtos selecionados?`)) {
      selectedIds.forEach(id => deleteProduct(id));
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
    deleteProduct: deleteProductItem,
    handleToggleSelection,
    executeBulkStatus,
    executeBulkDelete,
    handleSelectAll
  };
}
