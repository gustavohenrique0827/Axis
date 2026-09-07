import { useState, useMemo } from "react";
import { Card } from "../card";
import { Button } from "../button";
import { EmptyState } from "../empty-state";
import { Badge } from "../badge";
import {
  FileText,
  Package,
  Plus,
  Trash2,
  ShoppingCart,
  Search,
  Check,
  TrendingUp,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { handleDownloadPdf } from "../../../pages/crm/utils/proposalPdf";
import { cn } from "../../../lib/utils";

interface ProductsSectionProps {
  estimatedSum: number;
  availableProducts: any[];
  linkedProductIds: string[];
  productQuantities?: Record<string, number>;
  updateProductQuantity?: (prodId: string, qty: number) => void;
  handleCreateAndLinkProduct?: (data: {
    name: string;
    price: number;
    cost?: number;
    commission?: number;
    category?: string;
    type?: string;
    sku?: string;
  }) => Promise<string>;
  toggleProductLink: (id: string) => void;
  seller: string;
  setAlterationLogs: any;
  leadName?: string;
  companyName?: string;
  leadId?: string;
}

export function ProductsSection({
  estimatedSum,
  availableProducts = [],
  linkedProductIds = [],
  productQuantities = {},
  updateProductQuantity,
  handleCreateAndLinkProduct,
  toggleProductLink,
  seller,
  setAlterationLogs,
  leadName,
  companyName,
}: ProductsSectionProps) {
  // Mini PDV State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showAddForm, setShowAddForm] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdCommission, setNewProdCommission] = useState("5");
  const [newProdCategory, setNewProdCategory] = useState("Serviços");
  const [newProdType, setNewProdType] = useState("Digital");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Todas", "Software", "Serviços", "Mentoria", "Curso/Turma", "Assinatura", "Físico"];

  // Linked items with quantity
  const linkedItems = useMemo(() => {
    return linkedProductIds
      .map((id) => {
        const prod = availableProducts.find((p) => p.id === id);
        if (!prod) return null;
        const qty = productQuantities[id] || 1;
        const subtotal = prod.price * qty;
        const totalCost = (prod.cost || 0) * qty;
        const totalCommission = subtotal * ((prod.commission || 0) / 100);
        return {
          ...prod,
          quantity: qty,
          subtotal,
          totalCost,
          totalCommission,
        };
      })
      .filter(Boolean) as Array<any>;
  }, [linkedProductIds, availableProducts, productQuantities]);

  // PDV Totals
  const subtotalRaw = linkedItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCost = linkedItems.reduce((acc, item) => acc + item.totalCost, 0);
  const totalCommission = linkedItems.reduce((acc, item) => acc + item.totalCommission, 0);
  const finalTotal = Math.max(0, subtotalRaw - (discountValue || 0));
  const netProfit = Math.max(0, finalTotal - totalCost - totalCommission);
  const marginPercent = finalTotal > 0 ? ((netProfit / finalTotal) * 100).toFixed(1) : "0";

  // Filter available products
  const filteredCatalog = useMemo(() => {
    return availableProducts.filter((p) => {
      const matchName = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.category || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "Todas" || p.category === selectedCategory;
      return matchName && matchCat;
    });
  }, [availableProducts, searchTerm, selectedCategory]);

  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      toast.error("Informe o Nome e Preço de Venda do produto.");
      return;
    }

    const priceNum = parseFloat(newProdPrice.replace(",", ".")) || 0;
    const costNum = parseFloat(newProdCost.replace(",", ".")) || 0;
    const commNum = parseFloat(newProdCommission.replace(",", ".")) || 0;

    if (priceNum <= 0) {
      toast.error("O preço deve ser maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (handleCreateAndLinkProduct) {
        await handleCreateAndLinkProduct({
          name: newProdName.trim(),
          price: priceNum,
          cost: costNum,
          commission: commNum,
          category: newProdCategory,
          type: newProdType,
        });
      } else {
        toast.info("Produto adicionado localmente.");
      }

      // Reset form
      setNewProdName("");
      setNewProdPrice("");
      setNewProdCost("");
      setNewProdCommission("5");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error("Erro ao cadastrar produto: " + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQtyChange = (prodId: string, currentQty: number, delta: number) => {
    const next = Math.max(1, currentQty + delta);
    if (updateProductQuantity) {
      updateProductQuantity(prodId, next);
    }
  };

  const handleGeneratePdf = () => {
    if (linkedItems.length === 0) {
      toast.info("Adicione itens ao orçamento antes de exportar.");
      return;
    }

    handleDownloadPdf(
      {
        id: `prop-${Date.now()}`,
        cliente: companyName || leadName || "Cliente",
        titulo: `Orçamento Comercial — ${companyName || leadName || "Lead"}`,
        valor: finalTotal,
        vendedor: seller || "Consultor",
        status: "Enviada",
      },
      linkedItems.map((p) => ({
        product_name: p.name,
        quantidade: p.quantity,
        preco_unitario: p.price,
      }))
    );

    setAlterationLogs((prev: any[]) => [
      {
        id: Date.now().toString(),
        author: seller || "Sistema",
        desc: `PDF do Orçamento gerado no valor de R$ ${finalTotal.toLocaleString("pt-BR")}`,
        time: "Agora",
      },
      ...prev,
    ]);
    toast.success("PDF da proposta gerado com sucesso!");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── HEADER DO MINI PDV ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Mini PDV & Orçamento
            </h4>
            <p className="text-[10px] text-slate-400">
              Composição de itens e proposta comercial
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant={showAddForm ? "secondary" : "primary"}
          onClick={() => setShowAddForm((v) => !v)}
          className="text-[11px] font-bold h-7.5 gap-1.5 cursor-pointer"
        >
          {showAddForm ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Fechar Cadastro
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> + Novo Produto
            </>
          )}
        </Button>
      </div>

      {/* ── FORMULÁRIO DE CADASTRO RÁPIDO DE PRODUTO NO BANCO ── */}
      {showAddForm && (
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-blue-500/30 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <h5 className="text-xs font-black uppercase text-white tracking-wide">
                Cadastrar Novo Produto / Serviço no Banco
              </h5>
            </div>
            <span className="text-[10px] text-slate-400">Salva no Supabase e vincula ao lead</span>
          </div>

          <form onSubmit={handleQuickAddProduct} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Nome do Produto ou Serviço *
              </label>
              <input
                type="text"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Ex: Consultoria de Vendas Premium"
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Preço Venda (R$) *
                </label>
                <input
                  type="text"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Custo (R$)
                </label>
                <input
                  type="text"
                  value={newProdCost}
                  onChange={(e) => setNewProdCost(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-3 py-1.5 text-xs text-rose-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Comissão (%)
                </label>
                <input
                  type="text"
                  value={newProdCommission}
                  onChange={(e) => setNewProdCommission(e.target.value)}
                  placeholder="5"
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-3 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Categoria
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="Serviços">Serviços</option>
                  <option value="Software">Software</option>
                  <option value="Mentoria">Mentoria</option>
                  <option value="Curso/Turma">Curso/Turma</option>
                  <option value="Assinatura">Assinatura</option>
                  <option value="Físico">Físico</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-xs h-8"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="text-xs h-8 font-bold gap-1.5 bg-blue-600 hover:bg-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                {isSubmitting ? "Cadastrando..." : "Cadastrar e Adicionar"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── ITENS DO PEDIDO / CHECKOUT (MINI PDV) ── */}
      <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Itens da Proposta Comercial ({linkedItems.length})
            </span>
          </div>
          <Badge variant="success" className="font-mono text-xs font-bold px-2 py-0.5">
            Total: R$ {finalTotal.toLocaleString("pt-BR")}
          </Badge>
        </div>

        {linkedItems.length > 0 ? (
          <div className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin pr-1">
            {linkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] hover:border-white/10 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{item.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-semibold uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Un: R$ {item.price.toLocaleString("pt-BR")}
                  </div>
                </div>

                {/* Quantidade PDV */}
                <div className="flex items-center gap-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                    title="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-black text-white px-1.5 tabular-nums min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
                    title="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal do Item */}
                <div className="text-right min-w-[80px]">
                  <div className="text-xs font-mono font-black text-emerald-400">
                    R$ {item.subtotal.toLocaleString("pt-BR")}
                  </div>
                </div>

                {/* Remover Item */}
                <button
                  type="button"
                  onClick={() => toggleProductLink(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Remover item da proposta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center flex flex-col items-center gap-2 border border-dashed border-[var(--color-border-subtle)] rounded-xl">
            <Package className="w-6 h-6 text-slate-500" />
            <p className="text-xs text-slate-400 font-medium">
              Nenhum produto selecionado para esta proposta.
            </p>
            <p className="text-[10px] text-slate-500">
              Escolha produtos no catálogo abaixo ou cadastre um novo.
            </p>
          </div>
        )}

        {/* ── DETALHAMENTO FINANCEIRO DO PDV ── */}
        <div className="bg-[var(--color-surface-sunken)] p-3 rounded-xl border border-[var(--color-border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-black text-slate-400">
            <span>Métricas do Pedido</span>
            <span>Margem: {marginPercent}%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[var(--color-surface-elevated)] p-2 rounded-lg border border-white/[0.04]">
              <span className="text-[9px] text-slate-500 block uppercase">Subtotal</span>
              <span className="text-white font-bold text-xs">R$ {subtotalRaw.toLocaleString("pt-BR")}</span>
            </div>

            <div className="bg-[var(--color-surface-elevated)] p-2 rounded-lg border border-white/[0.04]">
              <span className="text-[9px] text-slate-500 block uppercase">Custos</span>
              <span className="text-rose-400 font-bold text-xs">R$ {totalCost.toLocaleString("pt-BR")}</span>
            </div>

            <div className="bg-[var(--color-surface-elevated)] p-2 rounded-lg border border-white/[0.04]">
              <span className="text-[9px] text-slate-500 block uppercase">Comissão</span>
              <span className="text-amber-400 font-bold text-xs">R$ {totalCommission.toLocaleString("pt-BR")}</span>
            </div>

            <div className="bg-[var(--color-surface-elevated)] p-2 rounded-lg border border-white/[0.04]">
              <span className="text-[9px] text-slate-500 block uppercase">Lucro Líquido</span>
              <span className="text-emerald-400 font-bold text-xs">R$ {netProfit.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>

        {/* ── BOTÃO DE BAIXAR PDF ── */}
        <Button
          variant="outline"
          disabled={linkedItems.length === 0}
          onClick={handleGeneratePdf}
          className="w-full text-xs font-bold gap-2 h-9 border-blue-500/30 hover:bg-blue-500/10 text-blue-400 cursor-pointer disabled:opacity-40"
        >
          <FileText className="w-4 h-4" /> Baixar PDF da Proposta / Orçamento
        </Button>
      </Card>

      {/* ── CATÁLOGO DE PRODUTOS DISPONÍVEIS ── */}
      <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Catálogo de Produtos ({filteredCatalog.length})
          </span>
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome de produto..."
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                    : "bg-[var(--color-surface-sunken)] border-[var(--color-border-subtle)] text-slate-400 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Produtos Disponíveis */}
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
            {filteredCatalog.map((prod) => {
              const isLinked = linkedProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleProductLink(prod.id)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 group",
                    isLinked
                      ? "bg-blue-500/10 border-blue-500/40 text-white shadow-sm"
                      : "bg-[var(--color-surface-sunken)] border-[var(--color-border-subtle)] text-slate-300 hover:border-white/20 hover:text-white"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-snug truncate">{prod.name}</p>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">
                      {prod.category} {prod.recurrence && "• Recorrente"}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-emerald-400 whitespace-nowrap">
                      R$ {prod.price.toLocaleString("pt-BR")}
                    </span>
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center transition-all",
                        isLinked
                          ? "bg-blue-500 text-white"
                          : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-white"
                      )}
                    >
                      {isLinked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Nenhum produto no catálogo"
            description="Utilize o botão acima '+ Novo Produto' para cadastrar no banco."
            className="py-6"
          />
        )}
      </Card>
    </div>
  );
}
