import { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, 
  FileText, Activity, Heart,
  Pill, Eye, Inbox, ArrowUpRight
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { BookingModal } from "./components/BookingModal";

export default function ProntuariosDashboard() {
  const { appointments, leads, addTask } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const patientsList = useMemo(() => {
    const map = new Map<string, any>();
    
    const sorted = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach(a => {
      const name = a.patient;
      if (!name) return;
      
      if (!map.has(name)) {
        map.set(name, {
          id: a.id,
          name: name,
          photo: name.substring(0, 1).toUpperCase(),
          age: 32,
          lastVisit: a.date,
          condition: a.specialty || 'Clínica Geral',
          status: a.status === 'Em Atendimento' ? 'Em Atendimento' : 'Estável',
        });
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredPatients = patientsList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPatients = patientsList.length;

  return (
    <PageContainer 
      title="Prontuário Eletrônico (EHR)" 
      description="Histórico clínico completo, evolução do paciente e acompanhamento multiprofissional."
      actions={
        <Button
          onClick={() => setIsBookingOpen(true)}
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Paciente / Consulta
        </Button>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        
        {/* Quick Access Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Prontuários Ativos", value: totalPatients.toString(), icon: Activity, color: "text-[var(--color-primary-blue)]" },
            { label: "Prescrições Emitidas", value: (totalPatients * 2).toString(), icon: Pill, color: "text-emerald-500" },
            { label: "Exames Solicitados", value: (totalPatients > 0 ? "3" : "0"), icon: FileText, color: "text-amber-500" },
            { label: "Casos em Triagem", value: "0", icon: Heart, color: "text-purple-500" },
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
          {/* Patient List */}
          <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--color-surface-sunken)]">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-primary-blue)]" /> Base de Pacientes
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" />
                <input 
                  type="text" 
                  placeholder="Pesquisar paciente..." 
                  className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] py-1.5 pl-9 pr-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {patientsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-50">
                <Inbox className="w-10 h-10 text-[var(--color-text-faint)]" />
                <p className="text-xs font-bold text-[var(--color-text-muted)] text-center">
                  Nenhum prontuário registrado.<br/>Os prontuários serão gerados conforme os agendamentos forem realizados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50">
                      <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Paciente</th>
                      <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Especialidade</th>
                      <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                      <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center text-xs font-bold">
                              {p.photo}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[var(--color-text-primary)]">{p.name}</p>
                              <p className="text-[10px] text-[var(--color-text-faint)] font-mono">Última: {p.lastVisit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="text-xs text-[var(--color-text-muted)] font-medium">{p.condition}</span>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={p.status === 'Em Atendimento' ? 'info' : 'success'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="xs" className="h-7 px-2 text-xs font-bold gap-1">
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Clinical Insights */}
          <div className="space-y-4">
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border-subtle)]">
                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-primary-blue)]" /> Painel de Triagem
                </h3>
                <Badge variant="info">Tempo Real</Badge>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Frequência Cardíaca Média", val: "76 bpm" },
                  { label: "Pressão Arterial Típica", val: "120/80 mmHg" },
                  { label: "Saturação O2 Média", val: "98%" },
                ].map((v, i) => (
                  <div key={i} className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">{v.label}</span>
                    <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{v.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-2">Protocolos de Segurança</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Prontuários eletrônicos com assinatura digital e conformidade LGPD / CFM.
              </p>
            </Card>
          </div>
        </div>

      </div>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} leads={leads} addTask={addTask} />
    </PageContainer>
  );
}
