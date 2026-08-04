import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  FileText, 
  Calendar, 
  UserPlus,
  Filter,
  Download,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Inbox
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { exportToCSV } from "../../lib/exportCsv";
import { toast } from "sonner";

export default function Pacientes() {
  const { appointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const patientsList = useMemo(() => {
    const map = new Map<string, any>();
    
    // Sort appointments chronologically to find first/last visits easily
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
          plan: 'Particular', // Ou derivado de category
          photo: name.substring(0, 2).toUpperCase(),
          visits: 1,
          firstVisit: a.date
        });
      } else {
        const existing = map.get(name);
        existing.lastVisit = a.date;
        existing.visits++;
        existing.phone = a.phone || existing.phone; // Update phone if available
      }
    });

    return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [appointments]);

  const filteredPatients = patientsList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const totalPatients = patientsList.length;
  // Pacientes novos este mês
  const currentMonth = new Date().toISOString().substring(0, 7);
  const newThisMonth = patientsList.filter(p => p.firstVisit && p.firstVisit.startsWith(currentMonth)).length;

  // Consultas hoje
  const today = new Date().toISOString().split('T')[0];
  const consultsToday = appointments.filter(a => a.date === today).length;

  const retention = totalPatients > 0 
    ? Math.round((patientsList.filter(p => p.visits > 1).length / totalPatients) * 100)
    : 0;

  return (
    <PageContainer 
      title="Gestão de Pacientes" 
      description="Base centralizada de prontuários, históricos e dados demográficos."
      actions={
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => {
              if (filteredPatients.length === 0) return toast.error("Nenhum dado para exportar");
              exportToCSV(filteredPatients, "Pacientes_Axis");
              toast.success("Download iniciado!");
            }}
            variant="outline" 
            className="h-11 rounded-2xl border-white/5 text-[10px] font-black uppercase tracking-widest gap-2"
          >
            <Download className="w-4 h-4" /> Exportar Base
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl shadow-emerald-900/30 group">
            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Novo Paciente
          </Button>
        </div>
      }
    >
      <div className="max-w-[1500px] mx-auto space-y-6 pb-10">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Total de Pacientes', value: totalPatients.toString(), icon: Users, color: 'text-indigo-500' },
             { label: 'Novos neste Mês', value: `+${newThisMonth}`, icon: UserPlus, color: 'text-emerald-500' },
             { label: 'Taxa de Retenção', value: `${retention}%`, icon: ShieldCheck, color: 'text-blue-500' },
             { label: 'Consultas Hoje', value: consultsToday.toString(), icon: Clock, color: 'text-amber-500' },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
             </Card>
           ))}
        </div>

        {/* Filter & Search */}
        <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border-white/5 backdrop-blur-xl">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome ou telefone..."
                   className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-white/5 text-slate-500 hover:text-white">
                    <Filter className="w-4 h-4" />
                 </Button>
                 <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
                    <button className="px-4 py-2 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">Todos</button>
                    <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Ativos</button>
                 </div>
              </div>
           </div>
        </Card>

        {/* Patients Grid */}
        {patientsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <Inbox className="w-12 h-12 text-slate-500" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
              Nenhum paciente cadastrado.<br/>Os pacientes aparecerão aqui conforme os agendamentos forem criados.
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">Nenhum paciente encontrado para a busca atual.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <AnimatePresence>
               {filteredPatients.map((patient, i) => (
                 <motion.div
                   key={patient.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                 >
                   <Card className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer relative overflow-hidden">
                      <div className="flex items-start gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                            {patient.photo}
                         </div>
                         <div className="flex-1">
                            <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate pr-4">{patient.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className={`text-[9px] font-black uppercase tracking-widest ${
                                 patient.status === 'Ativo' ? 'text-emerald-400' : 'text-slate-500'
                               }`}>● {patient.status}</span>
                            </div>
                         </div>
                         <button className="p-2 hover:bg-white/5 rounded-xl text-slate-600 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Última Consulta</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                               <Calendar className="w-3.5 h-3.5" /> 
                               {(() => {
                                  try {
                                    const d = new Date(patient.lastVisit);
                                    if(isNaN(d.getTime())) return patient.lastVisit;
                                    return d.toLocaleDateString('pt-BR');
                                  } catch { return patient.lastVisit; }
                               })()}
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Telefone</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                               <Phone className="w-3.5 h-3.5 text-blue-400" /> {patient.phone}
                            </div>
                         </div>
                      </div>

                      <div className="mt-8 flex items-center gap-2">
                         <Button className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-[10px] font-black uppercase text-slate-300 hover:text-emerald-400 gap-2 transition-all">
                            <FileText className="w-4 h-4" /> Prontuário
                         </Button>
                         <Button variant="outline" className="w-11 h-11 p-0 rounded-xl border-white/5 text-slate-500 hover:text-white">
                            <Phone className="w-4 h-4" />
                         </Button>
                         <Button variant="outline" className="w-11 h-11 p-0 rounded-xl border-white/5 text-slate-500 hover:text-white">
                            <Mail className="w-4 h-4" />
                         </Button>
                      </div>

                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.05] transition-opacity -rotate-12 pointer-events-none">
                         <Users className="w-24 h-24" />
                      </div>
                   </Card>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
