import React, { useState } from 'react';
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { formatCNPJ, validateCNPJ } from "../../lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type CnpjStatus = "idle" | "checking" | "active" | "inactive" | "invalid";

export default function ConfigEmpresaDados() {
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cnpjStatus, setCnpjStatus] = useState<{ status: CnpjStatus; message?: string }>({ status: "idle" });

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 14) {
      setCnpjStatus({ status: "checking" });
      try {
        const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
        if (resp.ok) {
          const data = await resp.json();
          const isActive = data.situacao_cadastral === 2;
          setCnpjStatus({ status: isActive ? "active" : "inactive", message: data.descricao_situacao_cadastral });
          if (data.razao_social) setRazaoSocial(data.razao_social);
          if (data.nome_fantasia) setNomeFantasia(data.nome_fantasia);
          const parts = [
            data.logradouro && data.numero ? `${data.logradouro}, ${data.numero}` : data.logradouro,
            data.bairro,
            data.municipio && data.uf ? `${data.municipio} - ${data.uf}` : "",
            data.cep ? `CEP ${data.cep}` : "",
          ].filter(Boolean);
          if (parts.length) setEndereco(parts.join(", "));
        } else {
          const err = await resp.json().catch(() => ({}));
          setCnpjStatus({ status: "invalid", message: err.message || "CNPJ não encontrado." });
        }
      } catch {
        setCnpjStatus({ status: "invalid", message: "Falha na conexão." });
      }
    } else {
      setCnpjStatus({ status: "idle" });
    }
  };

  const handleSave = () => {
    if (!validateCNPJ(cnpj)) {
      toast.error("CNPJ inválido. Verifique o formato.");
      return;
    }
    toast.success('Dados salvos com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Dados da Empresa</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Gerencie informações cadastrais da sua empresa.</p>
      </div>

      <Card className="p-6 space-y-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Razão Social</label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none text-[var(--color-text-primary)]"
                placeholder="Razão Social"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Nome Fantasia</label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none text-[var(--color-text-primary)]"
                placeholder="Nome Fantasia"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center justify-between">
                CNPJ
                <span className="text-xs text-[var(--color-text-faint)]">
                  Receita Federal Sync
                </span>
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none text-[var(--color-text-primary)] font-mono"
                placeholder="00.000.000/0001-00"
              />
              <div className="min-h-[16px]">
                {cnpjStatus.status === "checking" && (
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" /> Buscando dados...
                  </p>
                )}
                {cnpjStatus.status === "active" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> CNPJ Ativo — dados preenchidos
                  </p>
                )}
                {cnpjStatus.status === "inactive" && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {cnpjStatus.message}
                  </p>
                )}
                {cnpjStatus.status === "invalid" && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {cnpjStatus.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Inscrição Estadual</label>
              <input type="text" className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none text-[var(--color-text-primary)]" placeholder="Opcional" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Endereço Completo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none text-[var(--color-text-primary)]"
              placeholder="Endereço Completo"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--color-border-default)] flex justify-end">
          <button onClick={handleSave} className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-sm font-medium text-white">
            Salvar Alterações
          </button>
        </div>
      </Card>
    </div>
  );
}
