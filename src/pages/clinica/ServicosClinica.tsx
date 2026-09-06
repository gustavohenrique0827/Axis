import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Stethoscope, Plus, Search, DollarSign, Clock,
  CheckCircle2, Tag
} from "lucide-react";
import { toast } from "sonner";

export default function ServicosClinica() {
  const [servicos, setServicos] = useState([
    { id: "1", nome: "Consulta Dermatológica Especializada", especialidade: "Dermatologia", duracao: "45 min", valorParticular: 350, convenios: "Amil, Bradesco, SulAmérica", status: "Ativo" },
    { id: "2", nome: "Eletrocardiograma (ECG) com Laudo", especialidade: "Cardiologia", duracao: "30 min", valorParticular: 180, convenios: "Todos os credenciados", status: "Ativo" },
    { id: "3", nome: "Procedimento Estético Facial (Bioestimulador)", especialidade: "Estética Avançada", duracao: "60 min", valorParticular: 1600, convenios: "Apenas Particular", status: "Ativo" },
    { id: "4", nome: "Consulta Ortopédica + Avaliação Postural", especialidade: "Ortopedia", duracao: "40 min", valorParticular: 320, convenios: "Amil, Unimed, Porto Seguro", status: "Ativo" },
  ]);

  return (
    <PageContainer
      title="Tabela de Procedimentos & Serviços"
      description="Cadastro de consultas, exames, procedimentos cirúrgicos e valores particulares/convênio."
      actions={
        <Button onClick={() => toast.info("Cadastro de novo procedimento clínico.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Novo Procedimento
        </Button>
      }
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Procedimento / Serviço</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Aceite de Convênio</th>
                <th className="px-5 py-3 text-right">Valor Particular</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {servicos.map(s => (
                <tr key={s.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-[var(--color-text-primary)]">{s.nome}</td>
                  <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{s.especialidade}</td>
                  <td className="px-4 py-3.5 font-mono text-[var(--color-text-muted)]">{s.duracao}</td>
                  <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">{s.convenios}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-500">
                    R$ {s.valorParticular.toFixed(2)}
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
