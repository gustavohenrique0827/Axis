import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  FileText, Plus, Search, DollarSign, Calendar,
  CheckCircle2, Clock, User, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface PlanoTratamentoItem {
  id: string;
  paciente: string;
  telefone?: string;
  profissional: string;
  descricao: string;
  totalSessoes: number;
  sessoesFeitas: number;
  valorTotal: number;
  status: "Em Elaboração" | "Aprovado / Iniciado" | "Em Execução" | "Concluído" | "Cancelado";
  data: string;
}

const DEFAULT_PLANOS: PlanoTratamentoItem[] = [
  { id: "1", paciente: "Mariana Souza", telefone: "(11) 98888-3344", profissional: "Dra. Beatriz Albuquerque", descricao: "Protocolo Rejuvenescimento Facial (3 sessões)", totalSessoes: 3, sessoesFeitas: 1, valorTotal: 4200, status: "Em Execução", data: "01/09/2026" },
  { id: "2", paciente: "Carlos Alberto Mendes", telefone: "(11) 97777-2211", profissional: "Dr. Rodrigo Silveira", descricao: "Reabilitação Cardiovascular & Monitoramento Holter", totalSessoes: 6, sessoesFeitas: 4, valorTotal: 2800, status: "Em Execução", data: "28/08/2026" },
  { id: "3", paciente: "Fernanda Ribeiro", telefone: "(11) 99111-5566", profissional: "Dra. Mariana Castro", descricao: "Tratamento de Coluna com Fisioterapia Integrada (10 sessões)", totalSessoes: 10, sessoesFeitas: 10, valorTotal: 3500, status: "Concluído", data: "15/08/2026" },
];

export default function PlanosTratamento() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_planos_tratamento_${activeTenantId || "default"}`;

  const [planos, setPlanos] = useState<PlanoTratamentoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_PLANOS;
    } catch {
      return DEFAULT_PLANOS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [paciente, setPaciente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissional, setProfissional] = useState("");
  const [descricao, setDescricao] = useState("");
  const [totalSessoes, setTotalSessoes] = useState("4");
  const [valorTotal, setValorTotal] = useState("");
  const [status, setStatus] = useState<PlanoTratamentoItem["status"]>("Aprovado / Iniciado");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(planos));
    } catch (e) {
      console.error(e);
    }
  }, [planos, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente.trim() || !descricao.trim()) {
      toast.error("Preencha o paciente e a descrição do tratamento.");
      return;
    }

    const val = parseFloat(valorTotal.replace(/[^\d.]/g, "").replace(",", ".")) || 0;
    const numSessoes = parseInt(totalSessoes, 10) || 1;

    const newItem: PlanoTratamentoItem = {
      id: crypto.randomUUID(),
      paciente: paciente.trim(),
      telefone: telefone.trim(),
      profissional: profissional.trim() || "Especialista Responsável",
      descricao: descricao.trim(),
      totalSessoes: numSessoes,
      sessoesFeitas: 0,
      valorTotal: val,
      status,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setPlanos(prev => [newItem, ...prev]);
    toast.success("Plano de tratamento cadastrado!");
    setModalOpen(false);

    setPaciente("");
    setTelefone("");
    setProfissional("");
    setDescricao("");
    setValorTotal("");
  };

  const handleDelete = (id: string) => {
    setPlanos(prev => prev.filter(p => p.id !== id));
    toast.info("Plano removido.");
  };

  const handleAvancarSessao = (id: string) => {
    setPlanos(prev => prev.map(p => {
      if (p.id === id) {
        const next = Math.min(p.totalSessoes, p.sessoesFeitas + 1);
        const nextStatus = next === p.totalSessoes ? "Concluído" : "Em Execução";
        return { ...p, sessoesFeitas: next, status: nextStatus };
      }
      return p;
    }));
    toast.success("Sessão realizada registrada!");
  };

  const handleUpdateStatus = (id: string, newStatus: PlanoTratamentoItem["status"]) => {
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    toast.success(`Status atualizado: ${newStatus}`);
  };

  const filtered = planos.filter(p => {
    const matchSearch = (
      p.paciente.toLowerCase().includes(search.toLowerCase()) ||
      p.descricao.toLowerCase().includes(search.toLowerCase()) ||
      p.profissional.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalEmTratamento = planos.filter(p => p.status !== "Cancelado").reduce((s, p) => s + p.valorTotal, 0);

  return (
    <PageContainer
      title="Planos de Tratamento & Orçamentos"
      description="Orçamentos clínicos integrados, etapas de tratamento e faturamento de procedimentos seriados."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Plano de Tratamento
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Planos Ativos</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{planos.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Volume Orçado</span>
          <div className="text-2xl font-black text-emerald-500">
            R$ {totalEmTratamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Tratamentos Concluídos</span>
          <div className="text-2xl font-black text-blue-500">
            {planos.filter(p => p.status === "Concluído").length}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por paciente, descrição ou médico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Aprovado / Iniciado", "Em Execução", "Concluído", "Cancelado"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                filterStatus === st
                  ? "bg-[var(--color-primary-blue)] text-white font-bold"
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
        {filtered.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Paciente: {p.paciente}</h4>
                {p.telefone && <span className="text-[10px] text-[var(--color-text-muted)]">({p.telefone})</span>}
                <span className="text-[10px] text-[var(--color-text-muted)]">• {p.data}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Plano: <strong className="text-[var(--color-text-primary)]">{p.descricao}</strong> • Médico: {p.profissional}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                  Sessões: {p.sessoesFeitas} de {p.totalSessoes} concluídas
                </span>
                <div className="w-24 h-2 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(p.sessoesFeitas / p.totalSessoes) * 100}%` }} />
                </div>
                {p.sessoesFeitas < p.totalSessoes && p.status !== "Cancelado" && (
                  <Button size="sm" variant="ghost" onClick={() => handleAvancarSessao(p.id)} className="h-6 text-[10px] font-bold px-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                    + Registrar Sessão Feita
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <span className="text-sm font-black text-emerald-500">
                R$ {p.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>

              <select
                value={p.status}
                onChange={e => handleUpdateStatus(p.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Aprovado / Iniciado">Iniciado</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhum plano de tratamento encontrado para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Novo Plano */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Novo Plano de Tratamento</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Paciente</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do paciente"
                    value={paciente}
                    onChange={e => setPaciente(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 90000-0000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Descrição do Tratamento</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Harmonização Orofacial com Toxina e Ácido Hialurônico"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Médico Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do médico ou especialista"
                  value={profissional}
                  onChange={e => setProfissional(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Total de Sessões</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={totalSessoes}
                    onChange={e => setTotalSessoes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Valor Total (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 3.500"
                    value={valorTotal}
                    onChange={e => setValorTotal(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Registrar Plano
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
