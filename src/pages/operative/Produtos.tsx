import { useMemo } from "react";
import { Plus, Package, FileSpreadsheet } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useProdutoForm } from "./produtos/useProdutoForm";
import { ProdutoModal } from "./produtos/ProdutoModal";
import { ProdutosGrid } from "./produtos/ProdutosGrid";
import { ProdutosTable } from "./produtos/ProdutosTable";
import { ProdutosKPIs } from "./components/Produtos/ProdutosKPIs";
import { ProdutosFilters } from "./components/Produtos/ProdutosFilters";
import { ProdutosAICombo } from "./components/Produtos/ProdutosAICombo";
import { toast } from "sonner";

export default function Catalog() {
  const f = useProdutoForm();

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

  const filteredProducts = useMemo(() => {
    return f.products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
          (p.provider && p.provider.toLowerCase().includes(f.searchTerm.toLowerCase()));
        const matchesCategory = f.selectedCategories.length === 0 || f.selectedCategories.includes(p.category);
        const matchesType = f.selectedTypes.length === 0 || f.selectedTypes.includes(p.type);
        const matchesStatus =
          f.selectedStatus === "Todos" ||
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

  const totalSkuCount = f.products.length;
  const activeSkuCount = f.products.filter(p => p.active).length;
  const averageMarginVal = useMemo(() => {
    const list = f.products.filter(p => p.active);
    if (list.length === 0) return 0;
    return Math.round((list.reduce((acc, curr) => acc + curr.margin, 0) / list.length) * 10) / 10;
  }, [f.products]);
  const bestSellerCount = f.products.filter(p => p.isBestSeller).length;

  return (
    <PageContainer
      title="Produtos & SKUs Axis"
      description="Painel Central de Gestão de Preços, Margem de Lucro, SKU e Comissionamento Comercial."
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToExcelSimulator}
            className="gap-2 border-white/10 text-slate-300 rounded-xl px-4 h-11 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha
          </Button>
          <Button
            onClick={f.handleOpenAddModal}
            className="gap-2 rounded-xl px-5 h-11 text-xs"
          >
            <Plus className="w-4 h-4" /> Cadastrar Produto
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-20">
        <ProdutosKPIs
          totalSkuCount={totalSkuCount}
          activeSkuCount={activeSkuCount}
          averageMarginVal={averageMarginVal}
          bestSellerCount={bestSellerCount}
        />

        <ProdutosFilters
          searchTerm={f.searchTerm} onSearchChange={f.setSearchTerm}
          categories={f.categories} selectedCategories={f.selectedCategories}
          onCategoryToggle={(cat) => f.setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
          types={f.types} selectedTypes={f.selectedTypes}
          onTypeToggle={(tp) => f.setSelectedTypes(prev => prev.includes(tp) ? prev.filter(t => t !== tp) : [...prev, tp])}
          selectedStatus={f.selectedStatus} onStatusChange={f.setSelectedStatus}
          sortBy={f.sortBy} onSortByChange={f.setSortBy}
          viewMode={f.viewMode} onViewModeChange={f.setViewMode}
          selectedIds={f.selectedIds} filteredCount={filteredProducts.length}
          onBulkActivate={() => f.executeBulkStatus(true)}
          onBulkDeactivate={() => f.executeBulkStatus(false)}
          onBulkDelete={f.executeBulkDelete}
        />

        {filteredProducts.length === 0 ? (
          <Card className="p-16 flex flex-col items-center justify-center text-center bg-[var(--color-surface-elevated)]/40 border-[var(--color-border-subtle)]">
            <Package className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-1">Nenhum SKU encontrado</h3>
            <p className="text-xs text-[var(--color-text-muted)] max-w-sm leading-relaxed">
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

        <ProdutosAICombo />

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
          clientSearch={f.clientSearch}
          setClientSearch={f.setClientSearch}
          clientId={f.clientId}
          clientName={f.clientName}
          showClientDropdown={f.showClientDropdown}
          setShowClientDropdown={f.setShowClientDropdown}
          filteredClients={f.filteredClients}
          handleSelectClient={f.handleSelectClient}
          clearClient={f.clearClient}
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
