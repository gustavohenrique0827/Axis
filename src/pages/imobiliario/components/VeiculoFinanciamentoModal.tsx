import { useState } from "react";
import { X, Landmark } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

const FIELD = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50";
const LABEL = "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

interface VeiculoFinanciamentoModalProps {
  veiculoValor: number;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function VeiculoFinanciamentoModal({ veiculoValor, onClose, onSave }: VeiculoFinanciamentoModalProps) {
  const [form, setForm] = useState({
    cliente: "",
    telefone: "",
    valor_entrada: "0",
    parcelas: "48",
    banco_financeira: "",
    veiculo_troca_descricao: "",
    veiculo_troca_valor: "",
    observacoes: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const entrada = Number(form.valor_entrada) || 0;
  const trocaValor = Number(form.veiculo_troca_valor) || 0;
  const valorFinanciado = Math.max(veiculoValor - entrada - trocaValor, 0);

  const handleSubmit = () => {
    if (!form.cliente.trim()) { toast.error("Nome do cliente é obrigatório."); return; }
    onSave({
      cliente: form.cliente.trim(),
      telefone: form.telefone.trim() || null,
      valor_veiculo: veiculoValor,
      valor_entrada: entrada,
      valor_financiado: valorFinanciado,
      parcelas: Number(form.parcelas) || 1,
      banco_financeira: form.banco_financeira.trim() || null,
      veiculo_troca_descricao: form.veiculo_troca_descricao.trim() || null,
      veiculo_troca_valor: form.veiculo_troca_descricao.trim() ? trocaValor : null,
      observacoes: form.observacoes.trim() || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-black text-white">Solicitar Financiamento</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL}>Cliente *</label>
              <input value={form.cliente} onChange={e => set("cliente", e.target.value)} placeholder="Nome do cliente" className={FIELD} />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Valor de Entrada (R$)</label>
              <input type="number" value={form.valor_entrada} onChange={e => set("valor_entrada", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Parcelas</label>
              <input type="number" value={form.parcelas} onChange={e => set("parcelas", e.target.value)} className={FIELD} />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Banco / Financeira</label>
              <input value={form.banco_financeira} onChange={e => set("banco_financeira", e.target.value)} placeholder="Ex: Santander Financiamentos" className={FIELD} />
            </div>
            <div className="col-span-2 pt-2 border-t border-white/5">
              <p className={LABEL}>Veículo na troca (opcional)</p>
            </div>
            <div className="col-span-2">
              <input value={form.veiculo_troca_descricao} onChange={e => set("veiculo_troca_descricao", e.target.value)} placeholder="Ex: Corolla 2018, placa ABC1D23" className={FIELD} />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Valor de avaliação da troca (R$)</label>
              <input type="number" value={form.veiculo_troca_valor} onChange={e => set("veiculo_troca_valor", e.target.value)} className={FIELD} />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Observações</label>
              <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={2} className={`${FIELD} resize-none`} />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-slate-300">Valor a financiar (estimado)</span>
            <span className="text-lg font-black text-blue-400">
              {valorFinanciado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
            Enviar para Análise
          </Button>
        </div>
      </div>
    </div>
  );
}
