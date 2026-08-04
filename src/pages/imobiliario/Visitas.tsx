import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, Calendar, MapPin, User, Clock, Check, X, Building2,
  Search, CheckCircle2, XCircle, AlertCircle, Eye, TrendingUp,
  Phone, Edit2, Trash2, ChevronRight, MessageSquare, ExternalLink,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

type Visita = {
  id: string;
  imovel: string;
  bairro: string;
  cliente: string;
  telefone: string;
  corretor: string;
  data: string;
  hora: string;
  status: "Agendada" | "Confirmada" | "Realizada" | "Cancelada";
  obs: string;
};


const STATUS_COLORS: Record<string, string> = {
  Agendada: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Confirmada: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Realizada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICON: Record<string, any> = {
  Agendada: AlertCircle,
  Confirmada: Clock,
  Realizada: CheckCircle2,
  Cancelada: XCircle,
};

const FIELD = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50";
const SELECT = "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50";
const LABEL = "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

// ─── FORM MODAL ───────────────────────────────────────────────────────────────
function VisitaFormModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (d: any) => void;
  initial?: Partial<Visita>;
}) {
  const [form, setForm] = useState({
    imovel: initial?.imovel ?? "",
    bairro: initial?.bairro ?? "",
    cliente: initial?.cliente ?? "",
    telefone: initial?.telefone ?? "",
    corretor: initial?.corretor ?? "",
    data: initial?.data ?? "",
    hora: initial?.hora ?? "10:00",
    status: initial?.status ?? "Agendada",
    obs: initial?.obs ?? "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = Boolean(initial?.id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-base font-black text-white">{isEdit ? "Editar Visita" : "Agendar Visita"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? "Atualize as informações da visita" : "Cadastre uma nova visita"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={LABEL}>Imóvel</label>
            <input value={form.imovel} onChange={e => set("imovel", e.target.value)} placeholder="Nome ou endereço do imóvel" className={FIELD} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Bairro</label>
              <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Moema" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Corretor</label>
              <input value={form.corretor} onChange={e => set("corretor", e.target.value)} placeholder="Nome do corretor" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Cliente</label>
              <input value={form.cliente} onChange={e => set("cliente", e.target.value)} placeholder="Nome do cliente" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Data</label>
              <input type="date" value={form.data} onChange={e => set("data", e.target.value)} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Horário</label>
              <input type="time" value={form.hora} onChange={e => set("hora", e.target.value)} className={FIELD} />
            </div>
            {isEdit && (
              <div className="col-span-2">
                <label className={LABEL}>Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)} className={SELECT}>
                  <option>Agendada</option><option>Confirmada</option><option>Realizada</option><option>Cancelada</option>
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className={LABEL}>Observações</label>
              <textarea value={form.obs} onChange={e => set("obs", e.target.value)} rows={2} placeholder="Informações adicionais, preferências do cliente..." className={`${FIELD} resize-none`} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button
            onClick={() => {
              if (!form.imovel.trim() || !form.cliente.trim() || !form.data) { toast.error("Preencha os campos obrigatórios"); return; }
              onSave(form);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          >
            {isEdit ? "Salvar Alterações" : "Agendar Visita"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function VisitaDetailDrawer({ v, onClose, onEdit, onDelete, onUpdateStatus }: {
  v: Visita;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: Visita["status"]) => void;
}) {
  const StatusIcon = STATUS_ICON[v.status] ?? AlertCircle;
  const phoneRaw = v.telefone.replace(/\D/g, "");
  const dataFmt = new Date(v.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[var(--color-surface)] border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${STATUS_COLORS[v.status]}`}>
              <StatusIcon className="w-2.5 h-2.5" />{v.status}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/40 to-violet-900/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-400/60" />
            </div>
            <div>
              <h2 className="font-black text-white text-sm leading-tight">{v.imovel}</h2>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{v.bairro}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Data e hora */}
          <div className="px-6 py-4 border-b border-white/5 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Data</p>
              <p className="text-sm font-bold text-white capitalize">{dataFmt}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Horário</p>
              <p className="text-xl font-black text-white">{v.hora}</p>
            </div>
          </div>

          {/* Envolvidos */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className={LABEL}>Envolvidos</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                  {v.cliente.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{v.cliente}</p>
                  <p className="text-[9px] text-slate-500">Cliente</p>
                </div>
                {v.telefone && (
                  <a href={`https://wa.me/55${phoneRaw}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                  {v.corretor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{v.corretor}</p>
                  <p className="text-[9px] text-slate-500">Corretor responsável</p>
                </div>
              </div>
              {v.telefone && (
                <a href={`tel:${phoneRaw}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                  <Phone className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm text-slate-300">{v.telefone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Obs */}
          {v.obs && (
            <div className="px-6 py-4 border-b border-white/5">
              <p className={LABEL}>Observações</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <p className="text-sm text-slate-300 leading-relaxed">{v.obs}</p>
              </div>
            </div>
          )}

          {/* Alterar status */}
          <div className="px-6 py-4">
            <p className={LABEL}>Alterar Status</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["Agendada", "Confirmada", "Realizada", "Cancelada"] as const).map(s => {
                const Icon = STATUS_ICON[s];
                return (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                      v.status === s
                        ? STATUS_COLORS[s] + " ring-1 ring-current"
                        : "bg-white/5 text-slate-500 border-white/10 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <Button onClick={onEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </Button>
          <Button onClick={() => { onDelete(); onClose(); }} variant="ghost" className="px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Visitas() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editVisita, setEditVisita] = useState<Visita | null>(null);
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("imobiliario_visitas").select("*").order("data", { ascending: true }).then(({ data }) => {
      if (data) {
        setVisitas(data.map(r => ({
          id: r.id, imovel: r.imovel, bairro: r.bairro ?? "",
          cliente: r.cliente, telefone: r.telefone ?? "", corretor: r.corretor ?? "",
          data: r.data, hora: r.hora ?? "10:00", status: r.status, obs: r.obs ?? "",
        })));
      }
    });
  }, []);

  const filtered = visitas.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.cliente.toLowerCase().includes(q) || v.imovel.toLowerCase().includes(q) || v.corretor.toLowerCase().includes(q) || v.bairro.toLowerCase().includes(q)) &&
      (statusFilter === "Todas" || v.status === statusFilter)
    );
  });

  const handleSave = async (form: any) => {
    const nova: Visita = { ...form, id: Date.now().toString(), status: "Agendada" };
    setVisitas(prev => [nova, ...prev]);
    toast.success("Visita agendada!");
    if (supabase) {
      const { error } = await supabase.from("imobiliario_visitas").insert({ ...form, id: nova.id });
      if (error) console.error("[Supabase]", error.message);
    }
  };

  const handleEdit = async (form: any) => {
    if (!editVisita) return;
    const updated = { ...editVisita, ...form };
    setVisitas(prev => prev.map(v => v.id === editVisita.id ? updated : v));
    if (selectedVisita?.id === editVisita.id) setSelectedVisita(updated);
    toast.success("Visita atualizada!");
    if (supabase) {
      const { error } = await supabase.from("imobiliario_visitas").update(form).eq("id", editVisita.id);
      if (error) console.error("[Supabase]", error.message);
    }
    setEditVisita(null);
  };

  const updateStatus = async (id: string, status: Visita["status"]) => {
    setVisitas(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    if (selectedVisita?.id === id) setSelectedVisita(s => s ? { ...s, status } : null);
    const msgs: Record<string, string> = { Confirmada: "Visita confirmada!", Realizada: "Visita marcada como realizada.", Cancelada: "Visita cancelada." };
    toast.success(msgs[status] ?? `Status: ${status}`);
    if (supabase) await supabase.from("imobiliario_visitas").update({ status }).eq("id", id);
  };

  const handleDelete = async (id: string) => {
    setVisitas(prev => prev.filter(v => v.id !== id));
    toast.success("Visita removida.");
    if (supabase) await supabase.from("imobiliario_visitas").delete().eq("id", id);
  };

  const hoje = new Date().toISOString().split("T")[0];
  const proximas = filtered.filter(v => v.data >= hoje && v.status !== "Cancelada" && v.status !== "Realizada");
  const historico = filtered.filter(v => v.data < hoje || v.status === "Realizada" || v.status === "Cancelada");

  const agendadas = visitas.filter(v => v.status === "Agendada").length;
  const confirmadas = visitas.filter(v => v.status === "Confirmada").length;
  const realizadas = visitas.filter(v => v.status === "Realizada").length;
  const canceladas = visitas.filter(v => v.status === "Cancelada").length;

  const VisitaRow = ({ v }: { v: Visita }) => {
    const StatusIcon = STATUS_ICON[v.status] ?? AlertCircle;
    const phoneRaw = v.telefone.replace(/\D/g, "");

    return (
      <div
        onClick={() => setSelectedVisita(v)}
        className="flex items-start gap-4 p-4 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl hover:border-blue-500/20 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-blue-400/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-white text-sm truncate">{v.imovel}</p>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_COLORS[v.status]}`}>
              <StatusIcon className="w-2 h-2" />{v.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.cliente}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(v.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{v.hora}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.bairro}</span>
            <span>Corretor: <span className="text-slate-300 font-bold">{v.corretor}</span></span>
          </div>
          {v.obs && (
            <p className="text-[10px] text-slate-500 italic mt-1.5 bg-white/[0.02] rounded-lg px-2.5 py-1.5 border border-white/5 line-clamp-1">
              "{v.obs}"
            </p>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {v.status === "Agendada" && (
            <button onClick={() => updateStatus(v.id, "Confirmada")} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all" title="Confirmar">
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {(v.status === "Agendada" || v.status === "Confirmada") && (
            <button onClick={() => updateStatus(v.id, "Realizada")} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all" title="Realizar">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          {v.status !== "Cancelada" && v.status !== "Realizada" && (
            <button onClick={() => updateStatus(v.id, "Cancelada")} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Cancelar">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setEditVisita(v)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Editar">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Remover">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
      </div>
    );
  };

  return (
    <PageContainer
      title="Visitas"
      description="Controle e organize todas as visitas de imóveis com clientes."
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Agendar Visita
        </Button>
      }
    >
      {showForm && <VisitaFormModal onClose={() => setShowForm(false)} onSave={handleSave} />}
      {editVisita && <VisitaFormModal onClose={() => setEditVisita(null)} onSave={handleEdit} initial={editVisita} />}
      {selectedVisita && (
        <VisitaDetailDrawer
          v={selectedVisita}
          onClose={() => setSelectedVisita(null)}
          onEdit={() => { setEditVisita(selectedVisita); setSelectedVisita(null); }}
          onDelete={() => handleDelete(selectedVisita.id)}
          onUpdateStatus={s => updateStatus(selectedVisita.id, s)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: AlertCircle, label: "Agendadas", value: agendadas.toString(), color: "text-amber-500" },
          { icon: Clock, label: "Confirmadas", value: confirmadas.toString(), color: "text-blue-500" },
          { icon: CheckCircle2, label: "Realizadas", value: realizadas.toString(), color: "text-emerald-500" },
          { icon: TrendingUp, label: "Taxa Realização", value: realizadas + canceladas > 0 ? `${Math.round((realizadas / (realizadas + canceladas)) * 100)}%` : "—", color: "text-indigo-500" },
        ].map((s, i) => (
          <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <s.icon className={`w-5 h-5 ${s.color} mb-4`} />
            <div className="text-2xl font-display font-black text-white mb-1 italic">{s.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente, imóvel, corretor ou bairro..." className="w-full bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl p-1 gap-1">
          {["Todas", "Agendada", "Confirmada", "Realizada", "Cancelada"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${statusFilter === s ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>{s}</button>
          ))}
        </div>
      </div>

      {proximas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Próximas Visitas <span className="text-blue-400">({proximas.length})</span>
            </h3>
          </div>
          <div className="space-y-2">
            {proximas.map(v => <VisitaRow key={v.id} v={v} />)}
          </div>
        </div>
      )}

      {historico.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-4 bg-slate-600 rounded-full" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Histórico <span className="text-slate-500">({historico.length})</span>
            </h3>
          </div>
          <div className="space-y-2">
            {historico.map(v => <VisitaRow key={v.id} v={v} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhuma visita encontrada</p>
          <p className="text-sm mt-1">Ajuste os filtros ou agende uma nova visita.</p>
        </div>
      )}
    </PageContainer>
  );
}
