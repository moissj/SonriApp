-- Enum de régimen de EPS
DO $$ BEGIN
  CREATE TYPE regimen_eps_enum AS ENUM ('contributivo', 'subsidiado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Quitar FK y tabla anterior (estaba vacía y sin uso)
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_eps_id_fkey;
DROP TABLE IF EXISTS public.catalogo_eps;

-- Catálogo de EPS por odontólogo (mismo patrón multi-tenant del resto del esquema)
CREATE TABLE public.catalogo_eps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  odontologo_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  regimen regimen_eps_enum NOT NULL DEFAULT 'contributivo',
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX catalogo_eps_odontologo_nombre_regimen_idx
  ON public.catalogo_eps (odontologo_id, lower(nombre), regimen);

CREATE INDEX catalogo_eps_odontologo_id_idx ON public.catalogo_eps (odontologo_id);

ALTER TABLE public.catalogo_eps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eps_select_own" ON public.catalogo_eps
  FOR SELECT TO authenticated USING (odontologo_id = auth.uid());
CREATE POLICY "eps_insert_own" ON public.catalogo_eps
  FOR INSERT TO authenticated WITH CHECK (odontologo_id = auth.uid());
CREATE POLICY "eps_update_own" ON public.catalogo_eps
  FOR UPDATE TO authenticated USING (odontologo_id = auth.uid()) WITH CHECK (odontologo_id = auth.uid());

-- Restaurar FK de pacientes.eps_id
ALTER TABLE public.pacientes
  ADD CONSTRAINT pacientes_eps_id_fkey FOREIGN KEY (eps_id)
  REFERENCES public.catalogo_eps(id) ON DELETE SET NULL;;
