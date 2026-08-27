import {
  FileText, Search, FlaskConical,
  Clock, CheckCircle2, AlertCircle, Download,
  Eye, Plus, Share2
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useExames } from './hooks/useExames';
import { toast } from 'sonner';

export default function Exames() {
  const { exames: examList } = useExames();

  return (
    <PageContainer 
      title="Exames & Laboratório" 
      description="Gerencie pedidos de exames laboratoriais, acompanhe laudos e integre com parceiros."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => toast.success("Lote de exames exportado com sucesso!")}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Lote
          </Button>
          <Button 
            onClick={() => toast.info("Novo pedido de exame aberto")}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Pedido
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
        
        {/* Status Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pedidos Hoje", value: "42", icon: FlaskConical, color: "text-[var(--color-primary-blue)]" },
            { label: "Resultados Prontos", value: "18", icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Em Análise", value: "12", icon: Clock, color: "text-amber-500" },
            { label: "Laudos Liberados", value: "35", icon: AlertCircle, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Exams Table */}
          <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--color-surface-sunken)]">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary-blue)]" /> Histórico de Pedidos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50">
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Paciente</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Exame</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Data</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {examList.map((exam) => (
                    <tr key={exam.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors">
                      <td className="p-3.5">
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">{exam.patient}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{exam.lab}</p>
                      </td>
                      <td className="p-3.5 text-xs text-[var(--color-text-primary)] font-medium">{exam.exam}</td>
                      <td className="p-3.5 text-xs text-[var(--color-text-muted)] font-mono">{exam.date}</td>
                      <td className="p-3.5">
                        <Badge 
                          variant={exam.status === 'Finalizado' ? 'success' : exam.status === 'Em Análise' ? 'info' : 'warning'} 
                        >
                          {exam.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={() => toast.info(`Visualizando laudo de ${exam.patient}`)} className="h-7 w-7 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => toast.success("Link do laudo compartilhado!")} className="h-7 w-7 p-0">
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Lab Integration Section */}
          <div className="space-y-4">
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[var(--color-primary-blue)]" /> Integração com Laboratórios
              </h3>
              <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Fluxo Automatizado</p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                  Laudos liberados pelos laboratórios conveniados são automaticamente vinculados ao prontuário eletrônico do paciente.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-black text-[var(--color-text-faint)] uppercase tracking-wider">Protocolos Conectados</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-lg text-center">
                    <p className="text-xs font-black text-[var(--color-primary-blue)]">HL7 / FHIR</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Ativo</p>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-lg text-center">
                    <p className="text-xs font-black text-emerald-500">DICOM</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Imagens</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
