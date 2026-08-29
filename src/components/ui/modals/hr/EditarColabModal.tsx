import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { useDepartamentoOptions } from "../../../../hooks/useDepartamentoOptions";
import { Button } from "../../../ui/button";

type EditarColabModalProps = {
  colab: any | null;
  onClose: () => void;
  onSave: (id: string, updates: any) => void;
};

const inputClass =
  "w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all";
const labelClass = "text-xs font-bold text-[var(--color-text-muted)] mb-1 block";

export function EditarColabModal({ colab, onClose, onSave }: EditarColabModalProps) {
  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    email: "",
    phone: "",
    departamento: "",
    squad: "",
    status: "Ativo",
    desempenho: 100,
  });

  useEffect(() => {
    if (colab) {
      setForm({
        nome: colab.nome || "",
        cargo: colab.cargo || "",
        email: colab.email || "",
        phone: colab.phone || "",
        departamento: colab.departamento || "",
        squad: colab.squad || "",
        status: colab.status || "Ativo",
        desempenho: colab.desempenho ?? 100,
      });
    }
  }, [colab]);

  const { cargos, squads } = useData();
  const departamentoOptions = useDepartamentoOptions();

  if (!colab) return null;

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">Editar Colaborador</div>
              <div className="text-[10px] font-mono text-[var(--color-text-muted)]">{colab.nome}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome Completo</label>
              <input value={form.nome} onChange={e => set("nome", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cargo</label>
              <select value={form.cargo} onChange={e => set("cargo", e.target.value)} className={inputClass}>
                <option value="">Selecione um cargo...</option>
                {cargos.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputClass} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Departamento</label>
              <select value={form.departamento} onChange={e => set("departamento", e.target.value)} className={inputClass}>
                <option value="">Selecione...</option>
                {departamentoOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Squad</label>
              <select value={form.squad} onChange={e => set("squad", e.target.value)} className={inputClass}>
                <option value="">Sem squad</option>
                {squads.map(s => (
                  <option key={s.id} value={s.nome}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Férias">Férias</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Desempenho (%)</label>
              <input
                type="number" min={0} max={100}
                value={form.desempenho}
                onChange={e => set("desempenho", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-surface-sunken)] border-t border-[var(--color-border-subtle)] flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => { onSave(colab.id, form); onClose(); }}
            className="h-9 px-5 text-xs font-bold shadow-xs"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
