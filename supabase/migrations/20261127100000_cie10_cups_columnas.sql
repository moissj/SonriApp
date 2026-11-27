-- Plan 27: integrar CIE10 (diagnosticos) y CUPS (procedimientos) en los modulos clinicos.
-- ADITIVO e idempotente: columnas nulables con FK al catalogo. Cero perdida de datos.
-- RLS: sin policy nueva; las columnas heredan las policies tenant de su tabla
-- (odontologo_id = auth.uid() + public.is_cuenta_activa()). Reversible via DROP COLUMN.

-- Diagnostico codificado (1 principal) en la evolucion; convive con 'diagnostico' (texto libre).
alter table public.historias_clinicas
  add column if not exists cie10_codigo text references public.catalogo_cie10(codigo);

comment on column public.historias_clinicas.cie10_codigo is
  'Diagnostico principal CIE10 (FK catalogo_cie10). Nulable; el texto libre vive en diagnostico.';

-- Codigo de procedimiento CUPS por tratamiento del catalogo (1:1).
alter table public.tratamientos_catalogo
  add column if not exists cups_codigo text references public.catalogo_cups(codigo);

comment on column public.tratamientos_catalogo.cups_codigo is
  'Codigo de procedimiento CUPS (FK catalogo_cups). Nulable.';
