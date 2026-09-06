import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Package, Link2, Copy,
  History, ChevronDown, ChevronUp, TrendingUp, Receipt, QrCode, CreditCard,
  Banknote, ArrowDownRight, ArrowUpRight, Lock, CheckCircle2, Printer,
  Share2, RotateCcw, AlertTriangle, Sparkles, DollarSign, Wallet, Store,
  Barcode, Check, ShieldCheck, RefreshCw, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/ui/empty-state";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { confirmDialog } from "../../components/ui/confirm-dialog";

interface VendaHistorico {
  id: string;
  cliente_nome: string | null;
  forma_pagamento: string | null;
  status: string;
  subtotal: number;
  desconto: number;
  valor_total: number;
  troco?: number;
  valor_recebido?: number;
  operador?: string;
  created_at: string;
  itens?: CartItemSnapshot[];
}

interface CartItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantidade: number;
  subtotal: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantidade: number;
  estoqueDisponivel: number;
  sku?: string;
  barcode?: string;
  category?: string;
}

interface CaixaOperacao {
  id: string;
  tipo: "abertura" | "suprimento" | "sangria" | "fechamento";
  valor: number;
  motivo: string;
  operador: string;
  data: string;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VarejoVendas() {
  const { products, setProducts, updateProduct, addFinanceEntry } = useData();
  const { user, activeTenantId } = useAuth();
  const tenantId = activeTenantId || "default";

  const [tab, setTab] = useState<"pdv" | "historico">("pdv");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCpf, setClienteCpf] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"Dinheiro" | "Pix" | "Cartão de Crédito" | "Cartão de Débito" | "Misto">("Dinheiro");
  const [descontoTipo, setDescontoTipo] = useState<"valor" | "porcentagem">("valor");
  const [descontoValor, setDescontoValor] = useState<string>("");
  const [valorRecebido, setValorRecebido] = useState<string>("");
  const [parcelasCartao, setParcelasCartao] = useState<number>(1);
  const [bandeiraCartao, setBandeiraCartao] = useState<string>("Mastercard");
  const [pixConfirmado, setPixConfirmado] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  // Cupom Modal
  const [receiptVenda, setReceiptVenda] = useState<VendaHistorico | null>(null);

  // Caixa Operations State
  const [caixaAberto, setCaixaAberto] = useState(true);
  const [modalCaixa, setModalCaixa] = useState<"sangria" | "suprimento" | "fechamento" | null>(null);
  const [valorOperacaoCaixa, setValorOperacaoCaixa] = useState("");
  const [motivoOperacaoCaixa, setMotivoOperacaoCaixa] = useState("");
  const [caixaOperacoes, setCaixaOperacoes] = useState<CaixaOperacao[]>(() => {
    try {
      const saved = localStorage.getItem(`spy_caixa_operacoes_${tenantId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "cx-1",
        tipo: "abertura",
        valor: 150.0,
        motivo: "Fundo de Troco Inicial",
        operador: user?.name || "Operador Caixa 01",
        data: new Date().toLocaleDateString("pt-BR") + " 08:00",
      },
    ];
  });

  // Histórico de Vendas
  const [historico, setHistorico] = useState<VendaHistorico[]>(() => {
    try {
      const saved = localStorage.getItem(`spy_vendas_${tenantId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "VND-901",
        cliente_nome: "Maria Helena Castro",
        forma_pagamento: "Pix",
        status: "paga",
        subtotal: 389.9,
        desconto: 20.0,
        valor_total: 369.9,
        operador: user?.name || "Caixa 01",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        itens: [
          { productId: "prod-1", name: "Smartwatch Pro Ultra GPS", price: 389.9, quantidade: 1, subtotal: 389.9 },
        ],
      },
      {
        id: "VND-900",
        cliente_nome: "Rafael Gomes",
        forma_pagamento: "Cartão de Crédito (3x)",
        status: "paga",
        subtotal: 249.8,
        desconto: 0,
        valor_total: 249.8,
        operador: user?.name || "Caixa 01",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        itens: [
          { productId: "prod-2", name: "Fone Bluetooth TWS ANC", price: 179.9, quantidade: 1, subtotal: 179.9 },
          { productId: "prod-3", name: "Carregador Turbo 30W USB-C", price: 69.9, quantidade: 1, subtotal: 69.9 },
        ],
      },
    ];
  });
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [expandedVenda, setExpandedVenda] = useState<string | null>(null);
  const [filtroHistorico, setFiltroHistorico] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync vendas com localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`spy_vendas_${tenantId}`, JSON.stringify(historico));
    } catch {}
  }, [historico, tenantId]);

  // Sync operações de caixa
  useEffect(() => {
    try {
      localStorage.setItem(`spy_caixa_operacoes_${tenantId}`, JSON.stringify(caixaOperacoes));
    } catch {}
  }, [caixaOperacoes, tenantId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.category) set.add(p.category);
    });
    return ["Todas", ...Array.from(set)];
  }, [products]);

  const produtosDisponiveis = useMemo(() => {
    return products.filter((p: any) => {
      if (p.active === false) return false;
      if (selectedCategory !== "Todas" && p.category !== selectedCategory) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const skuMatch = p.sku?.toLowerCase().includes(q);
      const nameMatch = p.name?.toLowerCase().includes(q);
      const barMatch = p.typeAttributes?.barcode?.toLowerCase().includes(q) || p.typeAttributes?.ean?.toLowerCase().includes(q);
      return skuMatch || nameMatch || barMatch;
    });
  }, [products, search, selectedCategory]);

  // Cálculos do Carrinho
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantidade, 0);
  }, [cart]);

  const descontoCalculado = useMemo(() => {
    const rawVal = parseFloat(descontoValor.replace(",", ".")) || 0;
    if (rawVal <= 0) return 0;
    if (descontoTipo === "porcentagem") {
      const pct = Math.min(rawVal, 100);
      return (subtotal * pct) / 100;
    }
    return Math.min(rawVal, subtotal);
  }, [descontoValor, descontoTipo, subtotal]);

  const total = Math.max(0, subtotal - descontoCalculado);

  const troco = useMemo(() => {
    if (formaPagamento !== "Dinheiro") return 0;
    const rec = parseFloat(valorRecebido.replace(",", ".")) || 0;
    return rec >= total ? rec - total : 0;
  }, [valorRecebido, total, formaPagamento]);

  const valorFaltanteDinheiro = useMemo(() => {
    if (formaPagamento !== "Dinheiro") return 0;
    const rec = parseFloat(valorRecebido.replace(",", ".")) || 0;
    return rec < total ? total - rec : 0;
  }, [valorRecebido, total, formaPagamento]);

  // Adicionar ao carrinho
  const addToCart = (product: any) => {
    const estoque = product.currentStock ?? 0;
    if (estoque <= 0) {
      toast.error("Produto sem estoque disponível!");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantidade + 1 > estoque) {
          toast.error(`Limite do estoque atingido (${estoque} unidades).`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantidade: 1,
          estoqueDisponivel: estoque,
          sku: product.sku,
          barcode: product.typeAttributes?.barcode || product.typeAttributes?.ean,
          category: product.category,
        },
      ];
    });
    toast.success(`${product.name} adicionado ao carrinho!`, { duration: 1500 });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const nextQty = i.quantidade + delta;
          if (nextQty > i.estoqueDisponivel) {
            toast.error(`Quantidade máxima disponível: ${i.estoqueDisponivel} un.`);
            return i;
          }
          return { ...i, quantidade: nextQty };
        })
        .filter((i) => i.quantidade > 0)
    );
  };

  const setDirectQty = (productId: string, qtyStr: string) => {
    const num = parseInt(qtyStr, 10);
    if (isNaN(num) || num <= 0) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        if (num > i.estoqueDisponivel) {
          toast.error(`Estoque disponível: apenas ${i.estoqueDisponivel} unidades.`);
          return { ...i, quantidade: i.estoqueDisponivel };
        }
        return { ...i, quantidade: num };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearCart = async () => {
    if (cart.length === 0) return;
    const ok = await confirmDialog({
      title: "Limpar Carrinho",
      message: "Deseja realmente remover todos os itens do carrinho atual?",
      confirmText: "Sim, Limpar",
      variant: "danger",
    });
    if (ok) {
      setCart([]);
      setDescontoValor("");
      setValorRecebido("");
      setPixConfirmado(false);
      toast.info("Carrinho esvaziado.");
    }
  };

  // Leitor de Código de Barras / SKU rápido
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const code = barcodeInput.trim().toLowerCase();
    const found = products.find(
      (p: any) =>
        p.sku?.toLowerCase() === code ||
        p.typeAttributes?.barcode?.toLowerCase() === code ||
        p.typeAttributes?.ean?.toLowerCase() === code ||
        p.name?.toLowerCase().includes(code)
    );

    if (found) {
      addToCart(found);
      setBarcodeInput("");
    } else {
      toast.error(`Produto com código ou SKU "${barcodeInput}" não encontrado.`);
    }
  };

  // Finalizar Venda
  const handleFinalizarVenda = async () => {
    if (cart.length === 0) {
      toast.error("Adicione ao menos um produto ao carrinho.");
      return;
    }

    if (formaPagamento === "Dinheiro") {
      const rec = parseFloat(valorRecebido.replace(",", ".")) || 0;
      if (rec > 0 && rec < total) {
        toast.error(`Valor em dinheiro insuficiente. Faltam ${formatPrice(total - rec)}.`);
        return;
      }
    }

    setFinalizando(true);

    try {
      const vendaId = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
      const operadorNome = user?.name || "Operador Caixa";
      const recNumber = parseFloat(valorRecebido.replace(",", ".")) || total;

      const vendaSnap: VendaHistorico = {
        id: vendaId,
        cliente_nome: clienteNome.trim() ? `${clienteNome.trim()}${clienteCpf ? ` (${clienteCpf})` : ""}` : "Consumidor Final",
        forma_pagamento: formaPagamento === "Cartão de Crédito" ? `Cartão Crédito (${parcelasCartao}x - ${bandeiraCartao})` : formaPagamento,
        status: "paga",
        subtotal,
        desconto: descontoCalculado,
        valor_total: total,
        troco: troco > 0 ? troco : undefined,
        valor_recebido: formaPagamento === "Dinheiro" ? recNumber : undefined,
        operador: operadorNome,
        created_at: new Date().toISOString(),
        itens: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantidade: i.quantidade,
          subtotal: i.price * i.quantidade,
        })),
      };

      // 1. Atualizar estoque dos produtos
      const updatedProducts = products.map((prod: any) => {
        const itemInCart = cart.find((c) => c.productId === prod.id);
        if (itemInCart) {
          const novoEstoque = Math.max(0, (prod.currentStock ?? 0) - itemInCart.quantidade);
          return { ...prod, currentStock: novoEstoque };
        }
        return prod;
      });
      setProducts(updatedProducts);
      try {
        localStorage.setItem(`spy_products_${tenantId}`, JSON.stringify(updatedProducts));
      } catch {}

      // 2. Registrar movimentação de estoque para histórico do almoxarifado
      try {
        const movStorageKey = `spy_estoque_mov_${tenantId}`;
        const existingMovs = JSON.parse(localStorage.getItem(movStorageKey) || "[]");
        const newMovs = cart.map((item) => ({
          id: `mov-${Math.random().toString(36).substring(2, 9)}`,
          product_id: item.productId,
          tipo: "venda",
          quantidade: -item.quantidade,
          motivo: `Venda PDV ${vendaId}`,
          created_at: new Date().toISOString(),
        }));
        localStorage.setItem(movStorageKey, JSON.stringify([...newMovs, ...existingMovs]));
      } catch {}

      // 3. Lançar no Financeiro como receita confirmada
      if (addFinanceEntry) {
        addFinanceEntry({
          description: `Venda Varejo PDV ${vendaId} - ${vendaSnap.cliente_nome}`,
          value: total,
          type: "Receber",
          category: "Vendas Varejo (PDV)",
          date: new Date().toLocaleDateString("pt-BR"),
          status: "Pago",
        });
      }

      // 4. Lançar no módulo de Pedidos Varejo para manter unificado
      try {
        const pedStorageKey = `spy_pedidos_varejo_${tenantId}`;
        const existingPedidos = JSON.parse(localStorage.getItem(pedStorageKey) || "[]");
        const itensDesc = cart.map((i) => `${i.quantidade}x ${i.name}`).join(", ");
        const newPedido = {
          id: `PED-${Math.floor(9820 + Math.random() * 500)}`,
          cliente: vendaSnap.cliente_nome || "Consumidor Final",
          telefone: "",
          itens: itensDesc,
          total,
          formaPagto: vendaSnap.forma_pagamento || "Dinheiro",
          data: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          status: "Entregue / Concluído",
        };
        localStorage.setItem(pedStorageKey, JSON.stringify([newPedido, ...existingPedidos]));
      } catch {}

      // 5. Se Supabase estiver conectado, salvar de forma não-bloqueante
      if (supabase) {
        try {
          await supabase.from("vendas").insert({
            id: vendaId,
            tenant_id: activeTenantId,
            cliente_nome: vendaSnap.cliente_nome,
            forma_pagamento: vendaSnap.forma_pagamento,
            status: "paga",
            valor_total: total,
            created_at: vendaSnap.created_at,
          });
        } catch (supaErr) {
          console.warn("[PDV] Supabase sync fallback to local:", supaErr);
        }
      }

      // 6. Atualizar histórico local e abrir cupom de impressão
      setHistorico((prev) => [vendaSnap, ...prev]);
      setReceiptVenda(vendaSnap);

      toast.success(`Venda ${vendaId} finalizada com sucesso!`, {
        description: `Total: ${formatPrice(total)} — Estoque baixado e financeiro integrado.`,
        duration: 4000,
      });

      // Reset carrinho
      setCart([]);
      setClienteNome("");
      setClienteCpf("");
      setDescontoValor("");
      setValorRecebido("");
      setPixConfirmado(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao processar a venda.");
    } finally {
      setFinalizando(false);
    }
  };

  // Cancelar / Estornar Venda do Histórico
  const handleEstornarVenda = async (venda: VendaHistorico) => {
    const ok = await confirmDialog({
      title: `Estornar Venda ${venda.id}`,
      message: `Deseja realmente cancelar esta venda de ${formatPrice(venda.valor_total)}? Os itens retornarão ao estoque da loja.`,
      confirmText: "Sim, Cancelar e Devolver Estoque",
      variant: "danger",
    });

    if (!ok) return;

    // Devolver itens ao estoque
    if (venda.itens && venda.itens.length > 0) {
      const restoredProducts = products.map((prod: any) => {
        const itemVend = venda.itens?.find((it) => it.productId === prod.id);
        if (itemVend) {
          return { ...prod, currentStock: (prod.currentStock ?? 0) + itemVend.quantidade };
        }
        return prod;
      });
      setProducts(restoredProducts);
      try {
        localStorage.setItem(`spy_products_${tenantId}`, JSON.stringify(restoredProducts));
      } catch {}
    }

    // Atualizar status no histórico
    setHistorico((prev) =>
      prev.map((v) => (v.id === venda.id ? { ...v, status: "cancelada" } : v))
    );

    toast.success(`Venda ${venda.id} estornada e estoque devolvido com sucesso!`);
  };

  // Operações de Caixa
  const handleExecutarOperacaoCaixa = () => {
    const val = parseFloat(valorOperacaoCaixa.replace(",", ".")) || 0;
    if (val <= 0 && modalCaixa !== "fechamento") {
      toast.error("Informe um valor válido.");
      return;
    }

    if (!motivoOperacaoCaixa.trim() && modalCaixa !== "fechamento") {
      toast.error("Informe o motivo da operação.");
      return;
    }

    const novaOp: CaixaOperacao = {
      id: `cx-${Math.floor(100 + Math.random() * 900)}`,
      tipo: modalCaixa || "sangria",
      valor: val,
      motivo: motivoOperacaoCaixa.trim() || (modalCaixa === "fechamento" ? "Fechamento de Turno" : "Operação de Caixa"),
      operador: user?.name || "Operador Caixa",
      data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setCaixaOperacoes((prev) => [novaOp, ...prev]);

    if (modalCaixa === "fechamento") {
      setCaixaAberto(false);
      toast.success("Caixa fechado com sucesso!");
    } else {
      toast.success(`${modalCaixa === "sangria" ? "Sangria" : "Suprimento"} de ${formatPrice(val)} registrado!`);
    }

    setModalCaixa(null);
    setValorOperacaoCaixa("");
    setMotivoOperacaoCaixa("");
  };

  // Métricas de hoje
  const hojeStr = new Date().toISOString().split("T")[0];
  const vendasHoje = historico.filter(
    (v) => v.status === "paga" && v.created_at.startsWith(hojeStr)
  );
  const faturamentoHoje = vendasHoje.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticketMedioHoje = vendasHoje.length > 0 ? faturamentoHoje / vendasHoje.length : 0;
  const itensVendidosHoje = vendasHoje.reduce(
    (acc, v) => acc + (v.itens?.reduce((sub, it) => sub + it.quantidade, 0) || 0),
    0
  );

  const catalogUrl = activeTenantId ? `${window.location.origin}/catalogo/${activeTenantId}` : "";

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--color-surface-elevated)] p-4 rounded-2xl border border-[var(--color-border-default)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-[var(--color-text-primary)]">
                Frente de Caixa (PDV)
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${caixaAberto ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${caixaAberto ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Operador: <span className="font-bold text-[var(--color-text-primary)]">{user?.name || "Operador Caixa 01"}</span> · Loja Principal
            </p>
          </div>
        </div>

        {/* Caixa Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {caixaAberto ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalCaixa("suprimento")}
                className="gap-1.5 text-xs font-bold bg-[var(--color-surface)] hover:bg-emerald-500/10 hover:text-emerald-500"
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" /> Suprimento
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalCaixa("sangria")}
                className="gap-1.5 text-xs font-bold bg-[var(--color-surface)] hover:bg-amber-500/10 hover:text-amber-500"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" /> Sangria
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalCaixa("fechamento")}
                className="gap-1.5 text-xs font-bold bg-[var(--color-surface)] hover:bg-red-500/10 hover:text-red-500"
              >
                <Lock className="w-3.5 h-3.5 text-red-500" /> Fechar Caixa
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setCaixaAberto(true);
                toast.success("Caixa aberto com sucesso!");
              }}
              className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Store className="w-3.5 h-3.5" /> Reabrir Caixa
            </Button>
          )}

          {catalogUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(catalogUrl);
                toast.success("Link do catálogo público copiado!");
              }}
              className="gap-1.5 text-xs font-bold"
            >
              <Link2 className="w-3.5 h-3.5" /> Catálogo <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl p-1 gap-1 w-fit shadow-xs">
        <button
          onClick={() => setTab("pdv")}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            tab === "pdv"
              ? "bg-[var(--color-primary-blue)] text-white shadow-xs"
              : "text-[var(--color-text-faint)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Frente de Caixa (PDV)
          {cart.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-white text-blue-600 rounded-full font-black">
              {cart.reduce((s, i) => s + i.quantidade, 0)}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("historico")}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            tab === "historico"
              ? "bg-[var(--color-primary-blue)] text-white shadow-xs"
              : "text-[var(--color-text-faint)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <History className="w-3.5 h-3.5" /> Histórico de Vendas ({historico.length})
        </button>
      </div>

      {/* TAB 1: PDV FRENTE DE CAIXA */}
      {tab === "pdv" && (
        <div className="grid lg:grid-cols-12 gap-5">
          {/* LADO ESQUERDO: CATÁLOGO E LEITOR (Colunas 7 de 12) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Barra de Leitor de Código de Barras / Bip Rápido */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <Input
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Leitor de Código de Barras (EAN) ou SKU... [Pressione Enter]"
                  className="pl-9 h-11 text-xs font-mono bg-[var(--color-surface-elevated)] border-blue-500/30 focus:border-blue-500"
                />
              </div>
              <Button type="submit" size="sm" className="h-11 px-4 font-bold text-xs gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bipar
              </Button>
            </form>

            {/* Busca textual e categorias */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <Input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produto por nome..."
                  className="pl-9 text-xs"
                />
              </div>

              {/* Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-blue-500/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Produtos */}
            {produtosDisponiveis.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Nenhum produto encontrado"
                description="Cadastre ou ajuste os produtos em Varejo → Estoque para visualizá-los aqui."
                className="py-12"
              />
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {produtosDisponiveis.map((p: any) => {
                  const estoque = p.currentStock ?? 0;
                  const esgotado = estoque <= 0;
                  const baixo = estoque > 0 && estoque <= (p.stockMin || 5);

                  return (
                    <Card
                      key={p.id}
                      onClick={() => !esgotado && addToCart(p)}
                      className={`p-3.5 flex flex-col justify-between transition-all cursor-pointer border ${
                        esgotado
                          ? "opacity-60 bg-[var(--color-surface)] border-[var(--color-border-default)] cursor-not-allowed"
                          : "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] hover:border-blue-500/50 hover:shadow-md active:scale-[0.99]"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-faint)]">
                            {p.category || "Varejo"}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
                              esgotado
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : baixo
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}
                          >
                            {esgotado ? "Esgotado" : `${estoque} un.`}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[var(--color-text-primary)] line-clamp-2 leading-snug">
                          {p.name}
                        </h4>
                        <p className="text-[10px] font-mono text-[var(--color-text-faint)] mt-1">
                          {p.sku || "SEM SKU"}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                        <span className="text-sm font-black font-mono text-emerald-500">
                          {formatPrice(Number(p.price) || 0)}
                        </span>
                        <Button
                          size="sm"
                          disabled={esgotado}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p);
                          }}
                          className="h-7 w-7 p-0 rounded-lg text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* LADO DIREITO: CUPOM / CARRINHO / CHECKOUT (Colunas 5 de 12) */}
          <div className="lg:col-span-5">
            <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-4 rounded-2xl shadow-lg space-y-4 sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-black text-[var(--color-text-primary)]">
                    Itens da Venda ({cart.reduce((s, i) => s + i.quantidade, 0)})
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>

              {/* Lista de Itens no Carrinho */}
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--color-text-faint)] space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
                  <p className="font-bold">Caixa Livre</p>
                  <p className="text-[11px]">Bipe um código de barras ou clique nos produtos ao lado para iniciar a venda.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-default)] text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[var(--color-text-primary)] truncate">{item.name}</p>
                        <p className="text-[10px] text-[var(--color-text-faint)]">
                          {formatPrice(item.price)} un.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => changeQty(item.productId, -1)}
                          className="w-6 h-6 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex items-center justify-center hover:bg-[var(--color-surface-sunken)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.estoqueDisponivel}
                          value={item.quantidade}
                          onChange={(e) => setDirectQty(item.productId, e.target.value)}
                          className="w-10 text-center font-bold font-mono text-xs bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => changeQty(item.productId, 1)}
                          className="w-6 h-6 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex items-center justify-center hover:bg-[var(--color-surface-sunken)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-16 shrink-0 font-mono font-bold text-[var(--color-text-primary)]">
                        {formatPrice(item.price * item.quantidade)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dados do Cliente (Opcional) */}
              <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Cliente (opcional)"
                    className="text-xs h-8"
                  />
                  <Input
                    value={clienteCpf}
                    onChange={(e) => setClienteCpf(e.target.value)}
                    placeholder="CPF na nota (opcional)"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Desconto */}
              <div className="pt-2 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                    Desconto:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDescontoTipo("valor")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        descontoTipo === "valor"
                          ? "bg-blue-600 text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text-faint)]"
                      }`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescontoTipo("porcentagem")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        descontoTipo === "porcentagem"
                          ? "bg-blue-600 text-white"
                          : "bg-[var(--color-surface)] text-[var(--color-text-faint)]"
                      }`}
                    >
                      %
                    </button>
                    <Input
                      type="number"
                      min={0}
                      value={descontoValor}
                      onChange={(e) => setDescontoValor(e.target.value)}
                      placeholder="0,00"
                      className="w-20 text-xs h-7 text-right font-mono"
                    />
                  </div>
                </div>
                {descontoCalculado > 0 && (
                  <p className="text-[10px] text-emerald-500 font-bold text-right mt-1">
                    Economia: -{formatPrice(descontoCalculado)}
                  </p>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-faint)] block">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Dinheiro", "Pix", "Cartão de Crédito", "Cartão de Débito"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setFormaPagamento(m);
                        if (m === "Dinheiro" && !valorRecebido) setValorRecebido(total.toFixed(2));
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        formaPagamento === m
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-[var(--color-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-blue-500/40"
                      }`}
                    >
                      {m === "Dinheiro" && <Banknote className="w-3.5 h-3.5" />}
                      {m === "Pix" && <QrCode className="w-3.5 h-3.5" />}
                      {m === "Cartão de Crédito" && <CreditCard className="w-3.5 h-3.5" />}
                      {m === "Cartão de Débito" && <Wallet className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>

                {/* Seletor Específico do Método Selecionado */}
                {formaPagamento === "Dinheiro" && (
                  <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-default)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--color-text-muted)]">Valor Recebido:</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={valorRecebido}
                        onChange={(e) => setValorRecebido(e.target.value)}
                        placeholder="R$ 0,00"
                        className="w-28 text-right font-mono font-bold h-8 text-xs"
                      />
                    </div>
                    {/* Botões Rápidos de Cédulas */}
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setValorRecebido(total.toFixed(2))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-surface-elevated)] border hover:border-blue-500"
                      >
                        Exato
                      </button>
                      {[20, 50, 100, 200].map((ced) => (
                        <button
                          key={ced}
                          type="button"
                          onClick={() => setValorRecebido(String(ced))}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-surface-elevated)] border hover:border-blue-500"
                        >
                          R$ {ced}
                        </button>
                      ))}
                    </div>
                    {/* Alerta de Troco */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border-subtle)] text-xs">
                      <span className="font-black text-[var(--color-text-primary)]">Troco:</span>
                      <span
                        className={`font-black font-mono text-sm ${
                          troco > 0
                            ? "text-emerald-500"
                            : valorFaltanteDinheiro > 0
                            ? "text-amber-500"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {valorFaltanteDinheiro > 0
                          ? `Faltam ${formatPrice(valorFaltanteDinheiro)}`
                          : formatPrice(troco)}
                      </span>
                    </div>
                  </div>
                )}

                {formaPagamento === "Pix" && (
                  <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-blue-500/30 space-y-2 text-center">
                    <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                      {/* Simulação QR Code Pix */}
                      <QrCode className="w-20 h-20 text-slate-900" />
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      Chave Pix Aleatória gerada para esta venda:
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        readOnly
                        value={`00020126580014br.gov.bcb.pix0136${tenantId.substring(0, 12)}5204000053039865802BR5915AXIS VAREJO6009SAO PAULO62070503***6304`}
                        className="text-[9px] font-mono bg-[var(--color-surface-elevated)] border rounded px-2 py-1 flex-1 text-[var(--color-text-faint)] truncate"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText("00020126580014br.gov.bcb.pix");
                          toast.success("Código Pix Copia e Cola copiado!");
                        }}
                        className="h-7 text-[10px] font-bold shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPixConfirmado(true);
                        toast.success("Pagamento Pix confirmado!");
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                        pixConfirmado
                          ? "bg-emerald-600 text-white flex items-center justify-center gap-1.5"
                          : "bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border border-blue-500/30"
                      }`}
                    >
                      {pixConfirmado ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pix Confirmado pelo Banco
                        </>
                      ) : (
                        "Simular Confirmação Instantânea"
                      )}
                    </button>
                  </div>
                )}

                {formaPagamento === "Cartão de Crédito" && (
                  <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-default)] space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-[var(--color-text-faint)] font-bold block mb-1">
                          Parcelamento:
                        </label>
                        <select
                          value={parcelasCartao}
                          onChange={(e) => setParcelasCartao(Number(e.target.value))}
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-lg p-1.5 text-xs font-bold"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}x de {formatPrice(total / n)} {n === 1 ? "(à vista)" : "sem juros"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--color-text-faint)] font-bold block mb-1">
                          Bandeira:
                        </label>
                        <select
                          value={bandeiraCartao}
                          onChange={(e) => setBandeiraCartao(e.target.value)}
                          className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-lg p-1.5 text-xs font-bold"
                        >
                          {["Mastercard", "Visa", "Elo", "Hipercard", "Amex"].map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {formaPagamento === "Cartão de Débito" && (
                  <div className="p-2.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-default)] text-xs flex items-center justify-between">
                    <span className="text-[var(--color-text-muted)] font-bold">Bandeira do Débito:</span>
                    <select
                      value={bandeiraCartao}
                      onChange={(e) => setBandeiraCartao(e.target.value)}
                      className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-lg p-1 text-xs font-bold"
                    >
                      {["Mastercard Débito", "Visa Electron", "Elo Débito"].map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Totalizadores e Finalizar */}
              <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                {descontoCalculado > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-500 font-bold">
                    <span>Desconto:</span>
                    <span className="font-mono">-{formatPrice(descontoCalculado)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-black text-[var(--color-text-primary)] pt-1">
                  <span>Total a Pagar:</span>
                  <span className="text-xl font-mono text-blue-500">{formatPrice(total)}</span>
                </div>

                <Button
                  onClick={handleFinalizarVenda}
                  loading={finalizando}
                  disabled={cart.length === 0 || !caixaAberto}
                  className="w-full font-black text-sm h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Finalizar Venda
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE VENDAS */}
      {tab === "historico" && (
        <div className="space-y-4">
          {/* Métricas do Dia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Vendas Hoje
                </span>
                <ShoppingCart className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">
                {vendasHoje.length}
              </div>
            </Card>

            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Faturamento Hoje
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black font-mono text-emerald-500">
                {formatPrice(faturamentoHoje)}
              </div>
            </Card>

            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Ticket Médio Hoje
                </span>
                <Receipt className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">
                {formatPrice(ticketMedioHoje)}
              </div>
            </Card>

            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Itens Vendidos Hoje
                </span>
                <Package className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">
                {itensVendidosHoje} un.
              </div>
            </Card>
          </div>

          {/* Filtro de Busca */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
              <Input
                value={filtroHistorico}
                onChange={(e) => setFiltroHistorico(e.target.value)}
                placeholder="Buscar por ID ou nome do cliente..."
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Lista de Vendas */}
          {historico.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhuma venda registrada"
              description="As vendas finalizadas no PDV aparecerão aqui."
              className="py-12"
            />
          ) : (
            <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden">
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {historico
                  .filter((v) => {
                    if (!filtroHistorico.trim()) return true;
                    const q = filtroHistorico.toLowerCase();
                    return (
                      v.id.toLowerCase().includes(q) ||
                      v.cliente_nome?.toLowerCase().includes(q) ||
                      v.forma_pagamento?.toLowerCase().includes(q)
                    );
                  })
                  .map((v) => {
                    const isExp = expandedVenda === v.id;
                    const isCancelada = v.status === "cancelada";

                    return (
                      <div key={v.id} className={isCancelada ? "opacity-60 bg-red-500/5" : ""}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                          <button
                            onClick={() => setExpandedVenda(isExp ? null : v.id)}
                            className="flex items-center gap-3 text-left min-w-0 flex-1"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs text-[var(--color-text-primary)]">
                                  {v.id}
                                </span>
                                <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                                  {v.cliente_nome || "Consumidor Final"}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--color-text-faint)] mt-0.5">
                                {new Date(v.created_at).toLocaleString("pt-BR")} · {v.forma_pagamento} · Operador: {v.operador || "Caixa"}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                isCancelada
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              }`}
                            >
                              {isCancelada ? "Cancelada" : "Paga"}
                            </span>

                            <span className="text-sm font-black text-[var(--color-text-primary)] font-mono min-w-[90px] text-right">
                              {formatPrice(Number(v.valor_total))}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReceiptVenda(v)}
                              className="h-7 text-xs font-bold gap-1"
                            >
                              <Printer className="w-3 h-3" /> Cupom
                            </Button>

                            {!isCancelada && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEstornarVenda(v)}
                                className="h-7 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            )}

                            <button
                              onClick={() => setExpandedVenda(isExp ? null : v.id)}
                              className="p-1 text-[var(--color-text-faint)]"
                            >
                              {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Itens da Venda Expandidos */}
                        {isExp && (
                          <div className="px-6 pb-4 pt-1 space-y-2 bg-[var(--color-surface-sunken)]/20 border-t border-[var(--color-border-subtle)]">
                            <div className="text-[10px] font-black uppercase text-[var(--color-text-faint)] tracking-wider">
                              Itens Comprados:
                            </div>
                            <div className="space-y-1">
                              {(v.itens || []).map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border-subtle)] last:border-0">
                                  <span className="text-[var(--color-text-muted)]">
                                    <strong className="text-[var(--color-text-primary)]">{it.quantidade}x</strong> {it.name}
                                  </span>
                                  <span className="font-mono text-[var(--color-text-primary)] font-bold">
                                    {formatPrice(it.subtotal || it.price * it.quantidade)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {v.desconto > 0 && (
                              <div className="flex justify-between text-xs text-emerald-500 font-bold pt-1">
                                <span>Desconto Concedido:</span>
                                <span className="font-mono">-{formatPrice(v.desconto)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* MODAL 1: CUPOM NÃO-FISCAL TÉRMICO (80mm) */}
      {receiptVenda && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm max-h-[95vh] overflow-y-auto shadow-2xl p-6 relative font-mono text-xs">
            <button
              onClick={() => setReceiptVenda(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-1.5 rounded-lg bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Layout Térmico 80mm */}
            <div id="thermal-receipt" className="space-y-3 print:p-0">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-sm font-black tracking-tight uppercase">AXIS VAREJO & COMÉRCIO</h2>
                <p className="text-[10px] text-slate-600 mt-0.5">CNPJ: 12.345.678/0001-90</p>
                <p className="text-[10px] text-slate-600">Av. Paulista, 1000 - Bela Vista - SP</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                  DOCUMENTO NÃO-FISCAL
                </p>
              </div>

              <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>PEDIDO: <strong>{receiptVenda.id}</strong></span>
                  <span>DATA: {new Date(receiptVenda.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>HORA: {new Date(receiptVenda.created_at).toLocaleTimeString("pt-BR")}</span>
                  <span>OP: {receiptVenda.operador || "Caixa 01"}</span>
                </div>
                <div>
                  CLIENTE: <strong>{receiptVenda.cliente_nome || "Consumidor Final"}</strong>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="border-b border-dashed border-slate-300 pb-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold border-b border-slate-200 pb-1">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>TOTAL</span>
                </div>
                {(receiptVenda.itens || []).map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[11px]">{it.name}</div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{it.quantidade} un x {formatPrice(it.price)}</span>
                      <span className="font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatPrice(receiptVenda.subtotal || receiptVenda.valor_total)}</span>
                </div>
                {receiptVenda.desconto > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>DESCONTO:</span>
                    <span>-{formatPrice(receiptVenda.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-slate-900 pt-1">
                  <span>TOTAL PAGO:</span>
                  <span>{formatPrice(receiptVenda.valor_total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700 pt-1">
                  <span>FORMA DE PAGAMENTO:</span>
                  <span className="font-bold uppercase">{receiptVenda.forma_pagamento}</span>
                </div>
                {receiptVenda.valor_recebido && (
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>VALOR RECEBIDO:</span>
                    <span>{formatPrice(receiptVenda.valor_recebido)}</span>
                  </div>
                )}
                {receiptVenda.troco && receiptVenda.troco > 0 && (
                  <div className="flex justify-between text-[10px] text-slate-700 font-bold">
                    <span>TROCO:</span>
                    <span>{formatPrice(receiptVenda.troco)}</span>
                  </div>
                )}
              </div>

              {/* Mensagem Rodapé */}
              <div className="text-center text-[10px] text-slate-600 pt-1 space-y-1">
                <p className="font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
                <p className="text-[9px]">Trocas somente em até 7 dias com este comprovante.</p>
                <div className="pt-2 flex justify-center">
                  <Barcode className="w-40 h-8 opacity-80" />
                </div>
              </div>
            </div>

            {/* Ações de Impressão */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex gap-2">
              <Button
                onClick={() => window.print()}
                className="flex-1 font-bold text-xs gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Cupom
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const msg = encodeURIComponent(`Olá! Segue comprovante da sua compra ${receiptVenda.id} no valor de ${formatPrice(receiptVenda.valor_total)}.`);
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
                className="font-bold text-xs gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OPERAÇÕES DE CAIXA (SANGRIA / SUPRIMENTO / FECHAMENTO) */}
      {modalCaixa && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-base font-black text-[var(--color-text-primary)] flex items-center gap-2">
                {modalCaixa === "sangria" && <ArrowUpRight className="w-4 h-4 text-amber-500" />}
                {modalCaixa === "suprimento" && <ArrowDownRight className="w-4 h-4 text-emerald-500" />}
                {modalCaixa === "fechamento" && <Lock className="w-4 h-4 text-red-500" />}
                {modalCaixa === "sangria"
                  ? "Registrar Sangria de Caixa"
                  : modalCaixa === "suprimento"
                  ? "Registrar Suprimento (Entrada)"
                  : "Fechamento de Caixa"}
              </h3>
              <button onClick={() => setModalCaixa(null)} className="p-1 rounded-lg hover:bg-[var(--color-surface)]">
                <X className="w-4 h-4 text-[var(--color-text-faint)]" />
              </button>
            </div>

            {modalCaixa === "fechamento" ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Confira o resumo das operações realizadas no turno atual antes de encerrar o caixa:
                </p>
                <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-default)] space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Faturamento Total do Dia:</span>
                    <strong className="text-emerald-500 font-mono">{formatPrice(faturamentoHoje)}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Total de Vendas:</span>
                    <strong className="font-mono">{vendasHoje.length} pedidos</strong>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Ticket Médio:</span>
                    <strong className="font-mono">{formatPrice(ticketMedioHoje)}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Operador Responsável:</span>
                    <strong>{user?.name || "Operador Caixa"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
                    Valor (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valorOperacaoCaixa}
                    onChange={(e) => setValorOperacaoCaixa(e.target.value)}
                    placeholder="0,00"
                    className="font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] block mb-1">
                    Motivo / Justificativa
                  </label>
                  <Input
                    value={motivoOperacaoCaixa}
                    onChange={(e) => setMotivoOperacaoCaixa(e.target.value)}
                    placeholder={
                      modalCaixa === "sangria"
                        ? "Ex: Depósito bancário, recolhimento de notas altas..."
                        : "Ex: Fundo de troco adicional, reforço de caixa..."
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalCaixa(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleExecutarOperacaoCaixa}
                className={`font-bold ${
                  modalCaixa === "fechamento"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {modalCaixa === "fechamento" ? "Confirmar Fechamento" : "Confirmar Operação"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
