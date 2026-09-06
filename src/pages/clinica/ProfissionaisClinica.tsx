import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Stethoscope, Plus, Search, Calendar, Phone,
  Mail, Award, CheckCircle2, Clock, Trash2, X
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProfissionalItem {
  id: string;
  nome: string;
  crm: string;
  especialidade: string;
  telefone?: string;
  email?: string;
  diasAtendimento: string;
  consultasMes: number;
  status: "Ativo" | "Férias / Licença" | "Inativo";
}

const DEFAULT_DOUTORES: ProfissionalItem[] = [
  { id: "1", nome: "Dra. Beatriz Albuquerque", crm: "CRM/SP 142.890", especialidade: "Dermatologia & Estética", telefone: "(11) 99111-2233", email: "dra.beatriz@clinica.com", diasAtendimento: "Seg, Qua, Sex", consultasMes: 54, status: "Ativo" },
  { id: "2", nome: "Dr. Rodrigo Silveira", crm: "CRM/SP 128.450", especialidade: "Cardiologia & Clínica Geral", telefone: "(11) 98222-3344", email: "dr.rodrigo@clinica.com", diasAtendimento: "Ter, Qui", consultasMes: 42, status: "Ativo" },
  { id: "3", nome: "Dra. Mariana Castro", crm: "CRM/SP 165.220", especialidade: "Ortopedia & Traumatologia", telefone: "(11) 97333-4455", email: "dra.mariana@clinica.com", diasAtendimento: "Seg a Sex", consultasMes: 68, status: "Ativo" },
];

export default function ProfissionaisClinica() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_profissionais_clinica_${activeTenantId || "default"}`;

  const [doutores, setDoutores] = useState<ProfissionalItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_DOUTORES;
    } catch {
      return DEFAULT_DOUTORES;
    }
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [crm, setCrm] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [diasAtendimento, setDiasAtendimento] = useState("Seg a Sex");
  const [status, setStatus] = useState<ProfissionalItem["status"]>("Ativo");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(doutores));
    } catch (e) {
      console.error(e);
    }
  }, [doutores, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !crm.trim()) {
      toast.error("Informe o nome e o registro profissional (CRM/CRO).");
      return;
    }

    const newItem: ProfissionalItem = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      crm: crm.trim(),
      especialidade: especialidade.trim() || "Clínica Geral",
      telefone: telefone.trim(),
      email: email.trim(),
      diasAtendimento: diasAtendimento.trim() || "Seg a Sex",
      consultasMes: 0,
      status,
    };

    setDoutores(prev => [newItem, ...prev]);
    toast.success("Profissional cadastrado com sucesso!");
    setModalOpen(false);

    setNome("");
    setCrm("");
    setEspecialidade("");
    setTelefone("");
    setEmail("");
  };

  const handleDelete = (id: string) => {
    setDoutores(prev => prev.filter(d => d.id !== id));
    toast.info("Profissional removido.");
  };

  const handleUpdateStatus = (id: string, newStatus: ProfissionalItem["status"]) => {
    setDoutores(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    toast.success(`Status de atendimento atualizado: ${newStatus}`);
  };

  const filtered = doutores.filter(d => (
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.crm.toLowerCase().includes(search.toLowerCase()) ||
    d.especialidade.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <PageContainer
      title="Corpo Clínico & Especialistas"
      description="Cadastro de médicos, número de registro profissional (CRM/CRO/CRP) e agenda de consultas."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/clinicas/agenda"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Ver Agenda Médica
          </Link>
          <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Profissional
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Médicos Cadastrados</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{doutores.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Consultas Realizadas no Mês</span>
          <div className="text-2xl font-black text-emerald-500">{doutores.reduce((s, d) => s + d.consultasMes, 0)}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Especialidades Atendidas</span>
          <div className="text-2xl font-black text-[var(--color-primary-blue)]">
            {new Set(doutores.map(d => d.especialidade)).size}
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por médico, CRM ou especialidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{d.nome}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-primary-blue)] font-bold">
                  {d.crm}
                </span>
                {d.telefone && <span className="text-[10px] text-[var(--color-text-muted)]">({d.telefone})</span>}
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Especialidade: <strong className="text-[var(--color-text-primary)]">{d.especialidade}</strong> • Dias: {d.diasAtendimento} • Consultas no mês: {d.consultasMes}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <select
                value={d.status}
                onChange={e => handleUpdateStatus(d.id, e.target.value as any)}
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Férias / Licença">Férias / Licença</option>
                <option value="Inativo">Inativo</option>
              </select>

              <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-xl">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl">
            Nenhum profissional encontrado.
          </div>
        )}
      </div>

      {/* Modal de Novo Profissional */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Cadastrar Novo Profissional Clínico</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Fernandes"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Registro (CRM / CRO)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: CRM/SP 199.300"
                    value={crm}
                    onChange={e => setCrm(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Especialidade</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cardiologia"
                    value={especialidade}
                    onChange={e => setEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="medico@clinica.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Dias de Atendimento</label>
                <input
                  type="text"
                  placeholder="Ex: Seg, Ter, Qui"
                  value={diasAtendimento}
                  onChange={e => setDiasAtendimento(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Cadastrar Médico
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
