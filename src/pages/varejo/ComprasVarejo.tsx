import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardList, Plus, Search, Truck, DollarSign,
  CheckCircle2, Clock, Package, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

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
  { id: "PC-102", fornecedor: "Distribuidora Tech Brasil", valor: 14800, itens: "120 cabos, 50 carregadores", data: "03/09/2026", previsaoEntrega: "08/09/2026", status: "Em Transporte" },
  { id: "PC-101", fornecedor: "Global Imports Eletrônicos", valor: 8900, itens: "30 smartwatches, 40 fones bluetooth", data: "28/08/2026", previsaoEntrega: "02/09/2026", status: "Recebido no Estoque" },
  { id: "PC-103", fornecedor: "Atacadista Master Varejo", valor: 5400, itens: "500 caixas packaging, 20 bobinas térmicas", data: "05/09/2026", previsaoEntrega: "10/09/2026", status: "Emitida / Aguardando Fornecedor" },
];

export default function ComprasVarejo() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_compras_varejo_${activeTenantId || "default"}`;

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

  // Form state
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [itens, setItens] = useState("");
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");
  const [status, setStatus] = useState<CompraItem["status"]>("Emitida / Aguardando Fornecedor");

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

    const numVal = parseFloat(valor.replace(/[^\d]/g, "")) || 0;
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
      description="Emissão de pedidos a fornecedores, entrada de notas fiscais e alimentação automática de estoque."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Ordem de Compra
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Ordens de Compra</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{compras.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Total em Reposição</span>
          <div className="text-2xl font-black text-emerald-500">
            R$ {compras.reduce((s, c) => s + c.valor, 0).toLocaleString("pt-BR")}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
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
                Itens: <strong className="text-[var(--color-text-primary)]">{c.itens}</strong> • Previsão: {c.previsaoEntrega} • Total: <strong className="text-emerald-500 font-bold">R$ {c.valor.toLocaleString("pt-BR")}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={c.status}
                onChange={e => handleUpdateStatus(c.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
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

      {/* Modal de Nova Ordem */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Nova Ordem de Compra</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Fornecedor / Distribuidora</label>
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
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Itens & Quantidades</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: 50x Fone Bluetooth Pro, 100x Cabo Tipo-C"
                  value={itens}
                  onChange={e => setItens(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Valor Total (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7.500"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Previsão de Entrega</label>
                  <input
                    type="date"
                    value={previsaoEntrega}
                    onChange={e => setPrevisaoEntrega(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Emitir Ordem
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
