import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Sun, Plus, Search, Zap, CheckCircle2, Clock,
  FileText, Columns3, MapPin, DollarSign, ArrowRight,
  Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface ProjetoSolarItem {
  id: string;
  cliente: string;
  telefone?: string;
  potenciaKwp: number;
  geracaoMensalKwh: number;
  valorContrato: number;
  cidade: string;
  concessionaria: string;
  status: "Dimensionamento" | "Vistoria Concluída" | "Instalação" | "Homologação" | "Conectado à Rede";
  data: string;
}

const DEFAULT_PROJETOS: ProjetoSolarItem[] = [
  { id: "1", cliente: "Fazenda Santa Maria", telefone: "(16) 99888-1122", potenciaKwp: 45.8, geracaoMensalKwh: 5800, valorContrato: 185000, cidade: "Ribeirão Preto - SP", status: "Instalação", concessionaria: "CPFL Paulista", data: "05/09/2026" },
  { id: "2", cliente: "Supermercado CompreBem", telefone: "(19) 98777-3344", potenciaKwp: 112.5, geracaoMensalKwh: 14500, valorContrato: 440000, cidade: "Campinas - SP", status: "Homologação", concessionaria: "CPFL Paulista", data: "02/09/2026" },
  { id: "3", cliente: "Residência Família Moreira", telefone: "(11) 97666-5544", potenciaKwp: 8.4, geracaoMensalKwh: 1100, valorContrato: 38000, cidade: "São Paulo - SP", status: "Vistoria Concluída", concessionaria: "Enel SP", data: "30/08/2026" },
  { id: "4", cliente: "Galpão Logístico Alpha", telefone: "(15) 99112-9988", potenciaKwp: 75.0, geracaoMensalKwh: 9800, valorContrato: 295000, cidade: "Sorocaba - SP", status: "Dimensionamento", concessionaria: "CPFL Piratininga", data: "28/08/2026" },
];

export default function ProjetosSolar() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_projetos_solar_${activeTenantId || "default"}`;

  const [projetos, setProjetos] = useState<ProjetoSolarItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_PROJETOS;
    } catch {
      return DEFAULT_PROJETOS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [potenciaKwp, setPotenciaKwp] = useState("");
  const [geracaoKwh, setGeracaoKwh] = useState("");
  const [valorContrato, setValorContrato] = useState("");
  const [cidade, setCidade] = useState("");
  const [concessionaria, setConcessionaria] = useState("CPFL Paulista");
  const [status, setStatus] = useState<ProjetoSolarItem["status"]>("Dimensionamento");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(projetos));
    } catch (e) {
      console.error(e);
    }
  }, [projetos, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }

    const kwp = parseFloat(potenciaKwp.replace(/[^\d.]/g, "")) || 5.0;
    const kwh = parseFloat(geracaoKwh.replace(/[^\d.]/g, "")) || Math.round(kwp * 125);
    const val = parseFloat(valorContrato.replace(/[^\d]/g, "")) || Math.round(kwp * 3800);

    const newItem: ProjetoSolarItem = {
      id: crypto.randomUUID(),
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      potenciaKwp: kwp,
      geracaoMensalKwh: kwh,
      valorContrato: val,
      cidade: cidade.trim() || "São Paulo - SP",
      concessionaria,
      status,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setProjetos(prev => [newItem, ...prev]);
    toast.success("Projeto solar cadastrado com sucesso!");
    setModalOpen(false);

    setCliente("");
    setTelefone("");
    setPotenciaKwp("");
    setGeracaoKwh("");
    setValorContrato("");
    setCidade("");
  };

  const handleDelete = (id: string) => {
    setProjetos(prev => prev.filter(p => p.id !== id));
    toast.info("Projeto removido.");
  };

  const handleUpdateStatus = (id: string, newStatus: ProjetoSolarItem["status"]) => {
    setProjetos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    toast.success(`Status do projeto: ${newStatus}`);
  };

  const filtered = projetos.filter(p => {
    const matchSearch = (
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.cidade.toLowerCase().includes(search.toLowerCase()) ||
      p.concessionaria.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Projetos Fotovoltaicos"
      description="Gerenciamento de usinas solares, potência kWp, geração estimada e status de implantação."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/crm/pipeline?nicho=solar"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Columns3 className="w-3.5 h-3.5 text-amber-500" /> Ver Pipeline CRM
          </Link>
          <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Projeto
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Sun, label: "Projetos em Curso", val: projetos.length, color: "text-amber-500" },
          { icon: Zap, label: "Potência Total", val: `${projetos.reduce((s, p) => s + p.potenciaKwp, 0).toFixed(1)} kWp`, color: "text-blue-500" },
          { icon: DollarSign, label: "Volume Contratado", val: `R$ ${(projetos.reduce((s, p) => s + p.valorContrato, 0) / 1000).toFixed(0)}k`, color: "text-emerald-500" },
          { icon: CheckCircle2, label: "Geração Mensal Est.", val: `${(projetos.reduce((s, p) => s + p.geracaoMensalKwh, 0) / 1000).toFixed(1)} MWh`, color: "text-purple-500" },
        ].map((k, i) => (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-xl font-black text-[var(--color-text-primary)]">{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por cliente, cidade ou concessionária..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Dimensionamento", "Vistoria Concluída", "Instalação", "Homologação", "Conectado à Rede"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                filterStatus === st
                  ? "bg-amber-500 text-white font-bold"
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
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{p.cliente}</h4>
                {p.telefone && <span className="text-[10px] text-[var(--color-text-muted)]">({p.telefone})</span>}
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {p.potenciaKwp} kWp
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Data: {p.data}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Local: <strong className="text-[var(--color-text-primary)]">{p.cidade}</strong> • Rede: {p.concessionaria} • Geração: ~{p.geracaoMensalKwh} kWh/mês
              </p>
              <p className="text-[11px] text-emerald-500 font-bold mt-0.5">
                Valor do Contrato: R$ {p.valorContrato.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={p.status}
                onChange={e => handleUpdateStatus(p.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Dimensionamento">Dimensionamento</option>
                <option value="Vistoria Concluída">Vistoria Concluída</option>
                <option value="Instalação">Instalação</option>
                <option value="Homologação">Homologação</option>
                <option value="Conectado à Rede">Conectado à Rede</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhum projeto encontrado para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Novo Projeto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Novo Projeto Fotovoltaico</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Cliente / Razão Social</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Potência (kWp)</label>
                  <input
                    type="text"
                    placeholder="Ex: 15.5"
                    value={potenciaKwp}
                    onChange={e => setPotenciaKwp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Geração (kWh/mês)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1950"
                    value={geracaoKwh}
                    onChange={e => setGeracaoKwh(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Valor Contrato (R$)</label>
                  <input
                    type="text"
                    placeholder="Ex: 62.000"
                    value={valorContrato}
                    onChange={e => setValorContrato(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    placeholder="Ex: Santos - SP"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Concessionária de Energia</label>
                <select
                  value={concessionaria}
                  onChange={e => setConcessionaria(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="CPFL Paulista">CPFL Paulista</option>
                  <option value="CPFL Piratininga">CPFL Piratininga</option>
                  <option value="Enel SP">Enel SP</option>
                  <option value="Enel RJ">Enel RJ</option>
                  <option value="CEMIG">CEMIG</option>
                  <option value="Neoenergia Elektro">Neoenergia Elektro</option>
                  <option value="Light">Light</option>
                  <option value="Copel">Copel</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                  Registrar Projeto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
