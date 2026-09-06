import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  TrendingUp, Plus, Search, Car, ArrowRightLeft,
  DollarSign, CheckCircle2, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface TrocaItem {
  id: string;
  cliente: string;
  telefone: string;
  veiculoEntrada: string;
  valorEntrada: number;
  veiculoSaida: string;
  valorSaida: number;
  diferenca: number;
  formaPagamento: string;
  status: "Em Análise de Crédito" | "Proposta Aceita" | "Contrato Assinado" | "Cancelado";
  data: string;
}

const DEFAULT_TROCAS: TrocaItem[] = [
  { id: "1", cliente: "Fábio Vasconcelos", telefone: "(11) 98888-2233", veiculoEntrada: "Ford Ka 1.0 SE 2019", valorEntrada: 42000, veiculoSaida: "Jeep Compass Longitude 2023", valorSaida: 152000, diferenca: 110000, formaPagamento: "Entrada + Financiamento Santander", status: "Em Análise de Crédito", data: "05/09/2026" },
  { id: "2", cliente: "Beatriz Nogueira", telefone: "(11) 97777-4455", veiculoEntrada: "Hyundai HB20 1.6 2020", valorEntrada: 58000, veiculoSaida: "Toyota Corolla Cross XRE 2022", valorSaida: 138000, diferenca: 80000, formaPagamento: "À Vista via Pix", status: "Proposta Aceita", data: "03/09/2026" },
];

export default function TrocasVeiculos() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_trocas_veiculos_${activeTenantId || "default"}`;

  const [trocas, setTrocas] = useState<TrocaItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_TROCAS;
    } catch {
      return DEFAULT_TROCAS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculoEntrada, setVeiculoEntrada] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [veiculoSaida, setVeiculoSaida] = useState("");
  const [valorSaida, setValorSaida] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Financiamento Bancário");
  const [status, setStatus] = useState<TrocaItem["status"]>("Em Análise de Crédito");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(trocas));
    } catch (e) {
      console.error(e);
    }
  }, [trocas, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !veiculoEntrada.trim() || !veiculoSaida.trim()) {
      toast.error("Preencha o cliente e os dois veículos envolvidos na troca.");
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
    const vEntrada = cleanMoney(valorEntrada);
    const vSaida = cleanMoney(valorSaida);
    const diff = Math.max(0, vSaida - vEntrada);

    const newItem: TrocaItem = {
      id: crypto.randomUUID(),
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      veiculoEntrada: veiculoEntrada.trim(),
      valorEntrada: vEntrada,
      veiculoSaida: veiculoSaida.trim(),
      valorSaida: vSaida,
      diferenca: diff,
      formaPagamento,
      status,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setTrocas(prev => [newItem, ...prev]);
    toast.success("Negociação de troca cadastrada com sucesso!");
    setModalOpen(false);

    setCliente("");
    setTelefone("");
    setVeiculoEntrada("");
    setValorEntrada("");
    setVeiculoSaida("");
    setValorSaida("");
  };

  const handleDelete = (id: string) => {
    setTrocas(prev => prev.filter(t => t.id !== id));
    toast.info("Troca removida.");
  };

  const handleUpdateStatus = (id: string, newStatus: TrocaItem["status"]) => {
    setTrocas(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Status da troca: ${newStatus}`);
  };

  const filtered = trocas.filter(t => {
    const matchSearch = (
      t.cliente.toLowerCase().includes(search.toLowerCase()) ||
      t.veiculoEntrada.toLowerCase().includes(search.toLowerCase()) ||
      t.veiculoSaida.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Negociações com Troca / Veículo na Entrada"
      description="Gerenciamento de negócios comerciais envolvendo veículo seminovo como parte do pagamento."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Negociação de Troca
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Total de Trocas em Andamento</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{trocas.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Diferença Financeira em Aberto</span>
          <div className="text-2xl font-black text-emerald-500">
            R$ {(trocas.reduce((s, t) => s + t.diferenca, 0) / 1000).toFixed(0)}k
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Captações via Troca</span>
          <div className="text-2xl font-black text-blue-500">{trocas.length} veículos</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por cliente ou veículo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Em Análise de Crédito", "Proposta Aceita", "Contrato Assinado", "Cancelado"].map(st => (
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
        {filtered.map(t => (
          <div key={t.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Cliente: {t.cliente}</h4>
                {t.telefone && <span className="text-[10px] text-[var(--color-text-muted)]">({t.telefone})</span>}
                <span className="text-[10px] text-[var(--color-text-muted)]">• {t.data}</span>
              </div>
              <div className="space-y-1 text-xs text-[var(--color-text-muted)]">
                <p>🚗 <strong>Entrada:</strong> {t.veiculoEntrada} (Avaliado em <strong className="text-[var(--color-text-primary)]">R$ {t.valorEntrada.toLocaleString("pt-BR")}</strong>)</p>
                <p>🚙 <strong>Desejado:</strong> {t.veiculoSaida} (Valor de Loja: <strong className="text-[var(--color-text-primary)]">R$ {t.valorSaida.toLocaleString("pt-BR")}</strong>)</p>
                <p>💵 <strong>Diferença a Cobrir:</strong> <span className="text-emerald-500 font-bold">R$ {t.diferenca.toLocaleString("pt-BR")}</span> ({t.formaPagamento})</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={t.status}
                onChange={e => handleUpdateStatus(t.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Em Análise de Crédito">Em Análise de Crédito</option>
                <option value="Proposta Aceita">Proposta Aceita</option>
                <option value="Contrato Assinado">Contrato Assinado</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhuma troca encontrada para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Nova Troca */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Nova Negociação com Troca</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do cliente"
                    value={cliente}
                    onChange={e => setCliente(e.target.value)}
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

              <div className="p-3 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Veículo de Entrada (Cliente)</span>
                <input
                  type="text"
                  required
                  placeholder="Modelo: ex. HB20 1.6 2019"
                  value={veiculoEntrada}
                  onChange={e => setVeiculoEntrada(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Valor de avaliação (R$): ex. 45.000"
                  value={valorEntrada}
                  onChange={e => setValorEntrada(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Veículo Pretendido (Loja)</span>
                <input
                  type="text"
                  required
                  placeholder="Modelo: ex. Compass Longitude 2022"
                  value={veiculoSaida}
                  onChange={e => setVeiculoSaida(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Preço de venda (R$): ex. 140.000"
                  value={valorSaida}
                  onChange={e => setValorSaida(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Forma de Pagamento da Diferença</label>
                <select
                  value={formaPagamento}
                  onChange={e => setFormaPagamento(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="Financiamento Bancário">Financiamento Bancário</option>
                  <option value="À Vista via Pix">À Vista via Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Consórcio Contemplado">Consórcio Contemplado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Registrar Troca
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
