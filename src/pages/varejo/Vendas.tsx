import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, Link2, Copy, History, ChevronDown, ChevronUp, TrendingUp, Receipt } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { EmptyState } from "../../components/ui/empty-state";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface VendaHistorico {
  id: string;
  cliente_nome: string | null;
  forma_pagamento: string | null;
  status: string;
  valor_total: number;
  created_at: string;
}

interface VendaItemRow {
  id: string;
  product_name: string | null;
  quantidade: number;
  preco_unitario: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantidade: number;
  estoqueDisponivel: number;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VarejoVendas() {
  const { products } = useData();
  const { activeTenantId } = useAuth();
  const [tab, setTab] = useState<"pdv" | "historico">("pdv");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clienteNome, setClienteNome] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [finalizando, setFinalizando] = useState(false);

  const [historico, setHistorico] = useState<VendaHistorico[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [expandedVenda, setExpandedVenda] = useState<string | null>(null);
  const [itensPorVenda, setItensPorVenda] = useState<Record<string, VendaItemRow[]>>({});

  const fetchHistorico = () => {
    if (!supabase) { setLoadingHistorico(false); return; }
    setLoadingHistorico(true);
    supabase.from("vendas").select("id, cliente_nome, forma_pagamento, status, valor_total, created_at")
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (!error) setHistorico(data || []);
        setLoadingHistorico(false);
      });
  };

  useEffect(() => { if (tab === "historico") fetchHistorico(); }, [tab]);

  const toggleExpandVenda = async (vendaId: string) => {
    if (expandedVenda === vendaId) { setExpandedVenda(null); return; }
    setExpandedVenda(vendaId);
    if (!itensPorVenda[vendaId] && supabase) {
      const { data } = await supabase.from("venda_items").select("id, product_name, quantidade, preco_unitario").eq("venda_id", vendaId);
      setItensPorVenda(prev => ({ ...prev, [vendaId]: data || [] }));
    }
  };

  const hojeStr = new Date().toISOString().split("T")[0];
  const vendasHoje = historico.filter(v => v.status === "paga" && v.created_at.startsWith(hojeStr));
  const faturamentoHoje = vendasHoje.reduce((s, v) => s + Number(v.valor_total), 0);
  const ticketMedioHoje = vendasHoje.length > 0 ? faturamentoHoje / vendasHoje.length : 0;

  const produtosDisponiveis = useMemo(() => {
    const ativos = products.filter((p: any) => p.active !== false);
    if (!search.trim()) return ativos;
    const q = search.toLowerCase();
    return ativos.filter((p: any) => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, search]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantidade, 0);

  const catalogUrl = activeTenantId ? `${window.location.origin}/catalogo/${activeTenantId}` : "";

  const addToCart = (product: any) => {
    const estoque = product.currentStock ?? 0;
    if (estoque <= 0) { toast.error("Produto sem estoque disponível."); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantidade + 1 > estoque) { toast.error("Quantidade acima do estoque disponível."); return prev; }
        return prev.map((i) => i.productId === product.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price) || 0, quantidade: 1, estoqueDisponivel: estoque }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) => prev
      .map((i) => {
        if (i.productId !== productId) return i;
        const nextQty = i.quantidade + delta;
        if (nextQty > i.estoqueDisponivel) { toast.error("Quantidade acima do estoque disponível."); return i; }
        return { ...i, quantidade: nextQty };
      })
      .filter((i) => i.quantidade > 0)
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId));

  const handleFinalizarVenda = async () => {
    if (!supabase) { toast.error("Conexão com o banco indisponível."); return; }
    if (cart.length === 0) { toast.error("Adicione ao menos um produto ao carrinho."); return; }
    if (!activeTenantId) { toast.error("Nenhuma empresa ativa selecionada."); return; }

    setFinalizando(true);
    try {
      const { data: venda, error: vendaError } = await supabase
        .from("vendas")
        .insert({ tenant_id: activeTenantId, cliente_nome: clienteNome || null, forma_pagamento: formaPagamento, status: "aberta" })
        .select().single();
      if (vendaError || !venda) throw new Error(vendaError?.message || "Erro ao criar a venda.");

      const items = cart.map((i) => ({
        tenant_id: activeTenantId, venda_id: venda.id, product_id: i.productId,
        product_name: i.name, quantidade: i.quantidade, preco_unitario: i.price,
      }));
      const { error: itemsError } = await supabase.from("venda_items").insert(items);
      if (itemsError) throw new Error(itemsError.message);

      const { data: resultado, error: rpcError } = await supabase.rpc("finalizar_venda", { p_venda_id: venda.id });
      if (rpcError) throw new Error(rpcError.message);

      toast.success(`Venda finalizada! Total: ${formatPrice(Number(resultado?.valor_total) || total)} — estoque e financeiro atualizados.`);
      setCart([]);
      setClienteNome("");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao finalizar a venda.");
    } finally {
      setFinalizando(false);
    }
  };

  const handleCopyCatalogLink = async () => {
    if (!catalogUrl) return;
    try {
      await navigator.clipboard.writeText(catalogUrl);
      toast.success("Link do catálogo copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
            Ponto de Venda <ShoppingCart className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Monte o carrinho e finalize a venda — o estoque é baixado e o valor lançado no financeiro automaticamente.
          </p>
        </div>
        {catalogUrl && (
          <Button variant="outline" size="sm" onClick={handleCopyCatalogLink} className="gap-1.5 text-xs font-bold shrink-0">
            <Link2 className="w-3.5 h-3.5" /> Copiar link do catálogo público <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl p-1 gap-1 w-fit">
        <button onClick={() => setTab("pdv")} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${tab === "pdv" ? "bg-[var(--color-primary-blue)] text-white" : "text-[var(--color-text-faint)] hover:text-[var(--color-text-primary)]"}`}>
          <ShoppingCart className="w-3.5 h-3.5" /> PDV
        </button>
        <button onClick={() => setTab("historico")} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${tab === "historico" ? "bg-[var(--color-primary-blue)] text-white" : "text-[var(--color-text-faint)] hover:text-[var(--color-text-primary)]"}`}>
          <History className="w-3.5 h-3.5" /> Histórico de Vendas
        </button>
      </div>

      {tab === "historico" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Vendas Hoje</span>
                <ShoppingCart className="w-4 h-4 text-[var(--color-primary-blue)]" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">{vendasHoje.length}</div>
            </Card>
            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Faturamento Hoje</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">{formatPrice(faturamentoHoje)}</div>
            </Card>
            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Ticket Médio Hoje</span>
                <Receipt className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black font-mono text-[var(--color-text-primary)]">{formatPrice(ticketMedioHoje)}</div>
            </Card>
          </div>

          {loadingHistorico ? (
            <p className="text-xs text-[var(--color-text-faint)] text-center py-10">Carregando histórico...</p>
          ) : historico.length === 0 ? (
            <EmptyState icon={History} title="Nenhuma venda registrada" description="As vendas finalizadas no PDV aparecerão aqui." className="py-12" />
          ) : (
            <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden">
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {historico.map((v) => (
                  <div key={v.id}>
                    <button onClick={() => toggleExpandVenda(v.id)} className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-[var(--color-surface-sunken)]/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">{v.cliente_nome || "Cliente não identificado"}</p>
                        <p className="text-[10px] text-[var(--color-text-faint)]">{new Date(v.created_at).toLocaleString("pt-BR")} · {v.forma_pagamento || "—"}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${v.status === "paga" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : v.status === "cancelada" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{v.status}</span>
                      <span className="text-sm font-black text-[var(--color-text-primary)] font-mono shrink-0">{formatPrice(Number(v.valor_total))}</span>
                      {expandedVenda === v.id ? <ChevronUp className="w-4 h-4 text-[var(--color-text-faint)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--color-text-faint)] shrink-0" />}
                    </button>
                    {expandedVenda === v.id && (
                      <div className="px-3.5 pb-3.5 space-y-1.5 bg-[var(--color-surface-sunken)]/30">
                        {(itensPorVenda[v.id] || []).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-[11px] pl-2">
                            <span className="text-[var(--color-text-muted)]">{item.quantidade}x {item.product_name}</span>
                            <span className="font-mono text-[var(--color-text-primary)]">{formatPrice(item.quantidade * Number(item.preco_unitario))}</span>
                          </div>
                        ))}
                        {!itensPorVenda[v.id] && <p className="text-[11px] text-[var(--color-text-faint)] pl-2">Carregando itens...</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "pdv" && (
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto por nome ou SKU..." className="pl-9" />
          </div>

          {produtosDisponiveis.length === 0 ? (
            <EmptyState icon={Package} title="Nenhum produto encontrado" description="Cadastre produtos em Operativo → Produtos para vendê-los aqui." className="py-12" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {produtosDisponiveis.map((p: any) => (
                <Card key={p.id} className="p-4 space-y-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-[var(--color-text-primary)] leading-snug">{p.name}</span>
                    <span className="text-[10px] font-mono text-[var(--color-text-faint)] shrink-0">{p.sku}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[var(--color-text-primary)]">{formatPrice(Number(p.price) || 0)}</span>
                    <span className={`text-[10px] font-bold ${(p.currentStock ?? 0) > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {(p.currentStock ?? 0) > 0 ? `${p.currentStock} em estoque` : "Sem estoque"}
                    </span>
                  </div>
                  <Button size="sm" className="w-full text-xs font-bold gap-1.5" disabled={(p.currentStock ?? 0) <= 0} onClick={() => addToCart(p)}>
                    <Plus className="w-3.5 h-3.5" /> Adicionar ao carrinho
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] h-fit sticky top-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Carrinho ({cart.length})
          </h3>

          {cart.length === 0 ? (
            <p className="text-xs text-[var(--color-text-faint)] text-center py-6">Nenhum item no carrinho.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-2 text-xs bg-[var(--color-surface-sunken)] p-2.5 rounded-[var(--radius-control)]">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--color-text-primary)] truncate">{item.name}</p>
                    <p className="text-[var(--color-text-faint)]">{formatPrice(item.price)} un.</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => changeQty(item.productId, -1)} className="p-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center font-bold">{item.quantidade}</span>
                    <button onClick={() => changeQty(item.productId, 1)} className="p-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1 rounded text-red-500 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 pt-3 border-t border-[var(--color-border-subtle)]">
            <Input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente (opcional)" className="text-xs" />
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]">
              <option value="Dinheiro">Dinheiro</option>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
            <div className="flex items-center justify-between text-sm font-black text-[var(--color-text-primary)] pt-1">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
            <Button onClick={handleFinalizarVenda} loading={finalizando} disabled={cart.length === 0} className="w-full font-bold text-xs h-10">
              Finalizar Venda
            </Button>
          </div>
        </Card>
      </div>
      )}
    </div>
  );
}
