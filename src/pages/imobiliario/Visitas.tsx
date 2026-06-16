import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, Calendar, MapPin, User, Clock, Check, X, Building2,
  Search, CheckCircle2, XCircle, AlertCircle, Eye, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

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

const MOCK: Visita[] = [
  { id: "1", imovel: "Apto 3 quartos - Moema", bairro: "Moema", cliente: "Roberto Silva", telefone: "(11) 98888-7777", corretor: "Ana Lima", data: "2026-06-17", hora: "10:00", status: "Confirmada", obs: "Cliente tem 2 filhos, quer ver o espaço dos quartos." },
  { id: "2", imovel: "Casa 4 quartos - Alphaville", bairro: "Alphaville", cliente: "Patrícia Costa", telefone: "(11) 97777-6666", corretor: "Carlos Matos", data: "2026-06-18", hora: "14:30", status: "Agendada", obs: "" },
  { id: "3", imovel: "Cobertura Duplex - Vila Olímpia", bairro: "Vila Olímpia", cliente: "Marcos Alves", telefone: "(11) 96666-5555", corretor: "Fernanda Rocha", data: "2026-06-19", hora: "11:00", status: "Confirmada", obs: "Trazer planta baixa e habite-se." },
  { id: "4", imovel: "Sala Comercial - Faria Lima", bairro: "Itaim Bibi", cliente: "Luciana Torres", telefone: "(11) 95555-4444", corretor: "Carlos Matos", data: "2026-06-16", hora: "09:00", status: "Realizada", obs: "" },
  { id: "5", imovel: "Casa - Granja Viana", bairro: "Granja Viana", cliente: "Felipe Araújo", telefone: "(11) 94444-3333", corretor: "Ana Lima", data: "2026-06-14", hora: "15:00", status: "Realizada", obs: "Cliente gostou bastante, pediu proposta." },
  { id: "6", imovel: "Cobertura - Higienópolis", bairro: "Higienópolis", cliente: "Camila Souza", telefone: "(11) 93333-2222", corretor: "Ana Lima", data: "2026-06-20", hora: "10:30", status: "Agendada", obs: "Alta prioridade — cliente tem proposta de outro imóvel." },
  { id: "7", imovel: "Apto 2q - Pinheiros", bairro: "Pinheiros", cliente: "Ricardo Nunes", telefone: "(11) 92222-1111", corretor: "Fernanda Rocha", data: "2026-06-13", hora: "09:30", status: "Cancelada", obs: "Cliente reagendou para próxima semana." },
];

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

function NovaVisitaModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    imovel: "", bairro: "", cliente: "", telefone: "",
    corretor: "", data: "", hora: "10:00", obs: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Agendar Visita</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Imóvel</label>
            <input value={form.imovel} onChange={(e) => set("imovel", e.target.value)} placeholder="Nome ou código do imóvel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Bairro</label>
              <input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Moema" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Corretor</label>
              <input value={form.corretor} onChange={(e) => set("corretor", e.target.value)} placeholder="Nome do corretor" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Cliente</label>
              <input value={form.cliente} onChange={(e) => set("cliente", e.target.value)} placeholder="Nome do cliente" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Telefone</label>
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Data</label>
              <input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Horário</label>
              <input type="time" value={form.hora} onChange={(e) => set("hora", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Observações</label>
            <textarea value={form.obs} onChange={(e) => set("obs", e.target.value)} rows={2} placeholder="Informações adicionais, preferências do cliente..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
            Agendar Visita
          </Button>
        </div>
      </div>
    </div>
  );
}

function VisitaCard({
  visita: v,
  onUpdateStatus,
  onDelete,
}: {
  visita: Visita;
  onUpdateStatus: (id: string, s: Visita["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = STATUS_ICON[v.status] ?? AlertCircle;

  return (
    <div className="flex items-start gap-4 p-4 bg-[#111827]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/30 to-violet-900/30 flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="font-bold text-white text-sm truncate">{v.imovel}</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_COLORS[v.status]}`}>
            <StatusIcon className="w-2.5 h-2.5" />{v.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 flex-wrap">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.cliente}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(v.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{v.hora}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.bairro}</span>
          <span>Corretor: <span className="text-slate-300 font-bold">{v.corretor}</span></span>
        </div>
        {v.obs && (
          <p className="text-[10px] text-slate-500 italic mt-1.5 bg-white/[0.02] rounded-lg px-3 py-1.5 border border-white/5">
            "{v.obs}"
          </p>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {v.status === "Agendada" && (
          <button
            onClick={() => onUpdateStatus(v.id, "Confirmada")}
            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
            title="Confirmar visita"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        {(v.status === "Agendada" || v.status === "Confirmada") && (
          <button
            onClick={() => onUpdateStatus(v.id, "Realizada")}
            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
            title="Marcar como realizada"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        {v.status !== "Cancelada" && v.status !== "Realizada" && (
          <button
            onClick={() => onUpdateStatus(v.id, "Cancelada")}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
            title="Cancelar visita"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(v.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
          title="Remover"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Visitas() {
  const [visitas, setVisitas] = useState<Visita[]>(MOCK);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [showModal, setShowModal] = useState(false);

  const filtered = visitas.filter((v) => {
    const matchSearch =
      v.cliente.toLowerCase().includes(search.toLowerCase()) ||
      v.imovel.toLowerCase().includes(search.toLowerCase()) ||
      v.corretor.toLowerCase().includes(search.toLowerCase()) ||
      v.bairro.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todas" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (form: any) => {
    const nova: Visita = { ...form, id: Date.now().toString(), status: "Agendada" };
    setVisitas((prev) => [nova, ...prev]);
    toast.success("Visita agendada com sucesso!");
  };

  const updateStatus = (id: string, status: Visita["status"]) => {
    setVisitas((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
    const msgs: Record<string, string> = {
      Confirmada: "Visita confirmada!",
      Realizada: "Visita marcada como realizada.",
      Cancelada: "Visita cancelada.",
    };
    toast.success(msgs[status] ?? `Status: ${status}`);
  };

  const handleDelete = (id: string) => {
    setVisitas((prev) => prev.filter((v) => v.id !== id));
    toast.success("Visita removida.");
  };

  const hoje = new Date().toISOString().split("T")[0];
  const proximas = filtered.filter((v) => v.data >= hoje && v.status !== "Cancelada" && v.status !== "Realizada");
  const historico = filtered.filter((v) => v.data < hoje || v.status === "Realizada" || v.status === "Cancelada");

  // Stats
  const agendadas = visitas.filter((v) => v.status === "Agendada").length;
  const confirmadas = visitas.filter((v) => v.status === "Confirmada").length;
  const realizadas = visitas.filter((v) => v.status === "Realizada").length;
  const canceladas = visitas.filter((v) => v.status === "Cancelada").length;

  return (
    <PageContainer
      title="Visitas"
      description="Controle e organize todas as visitas de imóveis com clientes."
      actions={
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold"
        >
          <Plus className="w-4 h-4" /> Agendar Visita
        </Button>
      }
    >
      {showModal && <NovaVisitaModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: AlertCircle, label: "Agendadas", value: agendadas.toString(), color: "text-amber-400 bg-amber-500/10" },
          { icon: Clock, label: "Confirmadas", value: confirmadas.toString(), color: "text-blue-400 bg-blue-500/10" },
          { icon: CheckCircle2, label: "Realizadas", value: realizadas.toString(), color: "text-emerald-400 bg-emerald-500/10" },
          { icon: TrendingUp, label: "Taxa Realização", value: realizadas + canceladas > 0 ? `${Math.round((realizadas / (realizadas + canceladas)) * 100)}%` : "—", color: "text-violet-400 bg-violet-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-lg font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, imóvel, corretor ou bairro..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex bg-[#111827] border border-white/10 rounded-xl p-1 gap-1">
          {["Todas", "Agendada", "Confirmada", "Realizada", "Cancelada"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${statusFilter === s ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}
            >
              {s}
            </button>
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
          <div className="space-y-2.5">
            {proximas.map((v) => (
              <VisitaCard key={v.id} visita={v} onUpdateStatus={updateStatus} onDelete={handleDelete} />
            ))}
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
          <div className="space-y-2.5">
            {historico.map((v) => (
              <VisitaCard key={v.id} visita={v} onUpdateStatus={updateStatus} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhuma visita encontrada</p>
          <p className="text-xs mt-1">Tente ajustar os filtros ou agende uma nova visita.</p>
        </div>
      )}
    </PageContainer>
  );
}
