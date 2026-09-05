import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  UserPlus, 
  Download, 
  Mail, 
  Phone, 
  Clock, 
  Inbox,
  ShieldCheck
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { exportToCSV } from "../../lib/exportCsv";
import { toast } from "sonner";
import { BookingModal } from "./components/BookingModal";
import { useNavigate } from "react-router-dom";

export default function Pacientes() {
  const { appointments, leads, addTask, addAppointment } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const patientsList = useMemo(() => {
    const map = new Map<string, any>();
    
    // Sort appointments chronologically
    const sorted = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(a => {
      const name = a.patient;
      if (!name) return;
      
      const isNew = !map.has(name);
      if (isNew) {
        map.set(name, {
          id: a.id,
          name: name,
          phone: a.phone || '(Sem telefone)',
          lastVisit: a.date,
          status: 'Ativo',
          plan: 'Particular',
          photo: name.substring(0, 2).toUpperCase(),
          visits: 1,
          firstVisit: a.date
        });
      } else {
        const existing = map.get(name);
        existing.lastVisit = a.date;
        existing.visits++;
        existing.phone = a.phone || existing.phone;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [appointments]);

  const filteredPatients = patientsList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const totalPatients = patientsList.length;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const newThisMonth = patientsList.filter(p => p.firstVisit && p.firstVisit.startsWith(currentMonth)).length;
  const today = new Date().toISOString().split('T')[0];
  const consultsToday = appointments.filter(a => a.date === today).length;
  const retention = totalPatients > 0 
    ? Math.round((patientsList.filter(p => p.visits > 1).length / totalPatients) * 100)
    : 0;

  return (
    <PageContainer 
      title="Gestão de Pacientes" 
      description="Base centralizada de pacientes, históricos de atendimento e dados cadastrais."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={() => {
              if (filteredPatients.length === 0) return toast.error("Nenhum dado para exportar");
              exportToCSV(filteredPatients, "Pacientes_SPY");
              toast.success("Download iniciado!");
            }}
            variant="outline" 
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Base
          </Button>

          <Button
            onClick={() => setIsBookingOpen(true)}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" /> Novo Paciente
          </Button>
        </div>
      }
    >
      <div className="max-w-[1500px] mx-auto space-y-6 pb-12">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Pacientes', value: totalPatients.toString(), icon: Users, color: 'text-[var(--color-primary-blue)]' },
            { label: 'Novos neste Mês', value: `+${newThisMonth}`, icon: UserPlus, color: 'text-emerald-500' },
            { label: 'Taxa de Retenção', value: `${retention}%`, icon: ShieldCheck, color: 'text-purple-500' },
            { label: 'Consultas Hoje', value: consultsToday.toString(), icon: Clock, color: 'text-amber-500' },
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

        {/* Filter & Search */}
        <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone do paciente..."
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] py-2 pl-10 pr-4 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Patients Grid */}
        {patientsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-50">
            <Inbox className="w-10 h-10 text-[var(--color-text-faint)]" />
            <p className="text-xs font-bold text-[var(--color-text-muted)] text-center">
              Nenhum paciente cadastrado.<br/>Os pacientes aparecerão aqui conforme as consultas forem agendadas.
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-text-muted)] text-xs font-bold">
            Nenhum paciente encontrado para a busca.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPatients.map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/40 transition-all group shadow-sm">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-blue)]/10 border border-[var(--color-primary-blue)]/20 flex items-center justify-center text-sm font-black text-[var(--color-primary-blue)] shrink-0">
                        {patient.photo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{patient.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="success">● {patient.status}</Badge>
                          <span className="text-[10px] text-[var(--color-text-faint)]">{patient.visits} atendimento(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase">Última Consulta</p>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-primary)] font-mono">
                          <Calendar className="w-3 h-3 text-[var(--color-primary-blue)]" /> 
                          {patient.lastVisit}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase">Telefone</p>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]">
                          <Phone className="w-3 h-3 text-emerald-500" /> {patient.phone}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/app/clinica/prontuarios')}
                        className="flex-1 text-xs font-bold gap-1.5 h-8"
                      >
                        <FileText className="w-3.5 h-3.5" /> Prontuário
                      </Button>
                      <Button 
                        variant="subtle" 
                        size="sm"
                        onClick={() => toast.info(`Contato: ${patient.phone}`)}
                        className="h-8 w-8 p-0"
                        title="Ligar"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        leads={leads} 
        addTask={addTask} 
        addAppointment={addAppointment} 
      />
    </PageContainer>
  );
}
