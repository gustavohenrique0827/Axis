-- get_advisors (security) sinalizou search_path mutável em duas funções trigger.
-- Nenhuma é SECURITY DEFINER, então o risco prático é baixo, mas o fix é
-- mecânico e gratuito: fixar o search_path evita qualquer risco de shadowing
-- de função/tabela via search_path manipulado pelo role que dispara o trigger.

alter function public.set_updated_at() set search_path = public;
alter function public.sync_sprint_task_project_from_issue() set search_path = public;
