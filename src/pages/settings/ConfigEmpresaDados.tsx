import React, { useState, useEffect } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { formatCNPJ, validateCNPJ } from "../../lib/utils";
import { CheckCircle2, AlertTriangle, Building2, Save, Globe, Mail, Phone, MapPin } from "lucide-react";
import { useData } from "../../contexts/DataContext";

type CnpjStatus = "idle" | "checking" | "active" | "inactive" | "invalid";

interface EmpresaDados {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  emailContato: string;
  telefoneContato: string;
  website: string;
}

const SETTING_KEY = "empresa_dados";

const DEFAULT_EMPRESA: EmpresaDados = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  endereco: "",
  emailContato: "",
  telefoneContato: "",
  website: "",
};

export default function ConfigEmpresaDados() {
  const { appSettings, saveAppSetting } = useData();
  const [empresa, setEmpresa] = useState<EmpresaDados>(DEFAULT_EMPRESA);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata uma única vez quando os dados reais do tenant chegam do Supabase
  // (appSettings começa vazio até o fetch inicial do DataContext resolver).
  useEffect(() => {
    if (hydrated) return;
    const saved = appSettings?.[SETTING_KEY];
    if (saved) { setEmpresa(saved); setHydrated(true); }
  }, [appSettings, hydrated]);

  const [cnpjStatus, setCnpjStatus] = useState<{ status: CnpjStatus; message?: string }>({ status: "idle" });
  const [isSaving, setIsSaving] = useState(false);

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setEmpresa((prev) => ({ ...prev, cnpj: formatted }));
    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 14) {
      setCnpjStatus({ status: "checking" });
      try {
        const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
        if (resp.ok) {
          const data = await resp.json();
          const isActive = data.situacao_cadastral === 2;
          setCnpjStatus({ status: isActive ? "active" : "inactive", message: data.descricao_situacao_cadastral });
          
          setEmpresa((prev) => {
            const parts = [
              data.logradouro && data.numero ? `${data.logradouro}, ${data.numero}` : data.logradouro,
              data.bairro,
              data.municipio && data.uf ? `${data.municipio} - ${data.uf}` : "",
              data.cep ? `CEP ${data.cep}` : "",
            ].filter(Boolean);

            const next = {
              ...prev,
              razaoSocial: data.razao_social || prev.razaoSocial,
              nomeFantasia: data.nome_fantasia || data.razao_social || prev.nomeFantasia,
              emailContato: data.email || prev.emailContato,
              telefoneContato: data.ddd_telefone_1 || prev.telefoneContato,
              endereco: parts.length ? parts.join(", ") : prev.endereco,
            };
            return next;
          });
          toast.success("Dados sincronizados com a Receita Federal!");
        } else {
          const err = await resp.json().catch(() => ({}));
          setCnpjStatus({ status: "invalid", message: err.message || "CNPJ não encontrado." });
        }
      } catch {
        setCnpjStatus({ status: "invalid", message: "Falha na conexão com a Receita." });
      }
    } else {
      setCnpjStatus({ status: "idle" });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!empresa.nomeFantasia.trim()) {
      toast.error("O Nome Fantasia é obrigatório.");
      return;
    }

    setIsSaving(true);
    await saveAppSetting(SETTING_KEY, empresa);
    setIsSaving(false);
    toast.success("Dados da empresa salvos e atualizados com sucesso!");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
            Dados da Empresa <Building2 className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gerencie informações cadastrais, fiscais e de contato da sua organização.</p>
        </div>
        <Button 
          onClick={() => handleSave()} 
          disabled={isSaving} 
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs shrink-0"
        >
          <Save className="w-3.5 h-3.5" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card className="p-6 space-y-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">Razão Social *</label>
              <input
                type="text"
                value={empresa.razaoSocial}
                onChange={(e) => setEmpresa({ ...empresa, razaoSocial: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-medium"
                placeholder="Razão Social completa"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">Nome Fantasia *</label>
              <input
                type="text"
                value={empresa.nomeFantasia}
                onChange={(e) => setEmpresa({ ...empresa, nomeFantasia: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-medium"
                placeholder="Nome Fantasia da marca"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center justify-between">
                <span>CNPJ *</span>
                <span className="text-[10px] text-[var(--color-primary-blue)] font-mono">
                  Sync Automático BrasilAPI
                </span>
              </label>
              <input
                type="text"
                value={empresa.cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono transition-all"
                placeholder="00.000.000/0001-00"
                required
              />
              <div className="min-h-[16px]">
                {cnpjStatus.status === "checking" && (
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-blue)] animate-pulse" /> Buscando dados na Receita...
                  </p>
                )}
                {cnpjStatus.status === "active" && (
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CNPJ Ativo — dados preenchidos
                  </p>
                )}
                {cnpjStatus.status === "inactive" && (
                  <p className="text-xs text-amber-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {cnpjStatus.message}
                  </p>
                )}
                {cnpjStatus.status === "invalid" && (
                  <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {cnpjStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)]">Inscrição Estadual (IE)</label>
              <input 
                type="text" 
                value={empresa.inscricaoEstadual}
                onChange={(e) => setEmpresa({ ...empresa, inscricaoEstadual: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono transition-all" 
                placeholder="000.000.000.000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[var(--color-text-faint)]" /> E-mail de Contato
              </label>
              <input
                type="email"
                value={empresa.emailContato}
                onChange={(e) => setEmpresa({ ...empresa, emailContato: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-medium"
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[var(--color-text-faint)]" /> Telefone / SAC
              </label>
              <input
                type="text"
                value={empresa.telefoneContato}
                onChange={(e) => setEmpresa({ ...empresa, telefoneContato: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-mono"
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[var(--color-text-faint)]" /> Website Institucional
              </label>
              <input
                type="url"
                value={empresa.website}
                onChange={(e) => setEmpresa({ ...empresa, website: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-medium"
                placeholder="https://suaempresa.com.br"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[var(--color-text-faint)]" /> Endereço Completo
            </label>
            <input
              type="text"
              value={empresa.endereco}
              onChange={(e) => setEmpresa({ ...empresa, endereco: e.target.value })}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all font-medium"
              placeholder="Logradouro, Número - Bairro, Cidade - UF, CEP"
            />
          </div>

          <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="h-9 px-5 text-xs font-bold gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
