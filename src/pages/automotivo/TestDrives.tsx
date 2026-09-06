import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Calendar, Car, Clock, User, CheckCircle2,
  Plus, ArrowRight, Search, Trash2, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Modal } from "../../components/ui/modal";
import { useAuth } from "../../contexts/AuthContext";

interface TestDriveItem {
  id: string;
  cliente: string;
  telefone: string;
  carro: string;
  vendedor: string;
  data: string;
  hora: string;
  cnhValida: boolean;
  status: "Agendado" | "Confirmado" | "Em Rota / Realizando" | "Realizado / Proposta" | "Cancelado";
}

const DEFAULT_TEST_DRIVES: TestDriveItem[] = [
  { id: "1", cliente: "Dr. Marcelo Fonseca", telefone: "(11) 98765-4321", carro: "BMW 320i M Sport 2022", vendedor: "Ricardo Dias", data: "06/09/2026", hora: "15:00", cnhValida: true, status: "Confirmado" },
  { id: "2", cliente: "Camila Guimarães", telefone: "(11) 97654-3210", carro: "Toyota Corolla Altis 2.0 2024", vendedor: "Ricardo Dias", data: "07/09/2026", hora: "10:30", cnhValida: true, status: "Confirmado" },
  { id: "3", cliente: "Jorge Benício", telefone: "(11) 99112-8877", carro: "Jeep Compass Longitude 2023", vendedor: "Ana Paula", data: "05/09/2026", hora: "16:00", cnhValida: true, status: "Realizado / Proposta" },
];

export default function TestDrives() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_test_drives_${activeTenantId || "default"}`;

  const [testDrives, setTestDrives] = useState<TestDriveItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_TEST_DRIVES;
    } catch {
      return DEFAULT_TEST_DRIVES;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [carro, setCarro] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [cnhValida, setCnhValida] = useState(true);
  const [status, setStatus] = useState<TestDriveItem["status"]>("Agendado");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(testDrives));
    } catch (e) {
      console.error(e);
    }
  }, [testDrives, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !carro.trim()) {
      toast.error("Preencha o cliente e o modelo do veículo.");
      return;
    }

    const newItem: TestDriveItem = {
      id: crypto.randomUUID(),
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      carro: carro.trim(),
      vendedor: vendedor.trim() || "Consultor de Vendas",
      data: data || new Date().toLocaleDateString("pt-BR"),
      hora: hora || "14:00",
      cnhValida,
      status,
    };

    setTestDrives(prev => [newItem, ...prev]);
    toast.success("Test-drive agendado com sucesso!");
    setModalOpen(false);

    setCliente("");
    setTelefone("");
    setCarro("");
    setVendedor("");
    setData("");
    setHora("");
  };

  const handleDelete = (id: string) => {
    setTestDrives(prev => prev.filter(t => t.id !== id));
    toast.info("Test-drive removido.");
  };

  const handleUpdateStatus = (id: string, newStatus: TestDriveItem["status"]) => {
    setTestDrives(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Status do test-drive: ${newStatus}`);
  };

  const filtered = testDrives.filter(t => {
    const matchSearch = (
      t.cliente.toLowerCase().includes(search.toLowerCase()) ||
      t.carro.toLowerCase().includes(search.toLowerCase()) ||
      t.vendedor.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Test-Drives Agendados"
      description="Controle de experiência de condução com clientes, verificação de CNH e agendamentos integrados à Agenda."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/agenda/calendario"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Ver no Calendário Geral
          </Link>
          <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Test-Drive
          </Button>
        </div>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Total de Test-Drives</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{testDrives.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Confirmados Esta Semana</span>
          <div className="text-2xl font-black text-blue-500">
            {testDrives.filter(t => t.status === "Confirmado" || t.status === "Agendado").length}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Realizados com Sucesso</span>
          <div className="text-2xl font-black text-emerald-500">
            {testDrives.filter(t => t.status === "Realizado / Proposta").length}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por cliente, veículo ou vendedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Agendado", "Confirmado", "Em Rota / Realizando", "Realizado / Proposta", "Cancelado"].map(st => (
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
        {filtered.map(td => (
          <div key={td.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{td.cliente}</h4>
                {td.telefone && <span className="text-[10px] font-bold text-[var(--color-text-muted)]">({td.telefone})</span>}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  td.cnhValida
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}>
                  {td.cnhValida ? "CNH Verificada" : "Pendente CNH"}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-primary)] font-bold">
                Veículo: {td.carro}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Consultor Responsável: <strong className="text-[var(--color-text-primary)]">{td.vendedor}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold text-[var(--color-primary-blue)]">
                {td.data} às {td.hora}
              </span>

              <select
                value={td.status}
                onChange={e => handleUpdateStatus(td.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Em Rota / Realizando">Em Rota / Realizando</option>
                <option value="Realizado / Proposta">Realizado / Proposta</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(td.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhum test-drive encontrado para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Novo Test-Drive */}
      {/* Standardized Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Agendar Novo Test-Drive</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Cadastre o cliente, veículo e horário agendado</p>
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
              form="form-test-drive"
              className="h-9 px-4 text-xs font-semibold bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue)]/90 text-white"
            >
              Confirmar Agendamento
            </Button>
          </div>
        }
      >
        <form id="form-test-drive" onSubmit={handleCreate} className="space-y-3.5 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Nome do Cliente</label>
              <input
                type="text"
                required
                placeholder="Nome completo"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 90000-0000"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Veículo do Test-Drive</label>
            <input
              type="text"
              required
              placeholder="Ex: Jeep Commander Limited T270 2023"
              value={carro}
              onChange={e => setCarro(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Data</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Horário</label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1.5">Consultor Acompanhante</label>
            <input
              type="text"
              placeholder="Nome do consultor"
              value={vendedor}
              onChange={e => setVendedor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cnhCheck"
              checked={cnhValida}
              onChange={e => setCnhValida(e.target.checked)}
              className="rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
            />
            <label htmlFor="cnhCheck" className="text-xs text-[var(--color-text-primary)] cursor-pointer select-none">
              CNH física ou digital validada
            </label>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
