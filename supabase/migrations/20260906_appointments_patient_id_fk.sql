-- Linka agendamentos (appointments) ao cadastro real de pacientes da Clínica
-- (tabela `pacientes`), permitindo que a Agenda Médica referencie um paciente
-- já cadastrado em vez de depender apenas do nome em texto livre. Nullable e
-- ON DELETE SET NULL: agendamentos de outros nichos (Educação, Imobiliário
-- etc. usam a mesma tabela `appointments`) continuam funcionando sem paciente
-- vinculado.

alter table public.appointments
  add column if not exists patient_id text references public.pacientes(id) on delete set null;
