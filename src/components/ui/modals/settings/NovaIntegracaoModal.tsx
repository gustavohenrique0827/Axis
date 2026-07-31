import React, { useEffect, useMemo, useState } from "react";
import { Zap, Code } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";

type NovaIntegracaoPayload = {
    nome: string;
    tipo: string;
    descricao: string;
    apiKey?: string;
    apiUrl?: string;
    autenticacao: string;
    ativo: boolean;
};

type NovaIntegracaoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: NovaIntegracaoPayload) => void;
    title?: string;
    submitText?: string;
    initialValue?: Partial<NovaIntegracaoPayload> | null;
};

const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
const inputBaseClass =
    "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all";

const tiposIntegracao = [
    "API REST",
    "Webhook",
    "CRM",
    "Email",
    "SMS",
    "WhatsApp",
    "Slack",
    "Google Sheets",
    "Zapier",
    "Make.com",
    "Custom",
];

export function NovaIntegracaoModal({
    isOpen,
    onClose,
    onSave,
    title = "Nova Integração",
    submitText = "Criar Integração",
    initialValue,
}: NovaIntegracaoModalProps) {
    const [nome, setNome] = useState(initialValue?.nome || "");
    const [tipo, setTipo] = useState(initialValue?.tipo || "");
    const [descricao, setDescricao] = useState(initialValue?.descricao || "");
    const [apiKey, setApiKey] = useState(initialValue?.apiKey || "");
    const [apiUrl, setApiUrl] = useState(initialValue?.apiUrl || "");
    const [autenticacao, setAutenticacao] = useState(initialValue?.autenticacao || "api_key");
    const [ativo, setAtivo] = useState(initialValue?.ativo ?? true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setNome(initialValue?.nome || "");
        setTipo(initialValue?.tipo || "");
        setDescricao(initialValue?.descricao || "");
        setApiKey(initialValue?.apiKey || "");
        setApiUrl(initialValue?.apiUrl || "");
        setAutenticacao(initialValue?.autenticacao || "api_key");
        setAtivo(initialValue?.ativo ?? true);
        setLoading(false);
    }, [isOpen, initialValue]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        return Boolean(nome.trim() && tipo.trim());
    }, [loading, nome, tipo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            onSave({
                nome: nome.trim(),
                tipo: tipo.trim(),
                descricao: descricao.trim(),
                apiKey: apiKey.trim(),
                apiUrl: apiUrl.trim(),
                autenticacao: autenticacao.trim(),
                ativo,
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
                    <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center mt-0.5">
                        <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-black text-white">{title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            Conecte ferramentas e serviços externos
                        </div>
                    </div>
                </div>
            }
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="nova-integracao-form" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6" disabled={!canSubmit}>
                        {loading ? "Processando..." : submitText}
                    </Button>
                </>
            }
        >
            <form id="nova-integracao-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>Nome da Integração *</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Integracao Salesforce"
                        className={inputBaseClass}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Tipo de Integração *</label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className={inputBaseClass}
                        required
                    >
                        <option value="">Selecione um tipo...</option>
                        {tiposIntegracao.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Descrição</label>
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Detalhes sobre a integração..."
                        className={`${inputBaseClass} resize-none h-20`}
                    />
                </div>

                <div>
                    <label className={labelClass}>URL da API</label>
                    <input
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://api.exemplo.com/v1"
                        className={inputBaseClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Chave de API</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk_live_xxxxxxxxxxxxx"
                        className={inputBaseClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Tipo de Autenticação</label>
                    <select
                        value={autenticacao}
                        onChange={(e) => setAutenticacao(e.target.value)}
                        className={inputBaseClass}
                    >
                        <option value="api_key">API Key</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="oauth">OAuth 2.0</option>
                        <option value="basic">Basic Auth</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="ativo-checkbox"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        className="w-4 h-4 rounded bg-[var(--color-surface)] border border-white/10 cursor-pointer"
                    />
                    <label htmlFor="ativo-checkbox" className={`${labelClass} cursor-pointer`}>
                        Ativar integração
                    </label>
                </div>
            </form>
        </Modal>
    );
}
