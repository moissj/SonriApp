-- Guarda el tipo de plantilla usada en cada mensaje para trazabilidad
alter table public.mensajes_enviados
  add column if not exists tipo_plantilla public.tipo_plantilla_enum;;
