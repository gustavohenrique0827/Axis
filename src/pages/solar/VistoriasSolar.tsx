import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardCheck, Plus, Search, Calendar, MapPin,
  Camera, CheckCircle2, Clock, AlertTriangle, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

interface VistoriaSolarItem {
  id: string;
  cliente: string;
  telefone?: string;
  endereco: string;
  dataAgendada: string;
  responsavel: string;
  tipoTelhado: string;
  status: "Agendada" | "Em Andamento" | "Concluída / Aprovada" | "Reprovada / Ajuste Necessário";
}

const DEFAULT_VISTORIAS: VistoriaSolarItem[] = [
  { id: "1", cliente: "Fazenda Santa Maria", telefone: "(16) 99888-1122", endereco: "Rodovia Anhanguera, km 312", dataAgendada: "08/09/2026", responsavel: "Eng. Lucas Peixoto", tipoTelhado: "Metálico / Solo", status: "Agendada" },
  { id: "2", cliente: "Supermercado CompreBem", telefone: "(19) 98777-3344", endereco: "Av. Brasil, 4500", dataAgendada: "05/09/2026", responsavel: "Eng. Lucas Peixoto", tipoTelhado: "Fibrocimento", status: "Concluída / Aprovada" },
  { id: "3", cliente: "Residência Família Moreira", telefone: "(11) 97666-5544", endereco: "Rua das Acácias, 120", dataAgendada: "03/09/2026", responsavel: "Técnico Rafael Lima", tipoTelhado: "Cerâmico Colonial", status: "Concluída / Aprovada" },
];

export default function VistoriasSolar() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_vistorias_solar_${activeTenantId || "default"}`;

  const [vistorias, setVistorias] = useState<VistoriaSolarItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_VISTORIAS;
    } catch {
      return DEFAULT_VISTORIAS;
    }
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataAgendada, setDataAgendada] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [tipoTelhado, setTipoTelhado] = useState("Metálico");
  const [status, setStatus] = useState<VistoriaSolarItem["status"]>("Agendada");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(vistorias));
    } catch (e) {
      console.error(e);
    }
  }, [vistorias, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !endereco.trim()) {
      toast.error("Preencha o cliente e o endereço da vistoria.");
      return;
    }

    const newItem: VistoriaSolarItem = {
      id: crypto.randomUUID(),
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      dataAgendada: dataAgendada || new Date().toLocaleDateString("pt-BR"),
      responsavel: responsavel.trim() || "Engenheiro Técnico",
      tipoTelhado,
      status,
    };

    setVistorias(prev => [newItem, ...prev]);
    toast.success("Vistoria técnica agendada com sucesso!");
    setModalOpen(false);

    setCliente("");
    setTelefone("");
    setEndereco("");
    setDataAgendada("");
    setResponsavel("");
  };

  const handleDelete = (id: string) => {
    setVistorias(prev => prev.filter(v => v.id !== id));
    toast.info("Vistoria removida.");
  };

  const handleUpdateStatus = (id: string, newStatus: VistoriaSolarItem["status"]) => {
    setVistorias(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast.success(`Status da vistoria: ${newStatus}`);
  };

  const filtered = vistorias.filter(v => {
    const matchSearch = (
      v.cliente.toLowerCase().includes(search.toLowerCase()) ||
      v.endereco.toLowerCase().includes(search.toLowerCase()) ||
      v.responsavel.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = filterStatus === "Todos" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer
      title="Vistorias Técnicas de Engenharia"
      description="Checklist técnico de telhado, orientação solar, padrão de entrada e medições estruturais."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/agenda/calendario"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Agendar na Agenda
          </Link>
          <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Nova Vistoria
          </Button>
        </div>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Vistorias Totais</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{vistorias.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Aprovadas com Sucesso</span>
          <div className="text-2xl font-black text-emerald-500">
            {vistorias.filter(v => v.status.includes("Aprovada")).length}
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Agendadas na Semana</span>
          <div className="text-2xl font-black text-blue-500">
            {vistorias.filter(v => v.status === "Agendada").length}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por cliente, endereço ou engenheiro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["Todos", "Agendada", "Em Andamento", "Concluída / Aprovada", "Reprovada / Ajuste Necessário"].map(st => (
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
        {filtered.map(v => (
          <div key={v.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">{v.cliente}</span>
                {v.telefone && <span className="text-[10px] text-[var(--color-text-muted)]">({v.telefone})</span>}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]">
                  Telhado: {v.tipoTelhado}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Data: {v.dataAgendada}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Local: {v.endereco} • Engenheiro: <strong className="text-[var(--color-text-primary)]">{v.responsavel}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={v.status}
                onChange={e => handleUpdateStatus(v.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Agendada">Agendada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída / Aprovada">Concluída / Aprovada</option>
                <option value="Reprovada / Ajuste Necessário">Reprovada / Ajuste Necessário</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhuma vistoria encontrada para este filtro.
          </div>
        )}
      </div>

      {/* Modal de Nova Vistoria */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Agendar Vistoria Técnica</h3>
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
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Endereço da Instalação</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, número, bairro e cidade"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Tipo de Telhado / Solo</label>
                  <select
                    value={tipoTelhado}
                    onChange={e => setTipoTelhado(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="Metálico">Metálico Trapezoidal</option>
                    <option value="Cerâmico Colonial">Cerâmico Colonial</option>
                    <option value="Fibrocimento">Fibrocimento</option>
                    <option value="Laje de Concreto">Laje de Concreto</option>
                    <option value="Usinas em Solo">Usinas em Solo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Data Agendada</label>
                  <input
                    type="date"
                    value={dataAgendada}
                    onChange={e => setDataAgendada(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Engenheiro / Técnico Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do responsável técnico"
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                  Agendar Vistoria
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
