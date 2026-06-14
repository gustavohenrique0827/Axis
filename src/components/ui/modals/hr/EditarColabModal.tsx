import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useData } from "../../contexts/DataContext";

type EditarColabModalProps = {
  colab: any | null;
  onClose: () => void;
  onSave: (id: string, updates: any) => void;
};

const inputClass =
  "w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all";
const labelClass = "text-[10px] font-black uppercase tracking-wider text-slate-400";

export function EditarColabModal({ colab, onClose, onSave }: EditarColabModalProps) {
  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    email: "",
    phone: "",
    departamento: "",
    squad: "",
    status: "Ativo",
    desempenho: 0,
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
        desempenho: colab.desempenho || 0,
      });
    }
  }, [colab]);

  const { cargos, squads } = useData();

  if (!colab) return null;

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0B1120] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-base font-black text-white">Editar Perfil</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{colab.nome}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Nome Completo</label>
              <input value={form.nome} onChange={e => set("nome", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <label className={labelClass}>E-mail</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Telefone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputClass} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Departamento</label>
              <select value={form.departamento} onChange={e => set("departamento", e.target.value)} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Vendas">Vendas</option>
                <option value="Marketing">Marketing</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Sucesso do Cliente">Sucesso do Cliente</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </div>
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Férias">Férias</option>
                <option value="Afastado">Afastado</option>
              </select>
            </div>
            <div className="space-y-1.5">
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
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(colab.id, form); onClose(); }}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-indigo-600/20"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
