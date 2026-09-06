import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Handshake, Plus, Search, Car, DollarSign,
  User, CheckCircle2, Clock, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface ConsignacaoItem {
  id: string;
  veiculo: string;
  consignante: string;
  telefone: string;
  valorPedido: number;
  comissaoAgencia: string;
  repasseCombinado: number;
  status: "No Pátio" | "Em Negociação" | "Vendido / Repasse Pendente" | "Repassado & Finalizado";
  data: string;
}

const DEFAULT_CONSIGNACOES: ConsignacaoItem[] = [
  { id: "1", veiculo: "Mercedes-Benz C200 AMG Line 2022", consignante: "Eduardo Prado", telefone: "(11) 98888-1122", valorPedido: 215000, comissaoAgencia: "6%", repasseCombinado: 202100, status: "No Pátio", data: "04/09/2026" },
  { id: "2", veiculo: "Audi Q3 Prestige Plus 2023", consignante: "Juliana Rocha", telefone: "(11) 97777-3344", valorPedido: 195000, comissaoAgencia: "5%", repasseCombinado: 185250, status: "Vendido / Repasse Pendente", data: "02/09/2026" },
  { id: "3", veiculo: "BMW 320i M Sport 2023", consignante: "Fábio Vasconcelos", telefone: "(11) 99111-2233", valorPedido: 260000, comissaoAgencia: "5%", repasseCombinado: 247000, status: "No Pátio", data: "31/08/2026" },
];

export default function ConsignacoesVeiculos() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_consignacoes_${activeTenantId || "default"}`;

  const [consignacoes, setConsignacoes] = useState<ConsignacaoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_CONSIGNACOES;
    } catch {
      return DEFAULT_CONSIGNACOES;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [veiculo, setVeiculo] = useState("");
  const [consignante, setConsignante] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorPedido, setValorPedido] = useState("");
  const [comissaoPercent, setComissaoPercent] = useState("5");
  const [status, setStatus] = useState<ConsignacaoItem["status"]>("No Pátio");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(consignacoes));
    } catch (e) {
      console.error(e);
    }
  }, [consignacoes, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculo.trim() || !consignante.trim()) {
      toast.error("Preencha o modelo do veículo e o nome do proprietário.");
      return;
    }

    const cleanMoney = (val: string) => {
      const s = val.trim().replace("R$", "").trim();
      if (s.includes(",") && s.includes(".")) {
        return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
      }
      if (s.includes(",")) return parseFloat(s.replace(",", ".")) || 0;
      return parseFloat(s.replace(/[^\d.]/g, "")) || 0;
    };
    const numPedido = cleanMoney(valorPedido);
    const pct = parseFloat(comissaoPercent.replace(",", ".")) || 5;
    const repasse = Math.round(numPedido * (1 - pct / 100));

    const newItem: ConsignacaoItem = {
      id: crypto.randomUUID(),
      veiculo: veiculo.trim(),
      consignante: consignante.trim(),
      telefone: telefone.trim(),
      valorPedido: numPedido,
      comissaoAgencia: `${pct}%`,
      repasseCombinado: repasse,
      status,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setConsignacoes(prev => [newItem, ...prev]);
    toast.success("Veículo consignado com sucesso!");
    setModalOpen(false);

    setVeiculo("");
    setConsignante("");
    setTelefone("");
    setValorPedido("");
  };

  const handleDelete = (id: string) => {
    setConsignacoes(prev => prev.filter(c => c.id !== id));
    toast.info("Consignação removida.");
  };

  const handleUpdateStatus = (id: string, newStatus: ConsignacaoItem["status"]) => {
    setConsignacoes(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast.success(`Status atualizado para: ${newStatus}`);
  };

  const filtered = consignacoes.filter(c => {
    const matchSearch = (
      c.veiculo.toLowerCase().includes(search.toLowerCase()) ||
      c.consignante.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalEstoque = consignacoes.reduce((s, c) => s + c.valorPedido, 0);

  return (
    <PageContainer
      title="Veículos em Consignação & Repasses"
      description="Contratos de consignação, comissão retida e cálculo automático de repasse ao proprietário."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Consignação
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Veículos Consignados</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{consignacoes.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Valor em Pátio (Consignado)</span>
          <div className="text-2xl font-black text-purple-500">
            R$ {(totalEstoque / 1e6).toFixed(2)}M
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Repasses Pendentes</span>
          <div className="text-2xl font-black text-amber-500">
            {consignacoes.filter(c => c.status === "Vendido / Repasse Pendente").length}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por veículo ou proprietário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "No Pátio", "Em Negociação", "Vendido / Repasse Pendente", "Repassado & Finalizado"].map(st => (
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
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.veiculo}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/25">
                  Comissão: {c.comissaoAgencia}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Data: {c.data}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Proprietário: <strong className="text-[var(--color-text-primary)]">{c.consignante}</strong> {c.telefone && `(${c.telefone})`} • Pedido: R$ {c.valorPedido.toLocaleString("pt-BR")} • Repasse Líquido: <span className="text-emerald-500 font-bold">R$ {c.repasseCombinado.toLocaleString("pt-BR")}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={c.status}
                onChange={e => handleUpdateStatus(c.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="No Pátio">No Pátio</option>
                <option value="Em Negociação">Em Negociação</option>
                <option value="Vendido / Repasse Pendente">Vendido / Repasse Pendente</option>
                <option value="Repassado & Finalizado">Repassado & Finalizado</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhuma consignação encontrada para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Nova Consignação */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Nova Consignação de Veículo</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Veículo / Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BMW X1 sDrive20i GP 2022"
                  value={veiculo}
                  onChange={e => setVeiculo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Proprietário Consignante</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={consignante}
                    onChange={e => setConsignante(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 90000-0000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Preço Pretendido (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 190.000"
                    value={valorPedido}
                    onChange={e => setValorPedido(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Comissão Loja (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={comissaoPercent}
                    onChange={e => setComissaoPercent(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Registrar Consignação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
