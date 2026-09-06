import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { confirmDialog } from "../../components/ui/confirm-dialog";
import { useData } from "../../contexts/DataContext";
import { downloadCsv } from "../../lib/csvExport";
import {
  Plus, X, Trash2, Download, Handshake, CheckCircle2, Clock, XCircle, DollarSign,
} from "lucide-react";

const DEFAULT_COMMISSION_KEY = "indicacao_comissao_padrao";

const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const STATUS_FLOW: Record<string, string> = {
  Pendente: "Aprovada",
  Aprovada: "Paga",
  Paga: "Pendente",
  Cancelada: "Pendente",
};

function statusStyle(status: string) {
  switch (status) {
    case "Paga": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "Aprovada": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    case "Cancelada": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "Paga": return <CheckCircle2 className="w-3 h-3 mr-1" />;
    case "Cancelada": return <XCircle className="w-3 h-3 mr-1" />;
    default: return <Clock className="w-3 h-3 mr-1" />;
  }
}

export default function Indicacoes() {
  const {
    indicacoes, addIndicacao, updateIndicacao, deleteIndicacao,
    colaboradores, clienteBase, appSettings, saveAppSetting,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referrerType, setReferrerType] = useState<"colaborador" | "cliente">("colaborador");
  const [referrerId, setReferrerId] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredContact, setReferredContact] = useState("");
  const [commissionValue, setCommissionValue] = useState("");
  const [notes, setNotes] = useState("");

  const defaultCommission = Number(appSettings?.[DEFAULT_COMMISSION_KEY] ?? 0);
  const [editingDefault, setEditingDefault] = useState(false);
  const [defaultDraft, setDefaultDraft] = useState(String(defaultCommission || ""));

  const kpis = useMemo(() => {
    const total = indicacoes.length;
    const pendentes = indicacoes.filter(i => i.status === "Pendente" || i.status === "Aprovada").length;
    const totalPago = indicacoes.filter(i => i.status === "Paga").reduce((acc, i) => acc + Number(i.commission_value || 0), 0);
    const totalPendente = indicacoes.filter(i => i.status === "Pendente" || i.status === "Aprovada").reduce((acc, i) => acc + Number(i.commission_value || 0), 0);
    return { total, pendentes, totalPago, totalPendente };
  }, [indicacoes]);

  const referrerOptions = referrerType === "colaborador" ? colaboradores : clienteBase;

  const resetForm = () => {
    setReferrerType("colaborador");
    setReferrerId("");
    setReferredName("");
    setReferredContact("");
    setCommissionValue(String(defaultCommission || ""));
    setNotes("");
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSaveDefault = async () => {
    const v = parseFloat(defaultDraft.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Informe um valor válido."); return; }
    await saveAppSetting(DEFAULT_COMMISSION_KEY, v);
    toast.success("Valor padrão de comissão por indicação atualizado.");
    setEditingDefault(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerId) { toast.error("Selecione quem fez a indicação."); return; }
    if (!referredName.trim()) { toast.error("Informe o nome do cliente indicado."); return; }
    const value = parseFloat(commissionValue.replace(",", "."));
    if (isNaN(value) || value < 0) { toast.error("Informe um valor de comissão válido."); return; }

    const referrer = referrerOptions.find((r: any) => r.id === referrerId);
    const referrerName = referrerType === "colaborador" ? referrer?.nome : referrer?.name;
    if (!referrerName) { toast.error("Indicador inválido."); return; }

    addIndicacao({
      referrer_type: referrerType,
      referrer_colaborador_id: referrerType === "colaborador" ? referrerId : null,
      referrer_cliente_id: referrerType === "cliente" ? referrerId : null,
      referrer_name: referrerName,
      referred_name: referredName.trim(),
      referred_contact: referredContact.trim() || null,
      commission_value: value,
      status: "Pendente",
      date_indicated: new Date().toISOString().split("T")[0],
      notes: notes.trim() || null,
    });

    toast.success("Indicação registrada!");
    setIsModalOpen(false);
  };

  const handleCycleStatus = (item: (typeof indicacoes)[number]) => {
    const next = STATUS_FLOW[item.status] || "Pendente";
    const updates: any = { status: next };
    if (next === "Paga") updates.date_paid = new Date().toISOString().split("T")[0];
    updateIndicacao(item.id, updates);
    toast.success(`Indicação marcada como ${next}.`);
  };

  const handleDelete = async (item: (typeof indicacoes)[number]) => {
    if (!(await confirmDialog({
      title: "Excluir indicação",
      description: `Excluir a indicação de "${item.referred_name}"? Essa ação não pode ser desfeita.`,
    }))) return;
    deleteIndicacao(item.id);
    toast.success("Indicação excluída.");
  };

  const handleExport = () => {
    downloadCsv(
      `indicacoes_${Date.now()}.csv`,
      ["Indicador", "Tipo", "Cliente Indicado", "Contato", "Comissão", "Status", "Data"],
      indicacoes.map(i => [
        i.referrer_name,
        i.referrer_type === "colaborador" ? "Colaborador" : "Cliente",
        i.referred_name,
        i.referred_contact || "-",
        i.commission_value,
        i.status,
        i.date_indicated,
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[var(--color-primary-blue)]" /> Indicações
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Colaboradores e clientes que indicam novos clientes ganham um valor de comissão por indicação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openModal} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Nova Indicação
          </Button>
          <Button variant="outline" onClick={handleExport} className="h-9 px-4 text-xs font-bold gap-1.5 border-[var(--color-border-default)]">
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Total de Indicações</p>
          <p className="text-xl font-black text-[var(--color-text-primary)]">{kpis.total}</p>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Em Aberto</p>
          <p className="text-xl font-black text-amber-500">{kpis.pendentes}</p>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Comissão Paga</p>
          <p className="text-xl font-black text-emerald-500">{currency(kpis.totalPago)}</p>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Comissão a Pagar</p>
          <p className="text-xl font-black text-[var(--color-text-primary)]">{currency(kpis.totalPendente)}</p>
        </Card>
      </div>

      <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <DollarSign className="w-4 h-4 text-[var(--color-primary-blue)]" />
          Valor padrão de comissão por indicação:
          {!editingDefault && <span className="font-bold text-[var(--color-text-primary)]">{currency(defaultCommission)}</span>}
        </div>
        {editingDefault ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              autoFocus
              value={defaultDraft}
              onChange={(e) => setDefaultDraft(e.target.value)}
              className="w-32 bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            <Button onClick={handleSaveDefault} className="h-8 px-3 text-xs font-bold">Salvar</Button>
            <Button variant="outline" onClick={() => setEditingDefault(false)} className="h-8 px-3 text-xs font-bold border-[var(--color-border-default)]">Cancelar</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => { setDefaultDraft(String(defaultCommission || "")); setEditingDefault(true); }}
            className="h-8 px-3 text-xs font-bold border-[var(--color-border-default)]"
          >
            Editar valor padrão
          </Button>
        )}
      </Card>

      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left hidden md:table">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-6 py-3.5">Indicador</th>
                <th className="px-6 py-3.5">Cliente Indicado</th>
                <th className="px-6 py-3.5">Data</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Comissão</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {indicacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Nenhuma indicação registrada ainda.
                  </td>
                </tr>
              ) : (
                indicacoes.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--color-text-primary)]">{item.referrer_name}</p>
                      <p className="text-[10px] text-[var(--color-text-faint)] uppercase font-semibold">
                        {item.referrer_type === "colaborador" ? "Colaborador" : "Cliente"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--color-text-primary)] font-semibold">{item.referred_name}</p>
                      {item.referred_contact && <p className="text-[10px] text-[var(--color-text-faint)]">{item.referred_contact}</p>}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">
                      {item.date_indicated ? new Date(item.date_indicated + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(item)}
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${statusStyle(item.status)}`}
                        title="Clique para avançar o status"
                      >
                        {statusIcon(item.status)}
                        {item.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[var(--color-text-primary)]">
                      {currency(Number(item.commission_value))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Excluir indicação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {indicacoes.length === 0 ? (
              <p className="text-center text-xs text-[var(--color-text-muted)] py-8">Nenhuma indicação registrada ainda.</p>
            ) : indicacoes.map((item) => (
              <div key={item.id} className="bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] p-4 rounded-xl flex flex-col gap-3 relative">
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="absolute top-3 right-3 text-[var(--color-text-faint)] hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)] text-xs mb-0.5 pr-6">{item.referred_name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Indicado por {item.referrer_name} ({item.referrer_type === "colaborador" ? "Colaborador" : "Cliente"})
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(item)}
                    className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md border ${statusStyle(item.status)}`}
                  >
                    {statusIcon(item.status)}
                    {item.status}
                  </button>
                  <p className="font-mono font-bold text-xs text-[var(--color-text-primary)]">{currency(Number(item.commission_value))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-surface-sunken)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[var(--color-primary-blue)]" /> Nova Indicação
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Registre quem indicou e o valor de comissão devido.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Quem indicou? *</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setReferrerType("colaborador"); setReferrerId(""); }}
                    className={`h-9 rounded-[var(--radius-control)] text-xs font-bold border transition-colors cursor-pointer ${referrerType === "colaborador" ? "bg-[var(--color-primary-blue)] text-white border-[var(--color-primary-blue)]" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border-[var(--color-border-default)]"}`}
                  >
                    Colaborador
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReferrerType("cliente"); setReferrerId(""); }}
                    className={`h-9 rounded-[var(--radius-control)] text-xs font-bold border transition-colors cursor-pointer ${referrerType === "cliente" ? "bg-[var(--color-primary-blue)] text-white border-[var(--color-primary-blue)]" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border-[var(--color-border-default)]"}`}
                  >
                    Cliente
                  </button>
                </div>
                <select
                  required
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                >
                  <option value="">Selecione {referrerType === "colaborador" ? "o colaborador" : "o cliente"}...</option>
                  {referrerOptions.map((r: any) => (
                    <option key={r.id} value={r.id}>{referrerType === "colaborador" ? r.nome : r.name}</option>
                  ))}
                </select>
                {referrerOptions.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Nenhum {referrerType === "colaborador" ? "colaborador cadastrado" : "cliente na base"} ainda.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Cliente Indicado *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do novo cliente/empresa indicado"
                  value={referredName}
                  onChange={(e) => setReferredName(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Contato (opcional)</label>
                <input
                  type="text"
                  placeholder="Telefone ou e-mail do indicado"
                  value={referredContact}
                  onChange={(e) => setReferredContact(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Valor da Comissão (R$) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0,00"
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Contexto adicional sobre a indicação..."
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]">
                  Cancelar
                </Button>
                <Button type="submit" className="h-9 px-5 text-xs font-bold shadow-xs">
                  Registrar Indicação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
