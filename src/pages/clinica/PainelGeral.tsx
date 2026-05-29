import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { 
  Calendar, Users, Clock, Stethoscope, 
  TrendingUp, AlertCircle, Heart, Activity,
  ArrowUpRight, ArrowDownRight, UserPlus,
  ClipboardList, Star, Pill, Briefcase,
  Search, X, ChevronDown, Check,
  Plus, ShieldCheck, Zap, MoreVertical
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";

const clinicData = [
  { name: 'Seg', consultas: 42, noShow: 4, receita: 8400 },
  { name: 'Ter', consultas: 56, noShow: 8, receita: 11200 },
  { name: 'Qua', consultas: 38, noShow: 2, receita: 7600 },
  { name: 'Qui', consultas: 50, noShow: 5, receita: 10000 },
  { name: 'Sex', consultas: 68, noShow: 12, receita: 13600 },
  { name: 'Sáb', consultas: 24, noShow: 1, receita: 4800 },
];

const capacityData = [
  { name: 'Consultórios', value: 85, fill: '#10b981' },
  { name: 'Exames', value: 42, fill: '#3b82f6' },
  { name: 'Espera', value: 24, fill: '#f59e0b' },
];

const specialtyData = [
  { name: 'Cardiologia', value: 35, color: '#3b82f6' },
  { name: 'Dermatologia', value: 25, color: '#10b981' },
  { name: 'Ginecologia', value: 20, color: '#8b5cf6' },
  { name: 'Outros', value: 20, color: '#64748b' },
];

const doctors = [
  { id: '1', name: 'Dr. Ricardo Silva', bio: 'Cardiologia Avançada', specialty: 'Cardiologia' },
  { id: '2', name: 'Dra. Marina Costa', bio: 'Dermatologia Clínica', specialty: 'Dermatologia' },
  { id: '3', name: 'Dr. Pedro Santos', bio: 'Ginecologia e Obstetrícia', specialty: 'Ginecologia' },
  { id: '4', name: 'Dra. Elena Ramos', bio: 'Pediatria e Hebiatria', specialty: 'Ginecologia' },
];

export default function ClinicasDashboard() {
  const { leads, addTask } = useData();
  const [view, setView] = useState<'geral' | 'unidades' | 'operacional'>('geral');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Booking Form State
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const filteredPatients = useMemo(() => {
    if (!searchPatient) return [];
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchPatient.toLowerCase())
    ).slice(0, 5);
  }, [leads, searchPatient]);

  const selectedPatient = leads.find(l => l.id === selectedPatientId);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !bookingDate || !bookingTime) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctorId);
    
    addTask({
      title: `Consulta: ${selectedSpecialty} - ${doctor?.name}`,
      related: selectedPatient?.name || 'Paciente Externo',
      type: 'Consulta',
      date: `${bookingDate}, ${bookingTime}`,
      status: 'Em Aberto',
      priority: 'Alta',
      tags: ['Clínica', selectedSpecialty]
    });

    toast.success('Consulta agendada com sucesso!');
    setIsBookingOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedPatientId(null);
    setSearchPatient('');
    setSelectedSpecialty('');
    setSelectedDoctorId('');
    setBookingDate('');
    setBookingTime('');
  };

  return (
    <PageContainer 
      title="Gestão de Clínicas Axis" 
      description="Monitoramento clínico, eficiência operacional e jornada do paciente em tempo real."
      actions={
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-10 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
          <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1 gap-1">
             {['geral', 'unidades', 'operacional'].map(t => (
               <button 
                 key={t}
                 onClick={() => setView(t as any)}
                 className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                   view === t ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Vital Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Consultas (Mês)", value: "1.240", trend: "+8.2%", icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
             { label: "Revenue (Projection)", value: "R$ 242k", trend: "+12.4%", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
             { label: "Pacientes Ativos", value: "8.420", trend: "+154", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
             { label: "NPS Paciente", value: "9.2", trend: "0.1", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl group overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                   <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} bg-white/5 px-2 py-1 rounded-full`}>
                      {stat.trend}
                   </span>
                </div>
                <div className="mt-6 relative z-10">
                   <h3 className="text-3xl font-black text-white font-mono tracking-tighter italic">{stat.value}</h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <stat.icon className="w-24 h-24 text-white" />
                </div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Agenda Analytics */}
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-400" /> Fluxo de Atendimento
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Análise volumétrica e taxa de conversão em procedimentos.</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[9px] text-slate-400 font-bold uppercase">Compareceu</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-rose-500" />
                       <span className="text-[9px] text-slate-400 font-bold uppercase">No-Show</span>
                    </div>
                 </div>
              </div>
              <div className="h-[320px] -mx-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={clinicData}>
                       <defs>
                          <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                       <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                         itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="consultas" stroke="#10b981" fillOpacity={1} fill="url(#colorConsultas)" strokeWidth={4} />
                       <Area type="step" dataKey="noShow" stroke="#f43f5e" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" fill="#f43f5e" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Live Capacity Wheel */}
           <Card className="p-8 bg-[#111827]/80 border-white/5 flex flex-col items-center justify-center">
              <h3 className="text-[10px] font-black text-slate-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2 w-full">
                 <Zap className="w-4 h-4 text-amber-400" /> Ocupação em Tempo Real
              </h3>
              <div className="h-[280px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                       cx="50%" cy="50%" 
                       innerRadius="30%" outerRadius="100%" 
                       barSize={12} 
                       data={capacityData} 
                       startAngle={180} endAngle={0}
                    >
                       <RadialBar
                         background
                         dataKey="value"
                         cornerRadius={10}
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                       />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none">
                    <span className="text-4xl font-black text-white font-mono tracking-tighter">72<span className="text-xl text-slate-600">%</span></span>
                    <span className="text-[9px] text-slate-500 font-black uppercase">Global Load</span>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4">
                 {capacityData.map((c, i) => (
                    <div key={i} className="text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{c.name}</p>
                       <p className="text-sm font-black text-white">{c.value}%</p>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
           {/* Top Doctors / Producers */}
           <Card className="lg:col-span-3 p-8 bg-[#111827]/80 border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Ranking de Performance Clínica
                 </h3>
                 <span className="text-[10px] text-slate-500 font-black uppercase italic">MIA Performance Audit</span>
              </div>
              <div className="space-y-4">
                 {[
                   { name: "Dr. Ricardo Silva", esp: "Cardiologia", revenue: "R$ 42.500", patients: 142, load: 92, trend: "+5%" },
                   { name: "Dra. Marina Costa", esp: "Dermatologia", revenue: "R$ 38.200", patients: 115, load: 78, trend: "+12%" },
                   { name: "Dr. Pedro Santos", esp: "Ginecologia", revenue: "R$ 29.150", patients: 88, load: 65, trend: "-2%" },
                 ].map((dr, i) => (
                    <div key={i} className="grid grid-cols-5 items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                       <div className="col-span-2 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-emerald-400 transition-colors">
                             {dr.name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-black text-white">{dr.name}</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase italic">{dr.esp}</p>
                          </div>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Faturamento</p>
                          <p className="text-sm font-black text-white font-mono">{dr.revenue}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Pacientes</p>
                          <p className="text-sm font-black text-white font-mono">{dr.patients}</p>
                       </div>
                       <div className="text-right px-4">
                          <div className="flex items-center justify-end gap-2 mb-1">
                             <span className="text-[9px] font-black text-white">{dr.load}%</span>
                             <span className={`text-[9px] font-bold ${dr.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{dr.trend}</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full ${dr.load > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${dr.load}%` }} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           {/* Retention / Loyalty */}
           <Card className="p-8 bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                 <Heart className="w-20 h-20 text-purple-400" />
              </div>
              <div>
                 <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em] mb-6">Patient Loyalty Index</h3>
                 <div className="text-5xl font-black text-white font-mono italic tracking-tighter">84<span className="text-xl text-slate-600">%</span></div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 leading-relaxed">Taxa de retorno de pacientes crônicos vinculados.</p>
              </div>
              <Button variant="outline" className="w-full border-purple-500/20 text-[10px] font-black h-12 rounded-2xl hover:bg-purple-500/10 mt-10">
                 Gerenciar Recalls ↗
              </Button>
           </Card>
        </div>

        {/* AI Clinic Insights & Recent Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
           <Card className="p-8 bg-gradient-to-br from-[#10b981]/10 to-transparent border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform">
                 <ShieldCheck className="w-20 h-20 text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4" /> Inteligência Operacional MIA
              </h4>
              <div className="space-y-4">
                 {[
                   { title: "No-Show Alert", desc: "Aumento de 14% às terças-feiras detectado.", action: "WhatsApp Auto-Confirm" },
                   { title: "Capacity Warning", desc: "Setor de Exames atingindo 95% de carga na sexta.", action: "Abrir Sala 04" },
                 ].map((insight, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl group/item hover:bg-white/10 transition-all">
                       <h5 className="text-[13px] font-black text-white mb-1">{insight.title}</h5>
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{insight.desc}</p>
                       <Button className="h-8 bg-emerald-600 text-[9px] font-black px-4 rounded-xl">{insight.action}</Button>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 bg-[#111827]/80 border-white/5 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Jornada do Paciente (Live)</h4>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-black uppercase">Tracking Ativo</span>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { name: "João Pereira", step: "Finalizado", dr: "Ricardo Silva", time: "14:20", color: "bg-emerald-500" },
                   { name: "Maria Silva", step: "Em Atendimento", dr: "Marina Costa", time: "15:45", color: "bg-blue-500" },
                   { name: "Carlos Ramos", step: "Em Espera", dr: "Pedro Santos", time: "16:00", color: "bg-amber-500" },
                   { name: "Ana Beatriz", step: "Triagem", dr: "Enfermagem", time: "16:15", color: "bg-purple-500" },
                 ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-1 h-10 rounded-full ${p.color}`} />
                          <div>
                             <p className="text-sm font-black text-white">{p.name}</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                                {p.dr} <span className="w-1 h-1 rounded-full bg-white/10" /> {p.time}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-tighter ${p.color.replace('bg-', 'text-')}`}>{p.step}</p>
                          <MoreVertical className="w-4 h-4 text-slate-600 mt-1 ml-auto" />
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsBookingOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#0B1120] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 bg-gradient-to-br from-emerald-600/20 to-transparent border-b border-white/5">
                 <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Novo Agendamento</h2>
                    <button onClick={() => setIsBookingOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Fluxo de Agendamento Inteligente Axis</p>
              </div>

              <form onSubmit={handleBooking} className="p-8 space-y-6">
                 {/* Patient Selection */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Selecione o Paciente</label>
                    <div className="relative">
                       {!selectedPatientId ? (
                         <>
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                           <input 
                             type="text"
                             value={searchPatient}
                             onChange={(e) => setSearchPatient(e.target.value)}
                             placeholder="Pesquisar na base de pacientes..."
                             className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                           />
                           {filteredPatients.length > 0 && (
                             <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                                {filteredPatients.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPatientId(p.id);
                                      setSearchPatient('');
                                    }}
                                    className="w-full p-4 hover:bg-white/10 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
                                  >
                                     <div className="text-left">
                                        <p className="text-sm font-black text-white">{p.name}</p>
                                        <p className="text-[10px] text-slate-500">{p.email || p.phone}</p>
                                     </div>
                                     <ChevronDown className="w-4 h-4 text-slate-600 -rotate-90" />
                                  </button>
                                ))}
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-inner">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/40">{selectedPatient?.name[0]}</div>
                               <div>
                                  <p className="text-sm font-black text-white">{selectedPatient?.name}</p>
                                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Paciente Verificado</p>
                               </div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatientId(null)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Specialty & Doctor */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Especialidade</label>
                       <div className="relative">
                          <select 
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-4 text-xs font-black text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                          >
                             <option value="">Selecione...</option>
                             <option value="Cardiologia">Cardiologia</option>
                             <option value="Dermatologia">Dermatologia</option>
                             <option value="Ginecologia">Ginecologia</option>
                             <option value="Pediatria">Pediatria</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Médico Responsável</label>
                       <div className="relative">
                          <select 
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-4 text-xs font-black text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                          >
                             <option value="">Selecione...</option>
                             {doctors.filter(d => !selectedSpecialty || d.specialty === selectedSpecialty).map(d => (
                               <option key={d.id} value={d.id}>{d.name}</option>
                             ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 {/* Date & Time */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Data da Consulta</label>
                       <input 
                         type="date"
                         value={bookingDate}
                         onChange={(e) => setBookingDate(e.target.value)}
                         className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-4 text-xs font-black text-white focus:outline-none invert brightness-200 cursor-pointer"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Horário</label>
                       <input 
                         type="time"
                         value={bookingTime}
                         onChange={(e) => setBookingTime(e.target.value)}
                         className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl px-4 text-xs font-black text-white focus:outline-none invert brightness-200 cursor-pointer"
                       />
                    </div>
                 </div>

                 <Button 
                   type="submit"
                   className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                 >
                    Confirmar Agendamento <Check className="ml-2 w-5 h-5" />
                 </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
