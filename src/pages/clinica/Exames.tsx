import React, { useState } from 'react';
import {
  FileText, Search, FlaskConical,
  Clock, CheckCircle2, AlertCircle, Download,
  Eye, Plus, X, Check
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useExames } from './hooks/useExames';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV } from '../../lib/exportCsv';

export default function Exames() {
  const { exames: examList, addExame } = useExames();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [examName, setExamName] = useState('');
  const [labName, setLabName] = useState('Lab Vértice Central');
  const [examDate, setExamDate] = useState(new Date().toLocaleDateString('pt-BR'));

  const filteredExames = examList.filter(e => 
    e.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.lab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !examName.trim()) {
      toast.error("Preencha o nome do paciente e o exame.");
      return;
    }

    addExame({
      patient: patientName.trim(),
      exam: examName.trim(),
      lab: labName,
      date: examDate,
    });

    setIsAddModalOpen(false);
    setPatientName('');
    setExamName('');
  };

  return (
    <PageContainer 
      title="Exames & Laboratório" 
      description="Gerencie pedidos de exames laboratoriais e acompanhe o status de cada resultado."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (filteredExames.length === 0) { toast.error("Nenhum pedido para exportar."); return; }
              exportToCSV(filteredExames, "Exames_SPY");
              toast.success("Lote de exames exportado!");
            }}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Lote
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
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
            { label: "Pedidos Hoje", value: examList.length.toString(), icon: FlaskConical, color: "text-[var(--color-primary-blue)]" },
            { label: "Resultados Prontos", value: examList.filter(e => e.status === 'Finalizado').length.toString(), icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Em Análise", value: examList.filter(e => e.status === 'Em Análise').length.toString(), icon: Clock, color: "text-amber-500" },
            { label: "Aguardando Coleta", value: examList.filter(e => e.status === 'Aguardando Coleta').length.toString(), icon: AlertCircle, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</span>
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
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary-blue)]" /> Histórico de Pedidos
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar exame ou paciente..." 
                  className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] py-1.5 pl-9 pr-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50">
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Paciente</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Exame</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Data</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {filteredExames.map((exam) => (
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
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              if (exam.result && exam.result !== "-") toast.info(`Resultado de ${exam.patient}: ${exam.result}`);
                              else toast.info(`${exam.patient} ainda não possui resultado lançado.`);
                            }}
                            className="h-7 w-7 p-0 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExames.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-[var(--color-text-muted)] italic">
                        Nenhum pedido de exame encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Lab Integration Section */}
          <div className="space-y-4">
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[var(--color-primary-blue)]" /> Integração com Laboratórios
              </h3>
              <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Fluxo Automatizado</p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                  Laudos liberados pelos laboratórios conveniados são automaticamente vinculados ao prontuário eletrônico do paciente.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">Protocolos Conectados</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-lg text-center">
                    <p className="text-xs font-bold text-[var(--color-primary-blue)]">HL7 / FHIR</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Ativo</p>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-lg text-center">
                    <p className="text-xs font-bold text-emerald-500">DICOM</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">Imagens</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Modal: Novo Pedido de Exame */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-panel)] overflow-hidden shadow-2xl z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[var(--color-primary-blue)]" />
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Novo Pedido de Exame</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateExame} className="p-5 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Nome do Paciente *</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome completo do paciente"
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Exame Solicitado *</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="Ex: Hemograma Completo, Ultrassom Abdominal"
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Laboratório / Clínica</label>
                    <select
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-2.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-medium"
                    >
                      <option value="Lab Vértice Central">Lab Vértice Central</option>
                      <option value="Imobiliz Imagem">Imobiliz Imagem</option>
                      <option value="CardioClin">CardioClin</option>
                      <option value="Fleury / Conveniado">Fleury / Conveniado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Data da Solicitação</label>
                    <input
                      type="text"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-9 px-4 text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-xs font-bold shadow-xs gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Criar Pedido
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
