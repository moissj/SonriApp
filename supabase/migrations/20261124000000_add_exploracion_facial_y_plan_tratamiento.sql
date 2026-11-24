-- Plan 17: completar examen de ingreso (secciones 7 y 9 del formato en papel).
-- Agrega a historia_clinica_inicial:
--   exploracion_facial (jsonb)  -> sección 7, exploración facial.
--   plan_tratamiento   (text)   -> sección 9, plan de tratamiento.
-- Nullable / default vacío: no rompe filas existentes. RLS sin cambios:
-- la policy odontologo_own_hci (FOR ALL) ya cubre las columnas nuevas.
--
-- Reversibilidad (sin backfill; pierde lo capturado en estas columnas):
--   alter table public.historia_clinica_inicial drop column if exists exploracion_facial;
--   alter table public.historia_clinica_inicial drop column if exists plan_tratamiento;

alter table public.historia_clinica_inicial
  add column if not exists exploracion_facial jsonb default '{}'::jsonb;

alter table public.historia_clinica_inicial
  add column if not exists plan_tratamiento text;
