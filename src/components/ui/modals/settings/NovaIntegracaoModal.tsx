import React, { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import { FormField } from "../../form-field";
import { Input } from "../../input";
import { Switch } from "../../switch";

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
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mt-0.5">
                        <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-base font-black text-[var(--color-text-primary)]">{title}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mt-0.5">
                            Conecte ferramentas e serviços externos
                        </div>
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="nova-integracao-form" loading={loading} disabled={!canSubmit}>
                        {submitText}
                    </Button>
                </div>
            }
        >
            <form id="nova-integracao-form" onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Nome da Integração" required>
                    <Input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Integração Salesforce / HubSpot"
                        required
                    />
                </FormField>

                <FormField label="Tipo de Integração" required>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                        required
                    >
                        <option value="">Selecione um tipo...</option>
                        {tiposIntegracao.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Descrição">
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Detalhes sobre a integração..."
                        rows={2}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] resize-none"
                    />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="URL da API (Endpoint)">
                        <Input
                            type="url"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="https://api.exemplo.com/v1"
                        />
                    </FormField>

                    <FormField label="Chave de API / Token">
                        <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk_live_xxxxxxxxxxxxx"
                        />
                    </FormField>
                </div>

                <FormField label="Tipo de Autenticação">
                    <select
                        value={autenticacao}
                        onChange={(e) => setAutenticacao(e.target.value)}
                        className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                    >
                        <option value="api_key">API Key (Header / Query)</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="oauth">OAuth 2.0</option>
                        <option value="basic">Basic Auth</option>
                        <option value="custom">Custom Header</option>
                    </select>
                </FormField>

                <div className="pt-2">
                    <Switch
                        checked={ativo}
                        onCheckedChange={setAtivo}
                        label="Ativar Integração Imediatamente"
                        description="Habilita disparos e sincronização de dados assim que salva"
                    />
                </div>
            </form>
        </Modal>
    );
}
