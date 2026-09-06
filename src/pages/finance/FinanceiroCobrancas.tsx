import { useState, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Receipt, Plus, QrCode, Copy, CheckCircle2, Clock,
  AlertTriangle, Search, ExternalLink, DollarSign
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";

export default function FinanceiroCobrancas() {
  const { financeEntries } = useData();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [novaCobranca, setNovaCobranca] = useState({
    cliente: "", valor: "", vencimento: "", metodo: "Pix"
  });

  const cobrancas = useMemo(() => {
    return financeEntries
      .filter(f => f.type === "Receber")
      .map(f => ({
        id: f.id,
        cliente: f.description,
        valor: f.value,
        vencimento: f.date,
        metodo: f.value > 1000 ? "Boleto" : "Pix",
        status: f.status === "Pago" ? "Liquidada" : "Pendente",
      }));
  }, [financeEntries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cobrancas.filter(c => c.cliente.toLowerCase().includes(q));
  }, [cobrancas, search]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913SPY GESTAO6009SAO PAULO62070503***6304E2CA");
    toast.success("Código Pix Copia e Cola copiado!");
  };

  return (
    <PageContainer
      title="Gestão de Cobranças & Faturamento"
      description="Emissão e acompanhamento de faturas, boletos bancários e cobranças via Pix com conciliação automática."
      actions={
        <Button onClick={() => setShowModal(true)} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Cobrança
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Receipt, label: "Total Emitido", val: cobrancas.length, color: "text-blue-500" },
          { icon: CheckCircle2, label: "Liquidadas", val: cobrancas.filter(c => c.status === "Liquidada").length, color: "text-emerald-500" },
          { icon: Clock, label: "Pendentes", val: cobrancas.filter(c => c.status === "Pendente").length, color: "text-amber-500" },
          { icon: QrCode, label: "Cobranças Pix", val: cobrancas.filter(c => c.metodo === "Pix").length, color: "text-indigo-500" },
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

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar cobrança por cliente ou identificador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Cliente / Sacado</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[var(--color-text-primary)]">{c.cliente}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                      {c.metodo}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--color-text-muted)]">{c.vencimento}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      c.status === "Liquidada"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-[var(--color-text-primary)]">
                    R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={handleCopyPix}
                      className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-sunken)] hover:bg-[var(--color-primary-blue)] hover:text-white border border-[var(--color-border-default)] text-[11px] font-bold transition-all inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Pix Copia e Cola
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                    Nenhuma cobrança pendente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Nova Cobrança</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Cliente / Sacado</label>
                <input
                  value={novaCobranca.cliente}
                  onChange={e => setNovaCobranca({ ...novaCobranca, cliente: e.target.value })}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Valor (R$)</label>
                  <input
                    value={novaCobranca.valor}
                    onChange={e => setNovaCobranca({ ...novaCobranca, valor: e.target.value })}
                    placeholder="1500,00"
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Método</label>
                  <select
                    value={novaCobranca.metodo}
                    onChange={e => setNovaCobranca({ ...novaCobranca, metodo: e.target.value })}
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-blue)]"
                  >
                    <option value="Pix">Pix Dinâmico</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartao">Cartão de Crédito</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
              <Button variant="ghost" onClick={() => setShowModal(false)} className="text-xs">Cancelar</Button>
              <Button onClick={() => { toast.success("Cobrança gerada com sucesso!"); setShowModal(false); }} className="text-xs font-bold">Emitir Cobrança</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
