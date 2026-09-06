import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Stethoscope, Plus, Search, DollarSign, Clock,
  CheckCircle2, Tag, Trash2, X
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";

interface ServicoClinicoItem {
  id: string;
  nome: string;
  especialidade: string;
  duracao: string;
  valorParticular: number;
  convenios: string;
  status: "Ativo" | "Inativo";
}

const DEFAULT_SERVICOS: ServicoClinicoItem[] = [
  { id: "1", nome: "Consulta Dermatológica Especializada", especialidade: "Dermatologia", duracao: "45 min", valorParticular: 350, convenios: "Amil, Bradesco, SulAmérica", status: "Ativo" },
  { id: "2", nome: "Eletrocardiograma (ECG) com Laudo", especialidade: "Cardiologia", duracao: "30 min", valorParticular: 180, convenios: "Todos os credenciados", status: "Ativo" },
  { id: "3", nome: "Procedimento Estético Facial (Bioestimulador)", especialidade: "Estética Avançada", duracao: "60 min", valorParticular: 1600, convenios: "Apenas Particular", status: "Ativo" },
  { id: "4", nome: "Consulta Ortopédica + Avaliação Postural", especialidade: "Ortopedia", duracao: "40 min", valorParticular: 320, convenios: "Amil, Unimed, Porto Seguro", status: "Ativo" },
];

export default function ServicosClinica() {
  const { activeTenantId } = useAuth();
  const storageKey = `spy_servicos_clinica_${activeTenantId || "default"}`;

  const [servicos, setServicos] = useState<ServicoClinicoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_SERVICOS;
    } catch {
      return DEFAULT_SERVICOS;
    }
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [duracao, setDuracao] = useState("30 min");
  const [valorParticular, setValorParticular] = useState("");
  const [convenios, setConvenios] = useState("Amil, Bradesco, Particular");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(servicos));
    } catch (e) {
      console.error(e);
    }
  }, [servicos, storageKey]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome do procedimento.");
      return;
    }

    const val = parseFloat(valorParticular.replace(/[^\d.]/g, "").replace(",", ".")) || 0;

    const newItem: ServicoClinicoItem = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      especialidade: especialidade.trim() || "Geral",
      duracao: duracao.trim() || "30 min",
      valorParticular: val,
      convenios: convenios.trim() || "Apenas Particular",
      status: "Ativo",
    };

    setServicos(prev => [newItem, ...prev]);
    toast.success("Procedimento cadastrado com sucesso!");
    setModalOpen(false);

    setNome("");
    setEspecialidade("");
    setValorParticular("");
  };

  const handleDelete = (id: string) => {
    setServicos(prev => prev.filter(s => s.id !== id));
    toast.info("Procedimento removido.");
  };

  const filtered = servicos.filter(s => (
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.especialidade.toLowerCase().includes(search.toLowerCase()) ||
    s.convenios.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <PageContainer
      title="Tabela de Procedimentos & Serviços"
      description="Cadastro de consultas, exames, procedimentos cirúrgicos e valores particulares/convênio."
      actions={
        <Button onClick={() => setModalOpen(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Procedimento
        </Button>
      }
    >
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por procedimento ou especialidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Procedimento / Serviço</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Aceite de Convênio</th>
                <th className="px-4 py-3 text-right">Valor Particular</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[var(--color-text-primary)]">{s.nome}</td>
                  <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{s.especialidade}</td>
                  <td className="px-4 py-3.5 font-mono text-[var(--color-text-muted)]">{s.duracao}</td>
                  <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">{s.convenios}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-500">
                    R$ {s.valorParticular.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
              Nenhum procedimento encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Procedimento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Novo Procedimento / Exame</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Nome do Procedimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta Cardiológica + Teste Ergométrico"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Especialidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Cardiologia"
                    value={especialidade}
                    onChange={e => setEspecialidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Duração Média</label>
                  <input
                    type="text"
                    placeholder="Ex: 40 min"
                    value={duracao}
                    onChange={e => setDuracao(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Valor Particular (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 350.00"
                    value={valorParticular}
                    onChange={e => setValorParticular(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Convênios Aceitos</label>
                  <input
                    type="text"
                    placeholder="Ex: Amil, Bradesco, Unimed"
                    value={convenios}
                    onChange={e => setConvenios(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-bold rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-bold rounded-xl bg-[var(--color-primary-blue)] text-white">
                  Salvar Procedimento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
