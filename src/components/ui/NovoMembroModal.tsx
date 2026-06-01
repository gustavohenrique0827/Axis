import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type NovoMembroPayload = {
    nome: string;
    email: string;
    cargo: string;
    departamento: string;
};

type NovoMembroModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: NovoMembroPayload) => void;
    title?: string;
    submitText?: string;
    initialValue?: Partial<NovoMembroPayload> | null;
};

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
    "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

export function NovoMembroModal({
    isOpen,
    onClose,
    onSave,
    title = "Convidar Membro",
    submitText = "Adicionar à Equipe",
    initialValue,
}: NovoMembroModalProps) {
    const [nome, setNome] = useState(initialValue?.nome || "");
    const [email, setEmail] = useState(initialValue?.email || "");
    const [cargo, setCargo] = useState(initialValue?.cargo || "");
    const [departamento, setDepartamento] = useState(initialValue?.departamento || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setNome(initialValue?.nome || "");
        setEmail(initialValue?.email || "");
        setCargo(initialValue?.cargo || "");
        setDepartamento(initialValue?.departamento || "");
        setLoading(false);
    }, [isOpen, initialValue]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        return Boolean(nome.trim() && email.trim() && cargo.trim());
    }, [loading, nome, email, cargo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            onSave({
                nome: nome.trim(),
                email: email.trim(),
                cargo: cargo.trim(),
                departamento: departamento.trim()
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
            maxWidth="max-w-2xl"
            title={
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mt-0.5">
                        <UserPlus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-black text-white">{title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            Gestão de capital humano e acessos
                        </div>
                    </div>
                </div>
            }
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="novo-membro-form" className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6" disabled={!canSubmit}>
                        {loading ? "Processando..." : submitText}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="bg-[#0B1120]/40 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-200 font-bold">Registro Seguro</p>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Ao cadastrar, o membro receberá acesso aos módulos permitidos pelo seu cargo e departamento.
                            </p>
                        </div>
                    </div>
                </div>

                <form id="novo-membro-form" onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="membro-nome" className={labelClass}>Nome Completo</label>
                            <input id="membro-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputBaseClass} placeholder="Ex.: Carlos Mendes" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="membro-email" className={labelClass}>E-mail Corporativo</label>
                            <input id="membro-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputBaseClass} placeholder="email@empresa.com" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="membro-cargo" className={labelClass}>Cargo / Função</label>
                            <input id="membro-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputBaseClass} placeholder="Ex.: SDR Senior" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="membro-depto" className={labelClass}>Departamento</label>
                            <select id="membro-depto" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className={inputBaseClass}>
                                <option value="">Selecione...</option>
                                <option value="Vendas">Vendas</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sucesso do Cliente">Sucesso do Cliente</option>
                                <option value="Administrativo">Administrativo</option>
                                <option value="Tecnologia">Tecnologia</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}