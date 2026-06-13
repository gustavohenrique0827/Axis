import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Layers, Users } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";
import { useData } from "../../contexts/DataContext";

type NovaTarefaPayload = {
  nome: string;
  tipo: string;
  prioridade: string;
  data: string;
  relacionado: string;
  vendedor: string;
  produtos: string;
  tags: string;
};

type NovaTarefaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NovaTarefaPayload) => void;
  initialValue?: Partial<NovaTarefaPayload> | null;
  title?: string;
  submitText?: string;
};

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";
const fieldClass = "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

const taskTypes = [
  "Reunião Presencial",
  "Call Online",
  "Acompanhamento (Follow-up)",
  "Demonstração",
  "Envio Docs",
  "Ligação"
];

const priorities = ["Alta", "Média", "Baixa"];

export function NovaTarefaModal({
  isOpen,
  onClose,
  onSave,
  initialValue,
  title = "Nova Tarefa / Compromisso",
  submitText = "Agendar Tarefa",
}: NovaTarefaModalProps) {
  const { colaboradores } = useData();

  const sellerOptions = useMemo(
    () => (colaboradores as any[]).filter(c => c.status !== "Desligado").map(c => c.nome as string).filter(Boolean),
    [colaboradores]
  );

  const [nome, setNome] = useState(initialValue?.nome || "");
  const [tipo, setTipo] = useState(initialValue?.tipo || taskTypes[0]);
  const [prioridade, setPrioridade] = useState(initialValue?.prioridade || "Média");
  const [data, setData] = useState(initialValue?.data || new Date().toISOString().substring(0, 16));
  const [relacionado, setRelacionado] = useState(initialValue?.relacionado || "");
  const [vendedor, setVendedor] = useState(initialValue?.vendedor || "");
  const [produtos, setProdutos] = useState(initialValue?.produtos || "");
  const [tags, setTags] = useState(initialValue?.tags || "");

  useEffect(() => {
    if (!isOpen) return;
    setNome(initialValue?.nome || "");
    setTipo(initialValue?.tipo || taskTypes[0]);
    setPrioridade(initialValue?.prioridade || "Média");
    setData(initialValue?.data || new Date().toISOString().substring(0, 16));
    setRelacionado(initialValue?.relacionado || "");
    setVendedor(initialValue?.vendedor || "");
    setProdutos(initialValue?.produtos || "");
    setTags(initialValue?.tags || "");
  }, [isOpen, initialValue]);

  const canSubmit = useMemo(() => {
    return Boolean(nome.trim() && relacionado.trim() && data.trim());
  }, [nome, relacionado, data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSave({
      nome: nome.trim(),
      tipo,
      prioridade,
      data,
      relacionado: relacionado.trim(),
      vendedor,
      produtos: produtos.trim(),
      tags: tags.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#60A5FA]" />
          </div>
          <div>
            <div className="text-base font-black text-white">{title}</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Planeje compromissos e organize follow-ups comerciais</div>
          </div>
        </div>
      }
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            Cancelar
          </Button>
          <Button type="submit" form="nova-tarefa-form" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6" disabled={!canSubmit}>
            {submitText}
          </Button>
        </>
      }
    >
      <form id="nova-tarefa-form" onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Título do Compromisso</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={fieldClass}
              placeholder="Ex: Reunião com Cliente Axis"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Lead / Empresa Associado</label>
            <input
              value={relacionado}
              onChange={(e) => setRelacionado(e.target.value)}
              className={fieldClass}
              placeholder="Ex: Axis Innovations"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Tipo do Canal</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={fieldClass}>
              {taskTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Prioridade Comercial</label>
            <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className={fieldClass}>
              {priorities.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Data & Hora Limite</label>
            <input
              type="datetime-local"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Vendedor Responsável</label>
            <select value={vendedor} onChange={(e) => setVendedor(e.target.value)} className={fieldClass}>
              <option value="">Não Atribuído</option>
              {sellerOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
              {sellerOptions.length === 0 && (
                <option value="" disabled>Nenhum colaborador cadastrado</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelClass}>Produtos / Serviços Relacionados</label>
            <input
              value={produtos}
              onChange={(e) => setProdutos(e.target.value)}
              className={fieldClass}
              placeholder="Ex: Setup PRO, Licença SaaS"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={fieldClass}
              placeholder="Ex: prioridade alta, follow-up"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Users className="w-4 h-4" />
            Informe o responsável e o cliente para cadastrar a tarefa corretamente.
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ClipboardList className="w-4 h-4" />
            As tags ajudam a filtrar a tarefa no quadro Kanban.
          </div>
        </div>
      </form>
    </Modal>
  );
}
