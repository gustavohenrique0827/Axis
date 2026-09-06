import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Users, Plus, Search, Phone, Mail, Home,
  Building2, MessageSquare, Trash2
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function Proprietarios() {
  const [search, setSearch] = useState("");
  const [proprietarios, setProprietarios] = useState([
    { id: "1", nome: "Roberto Albuquerque", telefone: "(11) 98765-1122", email: "roberto.albuquerque@email.com", imoveisCount: 3, tipo: "Pessoa Física", status: "Ativo" },
    { id: "2", nome: "Patrícia Menezes", telefone: "(11) 97654-2233", email: "patricia.menezes@email.com", imoveisCount: 1, tipo: "Pessoa Física", status: "Ativo" },
    { id: "3", nome: "Holdings Alpha Imóveis Ltda", telefone: "(11) 3344-5566", email: "contato@alphaimoveis.com.br", imoveisCount: 8, tipo: "Pessoa Jurídica", status: "Ativo" },
    { id: "4", nome: "Carlos Eduardo Vieira", telefone: "(11) 96543-3344", email: "carlos.vieira@email.com", imoveisCount: 2, tipo: "Pessoa Física", status: "Ativo" },
  ]);

  const filtered = proprietarios.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Gestão de Proprietários"
      description="Cadastro, documentos de posse e imóveis vinculados a locadores e proprietários vendedores."
      actions={
        <Button onClick={() => toast.info("Cadastro de proprietários disponível no formulário do imóvel ou novo cadastro.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Proprietário
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: "Total de Proprietários", val: proprietarios.length, color: "text-blue-500" },
          { icon: Home, label: "Imóveis Vinculados", val: proprietarios.reduce((s, p) => s + p.imoveisCount, 0), color: "text-emerald-500" },
          { icon: Building2, label: "Pessoas Jurídicas", val: proprietarios.filter(p => p.tipo === "Pessoa Jurídica").length, color: "text-purple-500" },
          { icon: Phone, label: "Contatos com WhatsApp", val: proprietarios.length, color: "text-amber-500" },
        ].map((k, i) => (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-xl font-black text-[var(--color-text-primary)]">{k.val}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Proprietário</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Imóveis no Portfólio</th>
                <th className="px-4 py-3">Contato Direto</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-[var(--color-text-primary)]">{p.nome}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{p.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{p.tipo}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--color-primary-blue)]">
                    {p.imoveisCount} imóvel(is)
                  </td>
                  <td className="px-4 py-3.5">
                    <a
                      href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold transition-all text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {p.telefone}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toast.success(`Histórico de ${p.nome} carregado.`)}
                      className="px-3 py-1 rounded-lg bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-xs font-bold transition-all"
                    >
                      Ver Portfólio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
