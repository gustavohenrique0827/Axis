-- Allow anon and authenticated roles to read and write reunioes
-- The app uses the anon key, so RLS must permit all operations

ALTER TABLE IF EXISTS reunioes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reunioes_open_access" ON reunioes;

CREATE POLICY "reunioes_open_access"
  ON reunioes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
