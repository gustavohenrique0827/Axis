import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ChevronDown, Check, Calendar } from 'lucide-react';
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-panel)] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[var(--color-text-primary)] uppercase tracking-tight">
                      Novo Agendamento Clínico
                    </h2>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                      Agende consultas e procedimentos médicos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-4">
              {/* Patient Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  Paciente <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  {!selectedPatientId ? (
                    <>
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
                      <input
                        type="text"
                        value={searchPatient}
                        onChange={(e) => setSearchPatient(e.target.value)}
                        placeholder="Buscar por nome ou e-mail do paciente..."
                        className="w-full h-10 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] pl-10 pr-4 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all"
                      />
                      {filteredPatients.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] overflow-hidden shadow-xl z-50 divide-y divide-[var(--color-border-subtle)]">
                          {filteredPatients.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(p.id);
                                setSearchPatient('');
                              }}
                              className="w-full p-3 hover:bg-[var(--color-surface-sunken)] flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent"
                            >
                              <div className="text-left">
                                <p className="text-xs font-bold text-[var(--color-text-primary)]">{p.name}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)]">{p.email || p.phone}</p>
                              </div>
                              <ChevronDown className="w-4 h-4 text-[var(--color-text-faint)] -rotate-90" />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-[var(--color-primary-blue)]/5 border border-[var(--color-primary-blue)]/20 rounded-[var(--radius-control)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-blue)] flex items-center justify-center text-white font-bold text-xs">
                          {selectedPatient?.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-primary)]">{selectedPatient?.name}</p>
                          <p className="text-[10px] text-[var(--color-primary-blue)] font-bold">Paciente Selecionado</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientId(null)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialty & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    Especialidade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full h-10 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Ginecologia">Ginecologia</option>
                    <option value="Pediatria">Pediatria</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    Médico Responsável <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full h-10 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {doctors.filter(d => !selectedSpecialty || d.specialty === selectedSpecialty).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    Data da Consulta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full h-10 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    Horário <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-10 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  className="w-full h-11 font-bold text-xs uppercase tracking-wider gap-2 shadow-xs"
                >
                  Confirmar Agendamento <Check className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
