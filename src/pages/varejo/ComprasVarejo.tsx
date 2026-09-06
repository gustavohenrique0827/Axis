import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardList, Plus, Search, Truck, DollarSign,
  CheckCircle2, Clock, Package, Trash2, X, Boxes, ArrowDownCircle
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";

interface CompraItem {
  id: string;
  fornecedor: string;
  valor: number;
  itens: string;
  data: string;
  previsaoEntrega: string;
  status: "Emitida / Aguardando Fornecedor" | "Faturada" | "Em Transporte" | "Recebido no Estoque" | "Cancelada";
}

const DEFAULT_COMPRAS: CompraItem[] = [
  { id: "PC-102", fornecedor: "Distribuidora Tech Brasil", valor: 14800, itens: "120 cabos USB-C, 50 carregadores", data: "03/09/2026", previsaoEntrega: "08/09/2026", status: "Em Transporte" },
  { id: "PC-101", fornecedor: "Global Imports Eletrônicos", valor: 8900, itens: "30 smartwatches, 40 fones bluetooth", data: "28/08/2026", previsaoEntrega: "02/09/2026", status: "Recebido no Estoque" },
  { id: "PC-103", fornecedor: "Atacadista Master Varejo", valor: 5400, itens: "500 caixas packaging, 20 bobinas térmicas", data: "05/09/2026", previsaoEntrega: "10/09/2026", status: "Emitida / Aguardando Fornecedor" },
];

export default function ComprasVarejo() {
  const { user, activeTenantId } = useAuth();
  const tenantId = activeTenantId || user?.tenant_id || "default";
  const storageKey = `spy_compras_varejo_${tenantId}`;
  const { products, setProducts } = useData();

  const [compras, setCompras] = useState<CompraItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_COMPRAS;
    } catch {
      return DEFAULT_COMPRAS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state para Nova Ordem
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [itens, setItens] = useState("");
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");
  const [status, setStatus] = useState<CompraItem["status"]>("Emitida / Aguardando Fornecedor");

  // Estado para Dar Entrada no Estoque
  const [modalRecebimentoOpen, setModalRecebimentoOpen] = useState(false);
  const [compraRecebimento, setCompraRecebimento] = useState<CompraItem | null>(null);
  const [recebimentoProductId, setRecebimentoProductId] = useState<string>("");
  const [recebimentoQtd, setRecebimentoQtd] = useState<string>("50");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(compras));
    } catch (e) {
      console.error(e);
    }
  }, [compras, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedor.trim() || !itens.trim()) {
      toast.error("Preencha o fornecedor e a lista de itens.");
      return;
    }

    const numVal = parseFloat(valor.replace(/[^\d.]/g, "").replace(",", ".")) || 0;
    const count = compras.length + 104;

    const newItem: CompraItem = {
      id: `PC-${count}`,
      fornecedor: fornecedor.trim(),
      valor: numVal,
      itens: itens.trim(),
      data: new Date().toLocaleDateString("pt-BR"),
      previsaoEntrega: previsaoEntrega || "A combinar",
      status,
    };

    setCompras(prev => [newItem, ...prev]);
    toast.success("Ordem de compra emitida!");
    setModalOpen(false);

    setFornecedor("");
    setValor("");
    setItens("");
    setPrevisaoEntrega("");
  };

  const handleDelete = (id: string) => {
    setCompras(prev => prev.filter(c => c.id !== id));
    toast.info("Ordem de compra cancelada.");
  };

  const handleUpdateStatus = (id: string, newStatus: CompraItem["status"]) => {
    setCompras(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast.success(`Status da ordem: ${newStatus}`);
  };

  const handleAbrirRecebimento = (c: CompraItem) => {
    setCompraRecebimento(c);
    setRecebimentoProductId(products[0]?.id || "");
    setRecebimentoQtd("50");
    setModalRecebimentoOpen(true);
  };

  const handleConfirmarRecebimento = () => {
    if (!compraRecebimento) return;
    const qtdNum = parseInt(recebimentoQtd, 10) || 0;
    if (qtdNum <= 0) {
      toast.error("Informe uma quantidade válida para entrada.");
      return;
    }

    // 1. Atualizar produto no estoque se selecionado
    if (recebimentoProductId && products && products.length > 0) {
      const updatedList = products.map((p: any) => {
        if (p.id === recebimentoProductId) {
          return { ...p, currentStock: (p.currentStock ?? 0) + qtdNum };
        }
        return p;
      });
      setProducts(updatedList);
      try {
        localStorage.setItem(`spy_products_${tenantId}`, JSON.stringify(updatedList));
      } catch {}
    }

    // 2. Registrar movimentação no histórico de estoque
    try {
      const movStorageKey = `spy_estoque_mov_${tenantId}`;
      const savedMov = localStorage.getItem(movStorageKey);
      const movList = savedMov ? JSON.parse(savedMov) : [];
      const novaMov = {
        id: `mov-${Math.floor(1000 + Math.random() * 9000)}`,
        product_id: recebimentoProductId || "diversos",
        tipo: "entrada",
        quantidade: qtdNum,
        motivo: `Recebimento Ordem ${compraRecebimento.id} - ${compraRecebimento.fornecedor}`,
        created_at: new Date().toISOString(),
        operador: user?.name || "Gestor de Compras",
      };
      localStorage.setItem(movStorageKey, JSON.stringify([novaMov, ...movList]));
    } catch {}

    // 3. Atualizar status da ordem para "Recebido no Estoque"
    setCompras(prev => prev.map(c => c.id === compraRecebimento.id ? { ...c, status: "Recebido no Estoque" } : c));

    toast.success(`Entrada de +${qtdNum} un. confirmada no estoque com sucesso!`);
    setModalRecebimentoOpen(false);
  };

  const filtered = compras.filter(c => {
    const matchSearch = (
      c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      c.itens.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Ordens de Compra & Reposição"
      description="Emissão de pedidos a fornecedores, entrada de mercadorias e alimentação do saldo em estoque."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue)]/90 text-white">
          <Plus className="w-3.5 h-3.5" /> Nova Ordem de Compra
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Ordens de Compra</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{compras.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Total em Reposição</span>
          <div className="text-2xl font-black text-emerald-500 font-mono">
            R$ {compras.reduce((s, c) => s + (Number(c.valor) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Cargas em Trânsito</span>
          <div className="text-2xl font-black text-blue-500">
            {compras.filter(c => c.status === "Em Transporte").length}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por fornecedor, itens ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Emitida / Aguardando Fornecedor", "Faturada", "Em Transporte", "Recebido no Estoque"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                filterStatus === st
                  ? "bg-[var(--color-primary-blue)] text-white"
                  : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-primary-blue)] border border-[var(--color-border-subtle)]">
                  {c.id}
                </span>
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.fornecedor}</h4>
                <span className="text-[10px] text-[var(--color-text-muted)]">• Emitido em: {c.data}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Itens: <strong className="text-[var(--color-text-primary)]">{c.itens}</strong> • Previsão: {c.previsaoEntrega} • Total: <strong className="text-emerald-500 font-bold font-mono">R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {c.status !== "Recebido no Estoque" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAbrirRecebimento(c)}
                  className="h-8 px-2.5 text-[11px] font-semibold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl"
                >
                  <Boxes className="w-3.5 h-3.5" /> Dar Entrada
                </Button>
              )}

              <select
                value={c.status}
                onChange={e => handleUpdateStatus(c.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Emitida / Aguardando Fornecedor">Emitida</option>
                <option value="Faturada">Faturada</option>
                <option value="Em Transporte">Em Transporte</option>
                <option value="Recebido no Estoque">Recebido no Estoque</option>
                <option value="Cancelada">Cancelada</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhuma ordem de compra encontrada para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Entrada no Estoque */}
      {compraRecebimento && (
        <Modal
          isOpen={modalRecebimentoOpen}
          onClose={() => setModalRecebimentoOpen(false)}
          maxWidth="max-w-md"
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Dar Entrada no Estoque</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Ordem: {compraRecebimento.id} • {compraRecebimento.fornecedor}</p>
              </div>
            </div>
          }
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalRecebimentoOpen(false)}
                className="h-9 px-4 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarRecebimento}
                className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirmar Recebimento
              </Button>
            </div>
          }
        >
          <div className="space-y-3.5 py-1">
            <div className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/70 border border-[var(--color-border-subtle)] text-xs">
              <span className="font-semibold text-[var(--color-text-primary)] block mb-1">Itens Descritos na Ordem:</span>
              <p className="text-[var(--color-text-muted)] font-mono">{compraRecebimento.itens}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">
                Vincular Entrada ao Produto (Opcional):
              </label>
              <select
                value={recebimentoProductId}
                onChange={e => setRecebimentoProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              >
                <option value="">Entrada Geral / Não Vincular a SKU Específico</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Saldo atual: {p.currentStock ?? 0} un.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">
                Quantidade Total Recebida (Unidades):
              </label>
              <input
                type="number"
                min={1}
                value={recebimentoQtd}
                onChange={e => setRecebimentoQtd(e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Standardized Modal: Nova Ordem */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Nova Ordem de Compra</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Solicite reposição de itens e insumos para seu estoque</p>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="form-compras"
              className="h-9 px-4 text-xs font-semibold bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue)]/90 text-white"
            >
              Emitir Ordem
            </Button>
          </div>
        }
      >
        <form id="form-compras" onSubmit={handleCreate} className="space-y-3.5 py-1">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Fornecedor / Distribuidora</label>
            <input
              type="text"
              required
              placeholder="Nome do fornecedor"
              value={fornecedor}
              onChange={e => setFornecedor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Itens & Quantidades</label>
            <textarea
              rows={2}
              required
              placeholder="Ex: 50x Fone Bluetooth Pro, 100x Cabo Tipo-C"
              value={itens}
              onChange={e => setItens(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Valor Total (R$)</label>
              <input
                type="text"
                required
                placeholder="Ex: 7500.00"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Previsão de Entrega</label>
              <input
                type="date"
                value={previsaoEntrega}
                onChange={e => setPrevisaoEntrega(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
