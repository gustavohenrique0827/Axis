import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ChevronDown, Check } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: any[];
  addTask: (task: any) => void;
}

const doctors = [
  { id: '1', name: 'Dr. Ricardo Silva', bio: 'Cardiologia Avançada', specialty: 'Cardiologia' },
  { id: '2', name: 'Dra. Marina Costa', bio: 'Dermatologia Clínica', specialty: 'Dermatologia' },
  { id: '3', name: 'Dr. Pedro Santos', bio: 'Ginecologia e Obstetrícia', specialty: 'Ginecologia' },
  { id: '4', name: 'Dra. Elena Ramos', bio: 'Pediatria e Hebiatria', specialty: 'Ginecologia' },
];

export function BookingModal({ isOpen, onClose, leads, addTask }: BookingModalProps) {
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
    onClose();
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
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
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
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
  );
}
