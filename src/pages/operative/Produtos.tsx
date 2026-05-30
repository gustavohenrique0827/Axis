import React, { useMemo } from "react";
import { 
  Plus, Package, Search, Grid, List, Activity, FileSpreadsheet, TrendingUp, Sparkles
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useProdutoForm } from "./produtos/useProdutoForm";
import { ProdutoModal } from "./produtos/ProdutoModal";
import { ProdutosGrid } from "./produtos/ProdutosGrid";
import { ProdutosTable } from "./produtos/ProdutosTable";
import { toast } from "sonner";

export default function Catalog() {
  const f = useProdutoForm();

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
    return f.products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(f.searchTerm.toLowerCase()) || 
                              p.sku.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
                              (p.provider && p.provider.toLowerCase().includes(f.searchTerm.toLowerCase()));
        
        const matchesCategory = f.selectedCategories.length === 0 || f.selectedCategories.includes(p.category);
        const matchesType = f.selectedTypes.length === 0 || f.selectedTypes.includes(p.type);
        const matchesStatus = f.selectedStatus === "Todos" || 
                              (f.selectedStatus === "Ativos" && p.active) || 
                              (f.selectedStatus === "Inativos" && !p.active);
        
        return matchesSearch && matchesCategory && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (f.sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (f.sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (f.sortBy === "price-desc") return b.price - a.price;
        if (f.sortBy === "price-asc") return a.price - b.price;
        if (f.sortBy === "margin-desc") return b.margin - a.margin;
        return 0;
      });
  }, [f.products, f.searchTerm, f.selectedCategories, f.selectedTypes, f.selectedStatus, f.sortBy]);

  // Metrics overview
  const totalSkuCount = f.products.length;
  const activeSkuCount = f.products.filter(p => p.active).length;
  const averageMarginVal = useMemo(() => {
    const list = f.products.filter(p => p.active);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.margin, 0);
    return Math.round((sum / list.length) * 10) / 10;
  }, [f.products]);

  const bestSellerCount = f.products.filter(p => p.isBestSeller).length;

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
            onClick={f.handleOpenAddModal} 
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
              <p className="text-2xl font-black text-white font-mono">{averageMarginVal}%</p>
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
                  value={f.searchTerm}
                  onChange={(e) => f.setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por SKU, nome ou fornecedor..."
                  className="w-full bg-[#0B1120] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 font-medium focus:outline-none focus:border-[#2563EB]/40 focus:ring-1 focus:ring-[#2563EB]/40"
                />
              </div>

              {/* Category selection */}
              <div className="md:col-span-4 flex flex-wrap gap-1.5 items-center">
                  {f.categories.filter(c => c !== "Todas").map(cat => (
                      <button
                          key={cat}
                          onClick={() => f.setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                          className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${f.selectedCategories.includes(cat) ? "bg-[#2563EB] text-white" : "bg-[#0B1120] text-slate-400 hover:bg-white/10"}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>

              {/* Type categorization */}
              <div className="md:col-span-4 flex flex-wrap gap-1.5 items-center">
                  {f.types.filter(t => t !== "Todos").map(tp => (
                      <button
                          key={tp}
                          onClick={() => f.setSelectedTypes(prev => prev.includes(tp) ? prev.filter(t => t !== tp) : [...prev, tp])}
                          className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${f.selectedTypes.includes(tp) ? "bg-[#2563EB] text-white" : "bg-[#0B1120] text-slate-400 hover:bg-white/10"}`}
                      >
                           {tp}
                      </button>
                  ))}
              </div>

              {/* Inactive or active status */}
              <div className="md:col-span-2">
                <select
                  value={f.selectedStatus}
                  onChange={(e) => f.setSelectedStatus(e.target.value)}
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
                  value={f.sortBy}
                  onChange={(e) => f.setSortBy(e.target.value)}
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
                
                {f.selectedIds.length > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-[#2563EB] font-black">{f.selectedIds.length} selecionados</span>
                  </>
                )}
              </div>

              <div className="flex gap-2 items-center">
                {/* Grid or table layout selector */}
                <div className="flex border border-white/10 rounded-lg p-0.5 overflow-hidden">
                  <button
                    onClick={() => f.setViewMode("grid")}
                    className={`p-1.5 rounded ${f.viewMode === "grid" ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                    title="Visão Grade"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => f.setViewMode("list")}
                    className={`p-1.5 rounded ${f.viewMode === "list" ? "bg-white/10 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                    title="Visão Tabela"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {f.selectedIds.length > 0 && (
                  <div className="bg-[#1E293B] border border-white/10 p-1 rounded-xl flex items-center gap-1.5">
                    <button
                      onClick={() => f.executeBulkStatus(true)}
                      className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase rounded"
                    >
                      Ativar
                    </button>
                    <button
                      onClick={() => f.executeBulkStatus(false)}
                      className="px-2 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black uppercase rounded"
                    >
                      Inativar
                    </button>
                    <button
                      onClick={f.executeBulkDelete}
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
            <Button onClick={f.handleOpenAddModal} className="mt-6 font-bold text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2">
              Adicionar Primeiro Produto
            </Button>
          </Card>
        ) : f.viewMode === "grid" ? (
          <ProdutosGrid 
            filteredProducts={filteredProducts}
            selectedIds={f.selectedIds}
            handleToggleSelection={f.handleToggleSelection}
            toggleActiveStatus={f.toggleActiveStatus}
            handleOpenEditModal={f.handleOpenEditModal}
            duplicateProduct={f.duplicateProduct}
            deleteProduct={f.deleteProduct}
            setSelectedCategories={f.setSelectedCategories}
            setSearchTerm={f.setSearchTerm}
          />
        ) : (
          <ProdutosTable 
            filteredProducts={filteredProducts}
            selectedIds={f.selectedIds}
            handleToggleSelection={f.handleToggleSelection}
            handleSelectAll={f.handleSelectAll}
            toggleActiveStatus={f.toggleActiveStatus}
            handleOpenEditModal={f.handleOpenEditModal}
            duplicateProduct={f.duplicateProduct}
            deleteProduct={f.deleteProduct}
          />
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

        {/* COMPREHENSIVE REGISTRATION / EDIT MODAL */}
        <ProdutoModal 
          isOpen={f.isModalOpen}
          onClose={() => f.setIsModalOpen(false)}
          editingProduct={f.editingProduct}
          activeTab={f.activeTab}
          setActiveTab={f.setActiveTab}
          simulateTax={f.simulateTax}
          setSimulateTax={f.setSimulateTax}
          attachments={f.attachments}
          setAttachments={f.setAttachments}
          formName={f.formName}
          setFormName={f.setFormName}
          formSKU={f.formSKU}
          setFormSKU={f.setFormSKU}
          formCategory={f.formCategory}
          setFormCategory={f.setFormCategory}
          formType={f.formType}
          setFormType={f.setFormType}
          formPrice={f.formPrice}
          setFormPrice={f.setFormPrice}
          formCost={f.formCost}
          setFormCost={f.setFormCost}
          formCommission={f.formCommission}
          setFormCommission={f.setFormCommission}
          formStockMin={f.formStockMin}
          setFormStockMin={f.setFormStockMin}
          formStockMax={f.formStockMax}
          setFormStockMax={f.setFormStockMax}
          formProvider={f.formProvider}
          setFormProvider={f.setFormProvider}
          formTags={f.formTags}
          setFormTags={f.setFormTags}
          formIsBestSeller={f.formIsBestSeller}
          setFormIsBestSeller={f.setFormIsBestSeller}
          formDimensions={f.formDimensions}
          setFormDimensions={f.setFormDimensions}
          formWeight={f.formWeight}
          setFormWeight={f.setFormWeight}
          formMaterial={f.formMaterial}
          setFormMaterial={f.setFormMaterial}
          formDescription={f.formDescription}
          setFormDescription={f.setFormDescription}
          formCurrentStock={f.formCurrentStock}
          setFormCurrentStock={f.setFormCurrentStock}
          categories={f.categories}
          handleSaveProduct={f.handleSaveProduct}
        />
      </div>
    </PageContainer>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
