import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Building2, Plus, Search, MapPin, DollarSign,
  TrendingUp, CheckCircle2, ArrowRight, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface EmpreendimentoItem {
  id: string;
  nome: string;
  construtora: string;
  cidade: string;
  totalUnidades: number;
  unidadesDisponiveis: number;
  vgvTotal: number;
  status: "Lançamento" | "Em Obras" | "Pronto para Morar" | "100% Vendido";
  entrega: string;
}

const DEFAULT_EMPREENDIMENTOS: EmpreendimentoItem[] = [
  { id: "1", nome: "Residencial Terraço Jardins", construtora: "G-Tech Incorporações", cidade: "São Paulo - SP", totalUnidades: 80, unidadesDisponiveis: 18, vgvTotal: 96000000, status: "Em Obras", entrega: "Nov/2027" },
  { id: "2", nome: "Infinity Tower Corporate", construtora: "Axis Real Estate", cidade: "São Paulo - SP", totalUnidades: 45, unidadesDisponiveis: 12, vgvTotal: 135000000, status: "Lançamento", entrega: "Mar/2028" },
  { id: "3", nome: "Parque das Palmeiras Villa", construtora: "Prime Urbanismo", cidade: "Campinas - SP", totalUnidades: 120, unidadesDisponiveis: 34, vgvTotal: 72000000, status: "Pronto para Morar", entrega: "Entregue" },
];

export default function Empreendimentos() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_empreendimentos_${activeTenantId || "default"}`;

  const [empreendimentos, setEmpreendimentos] = useState<EmpreendimentoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_EMPREENDIMENTOS;
    } catch {
      return DEFAULT_EMPREENDIMENTOS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [construtora, setConstrutora] = useState("");
  const [cidade, setCidade] = useState("");
  const [totalUnidades, setTotalUnidades] = useState("50");
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState("50");
  const [vgvTotal, setVgvTotal] = useState("");
  const [status, setStatus] = useState<EmpreendimentoItem["status"]>("Lançamento");
  const [entrega, setEntrega] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(empreendimentos));
    } catch (e) {
      console.error(e);
    }
  }, [empreendimentos, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome do empreendimento.");
      return;
    }

    const numTot = parseInt(totalUnidades, 10) || 1;
    const numDisp = parseInt(unidadesDisponiveis, 10) || numTot;
    const numVgv = parseFloat(vgvTotal.replace(/[^\d]/g, "")) || 0;

    const newItem: EmpreendimentoItem = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      construtora: construtora.trim() || "Incorporadora Interna",
      cidade: cidade.trim() || "São Paulo - SP",
      totalUnidades: numTot,
      unidadesDisponiveis: numDisp,
      vgvTotal: numVgv,
      status,
      entrega: entrega.trim() || "A definir",
    };

    setEmpreendimentos(prev => [newItem, ...prev]);
    toast.success("Empreendimento cadastrado com sucesso!");
    setModalOpen(false);

    setNome("");
    setConstrutora("");
    setCidade("");
    setVgvTotal("");
    setEntrega("");
  };

  const handleDelete = (id: string) => {
    setEmpreendimentos(prev => prev.filter(e => e.id !== id));
    toast.info("Empreendimento removido.");
  };

  const filtered = empreendimentos.filter(e => {
    const matchSearch = (
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.cidade.toLowerCase().includes(search.toLowerCase()) ||
      e.construtora.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const vgvTotalGeral = empreendimentos.reduce((s, e) => s + e.vgvTotal, 0);
  const unidadesTotalDisp = empreendimentos.reduce((s, e) => s + e.unidadesDisponiveis, 0);

  return (
    <PageContainer
      title="Empreendimentos & Lançamentos"
      description="Gerenciamento de torres, condomínios fechados, espelho de vendas e tabelas de construtoras."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Empreendimento
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Empreendimentos Ativos</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{empreendimentos.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">VGV Total Gerenciado</span>
          <div className="text-2xl font-black text-amber-500">
            R$ {(vgvTotalGeral / 1e6).toFixed(1)}M
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Unidades Disponíveis</span>
          <div className="text-2xl font-black text-emerald-500">
            {unidadesTotalDisp} unidades
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou construtora..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Lançamento", "Em Obras", "Pronto para Morar", "100% Vendido"].map(st => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/50 transition-all flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {emp.status}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{emp.entrega}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(emp.id)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-0.5">{emp.nome}</h4>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mb-4">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {emp.cidade} • {emp.construtora}
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Unidades Restantes:</span>
                  <strong className="text-[var(--color-text-primary)]">{emp.unidadesDisponiveis} de {emp.totalUnidades}</strong>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((emp.totalUnidades - emp.unidadesDisponiveis) / emp.totalUnidades) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--color-text-muted)]">VGV Estimado:</span>
                  <strong className="text-amber-500">R$ {(emp.vgvTotal / 1e6).toFixed(1)}M</strong>
                </div>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={() => toast.success(`Espelho de vendas do ${emp.nome} aberto.`)} className="w-full h-8 text-xs font-bold gap-1 rounded-xl">
              Ver Espelho de Vendas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhum empreendimento encontrado para este filtro.
          </div>
        )}
      </div>

      {/* Standardized Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Novo Empreendimento</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Cadastre lançamentos imobiliários e controle de VGV</p>
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
              form="form-empreendimento"
              className="h-9 px-4 text-xs font-semibold bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue)]/90 text-white"
            >
              Cadastrar Empreendimento
            </Button>
          </div>
        }
      >
        <form id="form-empreendimento" onSubmit={handleCreate} className="space-y-3.5 py-1">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Nome do Empreendimento</label>
            <input
              type="text"
              required
              placeholder="Ex: Reserva Imperial Towers"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Construtora</label>
              <input
                type="text"
                placeholder="Nome da incorporadora"
                value={construtora}
                onChange={e => setConstrutora(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Cidade - UF</label>
              <input
                type="text"
                placeholder="Ex: São Paulo - SP"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Total de Unidades</label>
              <input
                type="number"
                min="1"
                value={totalUnidades}
                onChange={e => setTotalUnidades(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Unidades Disponíveis</label>
              <input
                type="number"
                min="0"
                value={unidadesDisponiveis}
                onChange={e => setUnidadesDisponiveis(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">VGV Total (R$)</label>
              <input
                type="text"
                placeholder="Ex: 85.000.000"
                value={vgvTotal}
                onChange={e => setVgvTotal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Previsão de Entrega</label>
              <input
                type="text"
                placeholder="Ex: Dez/2027"
                value={entrega}
                onChange={e => setEntrega(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Fase da Obra</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
            >
              <option value="Lançamento">Lançamento</option>
              <option value="Em Obras">Em Obras</option>
              <option value="Pronto para Morar">Pronto para Morar</option>
              <option value="100% Vendido">100% Vendido</option>
            </select>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
