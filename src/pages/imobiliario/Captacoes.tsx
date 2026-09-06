import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardList, Plus, Search, MapPin, DollarSign,
  User, CheckCircle2, Clock, ArrowRight
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function Captacoes() {
  const [search, setSearch] = useState("");
  const [captacoes, setCaptacoes] = useState([
    { id: "1", endereco: "Av. Faria Lima, 1400 - Itaim Bibi", tipo: "Apartamento", valorPretendido: 1850000, corretor: "Gustavo Henrique", status: "Em Avaliação", data: "04/09/2026" },
    { id: "2", endereco: "Rua Oscar Freire, 820 - Jardins", tipo: "Comercial", valorPretendido: 3400000, corretor: "Mariana Costa", status: "Contrato de Posse", data: "02/09/2026" },
    { id: "3", endereco: "Alameda Santos, 900 - Cerqueira César", tipo: "Cobertura", valorPretendido: 4200000, corretor: "Felipe Ramos", status: "Fotos & Vistoria", data: "30/08/2026" },
  ]);

  return (
    <PageContainer
      title="Captações de Imóveis"
      description="Esteira de entrada, avaliação de mercado, documentação e inclusão de novos imóveis ao portfólio."
      actions={
        <Button onClick={() => toast.info("Para cadastrar uma nova captação, registre o imóvel ou envie o link de pré-cadastro ao proprietário.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Captação
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Captações Ativas</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{captacoes.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">VGV Pretendido em Captação</span>
          <div className="text-2xl font-black text-amber-500">
            R$ {(captacoes.reduce((s, c) => s + c.valorPretendido, 0) / 1e6).toFixed(1)}M
          </div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Taxa de Conclusão</span>
          <div className="text-2xl font-black text-emerald-500">85%</div>
        </Card>
      </div>

      <div className="space-y-3">
        {captacoes.map(c => (
          <div key={c.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">{c.endereco}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                  {c.tipo}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Pretensão: <strong className="text-[var(--color-text-primary)]">R$ {c.valorPretendido.toLocaleString("pt-BR")}</strong> • Corretor: {c.corretor}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                {c.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toast.success("Avançar etapa de captação.")} className="h-8 text-xs font-bold rounded-xl">
                Avançar Etapa
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
