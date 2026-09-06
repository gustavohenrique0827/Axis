-- Expande a tabela cliente_contatos para suportar perfil completo de decisores:
-- departamento, papel na decisão, whatsapp e observações, conforme
-- especificado no Item 12 do S.P.Y. Master.

alter table public.cliente_contatos
  add column if not exists departamento text,
  add column if not exists papel_decisao text,
  add column if not exists whatsapp text,
  add column if not exists observacoes text;
