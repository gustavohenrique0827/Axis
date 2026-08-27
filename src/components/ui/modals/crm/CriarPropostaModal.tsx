import React, { useEffect, useMemo, useState } from "react";
import { FileText, CheckCircle } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import { useData } from "../../../../contexts/DataContext";

type CriarPropostaItem = { productId?: string | null; descricao: string; quantidade: number; precoUnitario: number };

type CriarPropostaPayload = {
    titulo: string;
    cliente: string;
    descricao: string;
    valor: string;
    dataValidade: string;
    condicoesPagamento: string;
    itens: CriarPropostaItem[];
};

type CriarPropostaModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: CriarPropostaPayload) => void;
    title?: string;
    submitText?: string;
    initialValue?: Partial<CriarPropostaPayload> | null;
};

const ITEM_AVULSO = "__avulso__";

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
    "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

export function CriarPropostaModal({
    isOpen,
    onClose,
    onSave,
    title = "Criar Proposta",
    submitText = "Gerar Proposta",
    initialValue,
}: CriarPropostaModalProps) {
    const [titulo, setTitulo] = useState(initialValue?.titulo || "");
    const [cliente, setCliente] = useState(initialValue?.cliente || "");
    const [descricao, setDescricao] = useState(initialValue?.descricao || "");
    const [valor, setValor] = useState(initialValue?.valor || "");
    const [dataValidade, setDataValidade] = useState(initialValue?.dataValidade || "");
    const [condicoesPagamento, setCondicoesPagamento] = useState(initialValue?.condicoesPagamento || "Boleto - 7 dias");
    const [itens, setItens] = useState<CriarPropostaItem[]>(
        initialValue?.itens || [{ productId: null, descricao: "", quantidade: 1, precoUnitario: 0 }]
    );
    const [loading, setLoading] = useState(false);
    const { products } = useData();
    const activeProducts = useMemo(() => products.filter((p: any) => p.active !== false), [products]);

    useEffect(() => {
        if (!isOpen) return;
        setTitulo(initialValue?.titulo || "");
        setCliente(initialValue?.cliente || "");
        setDescricao(initialValue?.descricao || "");
        setValor(initialValue?.valor || "");
        setDataValidade(initialValue?.dataValidade || "");
        setCondicoesPagamento(initialValue?.condicoesPagamento || "Boleto - 7 dias");
        setItens(initialValue?.itens || [{ productId: null, descricao: "", quantidade: 1, precoUnitario: 0 }]);
        setLoading(false);
    }, [isOpen, initialValue]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        return Boolean(titulo.trim() && cliente.trim() && dataValidade.trim());
    }, [loading, titulo, cliente, dataValidade]);

    const handleAddItem = () => {
        setItens([...itens, { productId: null, descricao: "", quantidade: 1, precoUnitario: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItens(itens.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const novoItens = [...itens];
        novoItens[index] = { ...novoItens[index], [field]: value };
        setItens(novoItens);
    };

    const handleItemProductChange = (index: number, productId: string) => {
        const novoItens = [...itens];
        if (productId === ITEM_AVULSO) {
            novoItens[index] = { ...novoItens[index], productId: null };
        } else {
            const produto = activeProducts.find((p: any) => p.id === productId);
            novoItens[index] = {
                ...novoItens[index],
                productId,
                descricao: produto?.name || novoItens[index].descricao,
                precoUnitario: produto?.price ?? novoItens[index].precoUnitario,
            };
        }
        setItens(novoItens);
    };

    const totalProposta = itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            onSave({
                titulo: titulo.trim(),
                cliente: cliente.trim(),
                descricao: descricao.trim(),
                valor: totalProposta.toFixed(2),
                dataValidade: dataValidade.trim(),
                condicoesPagamento: condicoesPagamento.trim(),
                itens,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-3xl"
            title={
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-600/10 border border-green-500/20 flex items-center justify-center mt-0.5">
                        <FileText className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-black text-white">{title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            Propostas comerciais para clientes
                        </div>
                    </div>
                </div>
            }
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white" disabled={loading}>
                        Cancelar
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total</div>
                            <div className="text-lg font-black text-green-400">R$ {totalProposta.toFixed(2).replace(".", ",")}</div>
                        </div>
                        <Button type="submit" form="criar-proposta-form" className="bg-green-600 hover:bg-green-700 text-white font-bold px-6" disabled={!canSubmit}>
                            {loading ? "Gerando..." : submitText}
                        </Button>
                    </div>
                </>
            }
        >
            <form id="criar-proposta-form" onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Título da Proposta *</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Proposta de Consultoria"
                            className={inputBaseClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Cliente *</label>
                        <input
                            type="text"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            placeholder="Nome do cliente"
                            className={inputBaseClass}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Descrição Geral</label>
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Contexto e detalhes da proposta..."
                        className={`${inputBaseClass} resize-none h-20`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Data de Validade *</label>
                        <input
                            type="date"
                            value={dataValidade}
                            onChange={(e) => setDataValidade(e.target.value)}
                            className={inputBaseClass}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Condições de Pagamento</label>
                        <select
                            value={condicoesPagamento}
                            onChange={(e) => setCondicoesPagamento(e.target.value)}
                            className={inputBaseClass}
                        >
                            <option value="Boleto - 7 dias">Boleto - 7 dias</option>
                            <option value="Boleto - 14 dias">Boleto - 14 dias</option>
                            <option value="Boleto - 30 dias">Boleto - 30 dias</option>
                            <option value="Crédito - 1x">Crédito - 1x</option>
                            <option value="Crédito - 3x">Crédito - 3x</option>
                            <option value="Crédito - 6x">Crédito - 6x</option>
                            <option value="PIX - À vista">PIX - À vista</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3 border border-white/10 rounded-xl p-4 bg-[var(--color-surface)]/50">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Itens da Proposta</label>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
                        >
                            + Adicionar Item
                        </button>
                    </div>

                    {itens.map((item, index) => (
                        <div key={index} className="space-y-1.5 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                            <select
                                value={item.productId || ITEM_AVULSO}
                                onChange={(e) => handleItemProductChange(index, e.target.value)}
                                className={`${inputBaseClass} text-xs`}
                            >
                                <option value={ITEM_AVULSO}>Item avulso (sem produto do catálogo)</option>
                                {activeProducts.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name} — R$ {Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        value={item.descricao}
                                        onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                                        placeholder="Descrição do item"
                                        className={`${inputBaseClass} text-xs`}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        value={item.quantidade}
                                        onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value))}
                                        min="1"
                                        className={`${inputBaseClass} text-xs text-center`}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        value={item.precoUnitario}
                                        onChange={(e) => handleItemChange(index, "precoUnitario", parseFloat(e.target.value))}
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`${inputBaseClass} text-xs`}
                                    />
                                </div>
                                <div className="col-span-1">
                                    {itens.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="w-full h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </form>
        </Modal>
    );
}
