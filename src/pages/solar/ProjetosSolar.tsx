import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Sun, Plus, Search, Zap, CheckCircle2, Clock,
  FileText, Columns3, MapPin, DollarSign, ArrowRight
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ProjetosSolar() {
  const [projetos, setProjetos] = useState([
    { id: "1", cliente: "Fazenda Santa Maria", potenciaKwp: 45.8, geracaoMensalKwh: 5800, valorContrato: 185000, cidade: "Ribeirão Preto - SP", status: "Instalação", concessionaria: "CPFL Paulista" },
    { id: "2", cliente: "Supermercado CompreBem", potenciaKwp: 112.5, geracaoMensalKwh: 14500, valorContrato: 440000, cidade: "Campinas - SP", status: "Homologação", concessionaria: "CPFL Paulista" },
    { id: "3", cliente: "Residência Família Moreira", potenciaKwp: 8.4, geracaoMensalKwh: 1100, valorContrato: 38000, cidade: "São Paulo - SP", status: "Vistoria Concluída", concessionaria: "Enel SP" },
    { id: "4", cliente: "Galpão Logístico Alpha", potenciaKwp: 75.0, geracaoMensalKwh: 9800, valorContrato: 295000, cidade: "Sorocaba - SP", status: "Dimensionamento", concessionaria: "CPFL Piratininga" },
  ]);

  return (
    <PageContainer
      title="Projetos Fotovoltaicos"
      description="Gerenciamento de usinas solares, potência kWp, geração estimada e status de implantação."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/crm/pipeline?nicho=solar"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Columns3 className="w-3.5 h-3.5 text-amber-500" /> Ver Pipeline CRM
          </Link>
          <Button onClick={() => toast.info("Para cadastrar novo projeto, inicie pelo Dimensionamento ou crie a partir de um Lead no CRM.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Projeto
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Sun, label: "Projetos em Curso", val: projetos.length, color: "text-amber-500" },
          { icon: Zap, label: "Potência Total", val: `${projetos.reduce((s, p) => s + p.potenciaKwp, 0).toFixed(1)} kWp`, color: "text-blue-500" },
          { icon: DollarSign, label: "Volume Contratado", val: `R$ ${(projetos.reduce((s, p) => s + p.valorContrato, 0) / 1000).toFixed(0)}k`, color: "text-emerald-500" },
          { icon: CheckCircle2, label: "Geração Mensal Est.", val: `${(projetos.reduce((s, p) => s + p.geracaoMensalKwh, 0) / 1000).toFixed(1)} MWh`, color: "text-purple-500" },
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

      <div className="space-y-3">
        {projetos.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{p.cliente}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {p.potenciaKwp} kWp
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono">({p.concessionaria})</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Local: {p.cidade} • Geração Prevista: <strong className="text-emerald-500">{p.geracaoMensalKwh.toLocaleString("pt-BR")} kWh/mês</strong> • Contrato: R$ {p.valorContrato.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                {p.status}
              </span>
              <Link
                to="/app/energia-solar/dimensionamentos"
                className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-sunken)] hover:bg-amber-500/20 hover:text-amber-500 border border-[var(--color-border-default)] text-xs font-bold transition-all flex items-center gap-1"
              >
                Detalhes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
