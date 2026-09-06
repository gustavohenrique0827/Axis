-- Auditoria do nicho Educação encontrou dois fluxos completamente quebrados
-- em produção, não apenas incompletos: tanto "Nova Turma" (NovaTurmaModal)
-- quanto "Nova Matrícula" (NovaMatriculaModal) tentam gravar campos que
-- nunca existiram nas tabelas (`turmas.progress`, `turmas.shift`,
-- `students.progress`, `students.grades`, `students.avatar`) — o INSERT
-- falha inteiro no Postgres (coluna inexistente) toda vez. O toast de
-- sucesso na tela aparecia de qualquer forma (não estava condicionado ao
-- resultado do insert), mascarando a falha; o erro real só ia pro console.
--
-- `turmas` e `students` estão vazias em produção — corrigido de forma
-- aditiva, sem dado a migrar/perder.

alter table public.turmas
  add column if not exists progress numeric not null default 0,
  add column if not exists shift text;

alter table public.students
  add column if not exists progress numeric not null default 0,
  add column if not exists grades jsonb not null default '[]'::jsonb,
  add column if not exists avatar text;
