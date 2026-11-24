CREATE TABLE IF NOT EXISTS public.catalogo_eps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalogo_eps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalogo_eps_select_authenticated"
  ON public.catalogo_eps FOR SELECT
  TO authenticated
  USING (true);;
