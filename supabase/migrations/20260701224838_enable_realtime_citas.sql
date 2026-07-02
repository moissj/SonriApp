-- Habilita Realtime para la tabla citas
alter publication supabase_realtime add table public.citas;

-- REPLICA IDENTITY FULL: incluye todas las columnas en eventos UPDATE/DELETE
-- para que la autorizacion RLS por odontologo_id funcione en Realtime.
alter table public.citas replica identity full;;
