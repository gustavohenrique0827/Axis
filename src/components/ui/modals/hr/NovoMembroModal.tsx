import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import { useData } from "../../../../contexts/DataContext";

export type NovoMembroPayload = {
    nome: string;
    email: string;
    phone: string;
    senha: string;
    cargo: string;
    departamento: string;
    squad: string;
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
    "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

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
    const [phone, setPhone] = useState(initialValue?.phone || "");
    const [senha, setSenha] = useState("");
    const [showSenha, setShowSenha] = useState(false);
    const [cargo, setCargo] = useState(initialValue?.cargo || "");
    const [departamento, setDepartamento] = useState(initialValue?.departamento || "");
    const [squad, setSquad] = useState("");
    const [loading, setLoading] = useState(false);
    const { cargos, squads } = useData();

    useEffect(() => {
        if (!isOpen) return;
        setNome(initialValue?.nome || "");
        setEmail(initialValue?.email || "");
        setPhone(initialValue?.phone || "");
        setSenha("");
        setShowSenha(false);
        setCargo(initialValue?.cargo || "");
        setDepartamento(initialValue?.departamento || "");
        setSquad("");
        setLoading(false);
    }, [isOpen, initialValue]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        return Boolean(nome.trim() && email.trim() && cargo.trim() && senha.length >= 6);
    }, [loading, nome, email, cargo, senha]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            onSave({
                nome: nome.trim(),
                email: email.trim(),
                phone: phone.trim(),
                senha: senha,
                cargo: cargo.trim(),
                departamento: departamento.trim(),
                squad: squad.trim(),
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
                <div className="bg-[var(--color-surface)]/40 border border-white/10 rounded-xl p-4">
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

                    <div className="space-y-2">
                        <label htmlFor="membro-phone" className={labelClass}>Telefone / WhatsApp</label>
                        <input id="membro-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputBaseClass} placeholder="(11) 99999-9999" />
                        <p className="text-xs text-slate-500">Preencher este número já libera o acesso à Aurora (assistente de IA) via WhatsApp para esta pessoa — qualquer cargo ou área, não só vendas.</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="membro-senha" className={labelClass}>Senha de Acesso <span className="text-slate-600 normal-case font-normal">(mín. 6 caracteres)</span></label>
                        <div className="relative">
                            <input
                                id="membro-senha"
                                type={showSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className={inputBaseClass + " pr-11"}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSenha(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="membro-cargo" className={labelClass}>Cargo / Função</label>
                            <select id="membro-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputBaseClass} required>
                                <option value="">Selecione um cargo...</option>
                                {cargos.map(c => (
                                    <option key={c.id} value={c.nome}>{c.nome}</option>
                                ))}
                            </select>
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

                    <div className="space-y-2">
                        <label htmlFor="membro-squad" className={labelClass}>Squad <span className="text-slate-600 normal-case font-normal">(opcional)</span></label>
                        <select id="membro-squad" value={squad} onChange={(e) => setSquad(e.target.value)} className={inputBaseClass}>
                            <option value="">Sem squad</option>
                            {squads.map(s => (
                                <option key={s.id} value={s.nome}>{s.nome}{s.departamento ? ` — ${s.departamento}` : ''}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>
        </Modal>
    );
}