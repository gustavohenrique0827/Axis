ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'Geral';
ALTER TABLE public.squads ADD COLUMN IF NOT EXISTS leader      TEXT DEFAULT '';

ALTER TABLE public.squads DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.squads TO anon, authenticated;
