import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Sun, Plus, Search, Zap, CheckCircle2, Clock,
  FileText, Columns3, MapPin, DollarSign, ArrowRight,
  Trash2, X, Download
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
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
  const { user, activeTenantId } = useAuth();
  const tenantId = activeTenantId || user?.tenant_id || "default";
  const storageKey = `spy_projetos_solar_${tenantId}`;

  const [projetos, setProjetos] = useState<ProjetoSolarItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_PROJETOS;
    } catch {
      return DEFAULT_PROPOSALS();
    }
  });

  function DEFAULT_PROPOSALS() {
    return DEFAULT_PROJETOS;
  }

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
    toast.success("Projeto solar registrado com sucesso!");
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

  const handleExportCSV = () => {
    if (projetos.length === 0) {
      toast.error("Nenhum projeto fotovoltaico para exportar.");
      return;
    }
    const headers = ["ID", "Cliente", "Telefone", "Potencia_kWp", "Geracao_kWh_Mes", "Valor_Contrato", "Cidade", "Concessionaria", "Status", "Data_Cadastro"];
    const rows = projetos.map(p => [
      p.id,
      `"${p.cliente.replace(/"/g, '""')}"`,
      p.telefone || "",
      p.potenciaKwp,
      p.geracaoMensalKwh,
      p.valorContrato,
      `"${p.cidade.replace(/"/g, '""')}"`,
      `"${p.concessionaria.replace(/"/g, '""')}"`,
      p.status,
      p.data,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `projetos_fotovoltaicos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório de projetos solares exportado com sucesso!");
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
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-elevated)]"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Exportar CSV
          </Button>
          <Link
            to="/app/crm/pipeline?nicho=solar"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Columns3 className="w-3.5 h-3.5 text-amber-500" /> Pipeline CRM
          </Link>
          <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-3.5 h-3.5" /> Novo Projeto
          </Button>
        </div>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Total de Projetos</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{projetos.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Capacidade Total</span>
          <div className="text-2xl font-black text-amber-500 font-mono">
            {projetos.reduce((s, p) => s + p.potenciaKwp, 0).toFixed(1)} kWp
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Geração Mensal Estimada</span>
          <div className="text-2xl font-black text-blue-500 font-mono">
            {projetos.reduce((s, p) => s + p.geracaoMensalKwh, 0).toLocaleString("pt-BR")} kWh
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)] shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">VGV em Contratos</span>
          <div className="text-2xl font-black text-emerald-500 font-mono">
            R$ {projetos.reduce((s, p) => s + p.valorContrato, 0).toLocaleString("pt-BR")}
          </div>
        </Card>
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
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Dimensionamento", "Vistoria Concluída", "Instalação", "Homologação", "Conectado à Rede"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                filterStatus === st
                  ? "bg-amber-500 text-white"
                  : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{p.cliente}</h4>
                <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" /> {p.cidade}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">• {p.concessionaria}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                <span>Potência: <strong className="text-amber-500 font-bold">{p.potenciaKwp} kWp</strong></span>
                <span>•</span>
                <span>Geração: <strong className="text-blue-500 font-bold">{p.geracaoMensalKwh.toLocaleString("pt-BR")} kWh/mês</strong></span>
                <span>•</span>
                <span>Contrato: <strong className="text-emerald-500 font-bold">R$ {p.valorContrato.toLocaleString("pt-BR")}</strong></span>
                <span>•</span>
                <span>Payback est.: <strong className="text-[var(--color-text-primary)]">~3,2 anos</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={p.status}
                onChange={e => handleUpdateStatus(p.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
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

      {/* Standardized Modal: Novo Projeto */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Novo Projeto Fotovoltaico</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Cadastre uma nova usina solar para dimensionamento e instalação</p>
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
              form="form-projeto-solar"
              className="h-9 px-4 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              Registrar Projeto
            </Button>
          </div>
        }
      >
        <form id="form-projeto-solar" onSubmit={handleCreate} className="space-y-3.5 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Cliente / Razão Social</label>
              <input
                type="text"
                required
                placeholder="Nome do cliente"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Telefone</label>
              <input
                type="text"
                placeholder="(11) 90000-0000"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Potência (kWp)</label>
              <input
                type="text"
                placeholder="Ex: 15.5"
                value={potenciaKwp}
                onChange={e => setPotenciaKwp(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Geração (kWh/mês)</label>
              <input
                type="text"
                placeholder="Ex: 1950"
                value={geracaoKwh}
                onChange={e => setGeracaoKwh(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Valor Contrato (R$)</label>
              <input
                type="text"
                placeholder="Ex: 62000"
                value={valorContrato}
                onChange={e => setValorContrato(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Cidade / Estado</label>
              <input
                type="text"
                placeholder="Ex: Santos - SP"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Concessionária de Energia</label>
            <select
              value={concessionaria}
              onChange={e => setConcessionaria(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500"
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
        </form>
      </Modal>
    </PageContainer>
  );
}
