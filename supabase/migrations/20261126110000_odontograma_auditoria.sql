-- Plan 26 F4a: auditoria append-only de cambios del odontograma. Aditiva e idempotente.
-- Reversion: drop table public.odontograma_auditoria; drop type public.odontograma_accion_enum;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'odontograma_accion_enum') then
    create type public.odontograma_accion_enum as enum ('agrega', 'quita');
  end if;
end $$;

create table if not exists public.odontograma_auditoria (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  tipo public.odontograma_tipo_enum not null,
  pieza text not null,
  hallazgo_id text not null, -- id del catalogo (estadoEnum o marcaEnum)
  accion public.odontograma_accion_enum not null,
  superficie text, -- solo si el hallazgo fue un fill
  detalle jsonb,
  creado_en timestamptz not null default now(),
  creado_por uuid
);

create index if not exists odontograma_auditoria_paciente_tipo_idx
  on public.odontograma_auditoria (paciente_id, tipo, creado_en desc);

alter table public.odontograma_auditoria enable row level security;

drop policy if exists "odontograma_auditoria: ver propios" on public.odontograma_auditoria;
create policy "odontograma_auditoria: ver propios" on public.odontograma_auditoria
  for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy if exists "odontograma_auditoria: insertar propios" on public.odontograma_auditoria;
create policy "odontograma_auditoria: insertar propios" on public.odontograma_auditoria
  for insert with check (odontologo_id = auth.uid() and public.is_cuenta_activa());

-- Append-only: SIN policy de UPDATE ni DELETE. Con RLS activo, la ausencia de policy
-- deniega la operacion a todos los roles cliente (ni el dueño edita o borra el rastro).
