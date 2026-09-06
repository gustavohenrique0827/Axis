import { useEffect, useState } from "react";
import { Users, Star, Trash2, Plus, Mail, Phone, Briefcase } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { confirmDialog } from "../../confirm-dialog";

interface ClienteContato {
  id: string;
  cliente_id: string;
  nome: string;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  principal: boolean;
}

interface ClienteContatosModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string | null;
  clienteNome?: string;
}

const inputClass =
  "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all placeholder:text-slate-600";

const EMPTY_FORM = { nome: "", cargo: "", email: "", telefone: "" };

export function ClienteContatosModal({ isOpen, onClose, clienteId, clienteNome }: ClienteContatosModalProps) {
  const [contatos, setContatos] = useState<ClienteContato[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen || !clienteId || !supabase) return;
    setLoading(true);
    supabase
      .from("cliente_contatos")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) toast.error(`Erro ao carregar contatos: ${error.message}`);
        else setContatos(data || []);
      });
    setForm(EMPTY_FORM);
  }, [isOpen, clienteId]);

  const handleAdd = async () => {
    if (!clienteId || !supabase) return;
    if (!form.nome.trim()) { toast.error("Nome do contato é obrigatório."); return; }
    const { data, error } = await supabase
      .from("cliente_contatos")
      .insert({
        cliente_id: clienteId,
        nome: form.nome.trim(),
        cargo: form.cargo.trim() || null,
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        principal: contatos.length === 0,
      })
      .select()
      .maybeSingle();
    if (error) { toast.error(`Erro ao adicionar contato: ${error.message}`); return; }
    if (data) setContatos(prev => [...prev, data]);
    setForm(EMPTY_FORM);
    toast.success("Contato adicionado!");
  };

  const handleSetPrincipal = async (id: string) => {
    if (!supabase || !clienteId) return;
    const { error: e1 } = await supabase.from("cliente_contatos").update({ principal: false }).eq("cliente_id", clienteId);
    const { error: e2 } = await supabase.from("cliente_contatos").update({ principal: true }).eq("id", id);
    if (e1 || e2) { toast.error("Erro ao definir contato principal."); return; }
    setContatos(prev => prev.map(c => ({ ...c, principal: c.id === id })));
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!supabase) return;
    if (!(await confirmDialog({
      title: "Remover contato",
      description: `Remover "${nome}" dos contatos deste cliente?`,
    }))) return;
    const { error } = await supabase.from("cliente_contatos").delete().eq("id", id);
    if (error) { toast.error(`Erro ao remover contato: ${error.message}`); return; }
    setContatos(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-base font-black text-white">Contatos e Decisores</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              {clienteNome || "Cliente"}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-slate-500">Carregando contatos...</p>
        ) : contatos.length === 0 ? (
          <p className="text-xs text-slate-500">Nenhum contato cadastrado ainda. Adicione decisores e pontos de contato abaixo.</p>
        ) : (
          <div className="space-y-2">
            {contatos.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">{c.nome}</span>
                    {c.principal && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Principal</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500">
                    {c.cargo && <span className="flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" />{c.cargo}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{c.email}</span>}
                    {c.telefone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.telefone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!c.principal && (
                    <button onClick={() => handleSetPrincipal(c.id)} title="Definir como principal" className="p-1.5 text-slate-500 hover:text-amber-400">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id, c.nome)} title="Remover" className="p-1.5 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Adicionar novo contato</p>
          <div className="grid grid-cols-2 gap-2.5">
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome *" className={inputClass} />
            <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} placeholder="Cargo" className={inputClass} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="E-mail" type="email" className={inputClass} />
            <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="Telefone" className={inputClass} />
          </div>
          <Button onClick={handleAdd} className="w-full h-9 text-[10px] font-black uppercase tracking-widest gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar Contato
          </Button>
        </div>
      </div>
    </Modal>
  );
}
