-- Baseline Plan 14: tablas base que existian en prod sin CREATE TABLE en el repo.
-- Forma ORIGINAL (antes de 20260702010429, 20260702010628, 20260701231318, 20260705040728).
-- Idempotente: en prod es no-op; en db reset limpio crea todo.

-- Enums base (valores inferidos del codigo cliente; prod es la verdad: ver pendientes del plan)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'tipo_documento_enum') then
    create type public.tipo_documento_enum as enum ('CC', 'TI', 'CE', 'PA');
  end if;
  if not exists (select 1 from pg_type where typname = 'estado_cita_enum') then
    create type public.estado_cita_enum as enum ('pendiente', 'confirmada', 'atendida', 'cancelada', 'no_asistio');
  end if;
  if not exists (select 1 from pg_type where typname = 'canal_origen_enum') then
    create type public.canal_origen_enum as enum ('manual', 'whatsapp', 'portal');
  end if;
  if not exists (select 1 from pg_type where typname = 'tipo_plantilla_enum') then
    create type public.tipo_plantilla_enum as enum ('confirmacion', 'recordatorio', 'bienvenida', 'personalizado');
  end if;
end $$;

create or replace function public.handle_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- profiles (sin rol/estado_cuenta/plan_contratado/fecha_vencimiento_plan/creado_por/email)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  nombre_consultorio text,
  telefono_contacto text,
  ciudad text,
  departamento text,
  logo_url text,
  color_primario text default '#2563EB',
  horario_apertura time,
  horario_cierre time,
  duracion_cita_defecto integer default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_duracion_cita_default_minutos_check check (duracion_cita_defecto > 0)
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-alta de profile al crear usuario en Auth (drift: no estaba en el repo).
-- Solo usa profiles(id, nombre_completo), ambos presentes en la forma original.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  insert into public.profiles (id, nombre_completo)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre_completo', new.email));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- pacientes (sin bloque expand_pacientes_identificacion ni eps_id)
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  tipo_documento public.tipo_documento_enum not null default 'CC',
  numero_documento text not null,
  telefono text,
  email text,
  fecha_nacimiento date,
  ciudad text,
  departamento text,
  direccion text,
  antecedentes_medicos text,
  alergias text,
  afiliacion_salud text,
  notas_generales text,
  -- shortcut: columna original pre-expand (plain). 20260705040728 la lee, la DROP y la re-crea GENERATED STORED;
  -- debe existir aqui o ese DROP COLUMN/UPDATE falla en un db reset limpio.
  nombre_completo text,
  created_at timestamptz not null default now(),
  constraint pacientes_odontologo_documento_uq unique (odontologo_id, numero_documento),
  constraint pacientes_telefono_check check (telefono ~ '^\d{10}$')
);

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  fecha_hora timestamptz not null,
  duracion_minutos integer not null default 30 constraint citas_duracion_minutos_check check (duracion_minutos > 0),
  tipo_tratamiento text,
  estado public.estado_cita_enum not null default 'pendiente',
  notas text,
  canal_origen public.canal_origen_enum not null default 'manual',
  created_at timestamptz not null default now()
);

create table if not exists public.historias_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  fecha date not null default current_date,
  motivo_consulta text not null,
  diagnostico text,
  notas_clinicas text,
  created_at timestamptz not null default now()
);

-- mensajes_enviados (sin tipo_plantilla)
create table if not exists public.mensajes_enviados (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  cita_id uuid references public.citas(id) on delete set null,
  canal text not null default 'whatsapp_link',
  texto_enviado text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.plantillas_mensajes (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  tipo public.tipo_plantilla_enum not null,
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_citas_odontologo_fecha on public.citas (odontologo_id, fecha_hora);
create index if not exists idx_citas_paciente_id on public.citas (paciente_id);
create index if not exists idx_citas_estado on public.citas (odontologo_id, estado);
create index if not exists idx_historias_paciente_id on public.historias_clinicas (paciente_id);
create index if not exists idx_historias_odontologo_id on public.historias_clinicas (odontologo_id);
create index if not exists idx_historias_fecha on public.historias_clinicas (odontologo_id, fecha);
create index if not exists idx_mensajes_paciente_id on public.mensajes_enviados (paciente_id);
create index if not exists idx_mensajes_cita_id on public.mensajes_enviados (cita_id);
create index if not exists idx_pacientes_odontologo_id on public.pacientes (odontologo_id);
create index if not exists idx_pacientes_documento on public.pacientes (odontologo_id, numero_documento);

alter table public.profiles enable row level security;
alter table public.pacientes enable row level security;
alter table public.citas enable row level security;
alter table public.historias_clinicas enable row level security;
alter table public.mensajes_enviados enable row level security;
alter table public.plantillas_mensajes enable row level security;

-- Policies: se crean solo si no existen (no pisan las de prod ni las endurecidas luego).
-- Incluye los SELECT ORIGINALES (sin is_cuenta_activa) porque 20260702015419 hace
-- `drop policy` sin IF EXISTS sobre ellos; esa migracion los endurece despues.
do $$
declare
  p record;
begin
  for p in
    select * from (values
      ('profiles',           'profiles: ver propio',             'select', 'id = auth.uid()', null),
      ('profiles',           'profiles: actualizar propio',      'update', 'id = auth.uid()', 'id = auth.uid()'),
      ('pacientes',          'pacientes: ver propios',           'select', 'odontologo_id = auth.uid()', null),
      ('pacientes',          'pacientes: insertar propios',      'insert', null, 'odontologo_id = auth.uid()'),
      ('pacientes',          'pacientes: actualizar propios',    'update', 'odontologo_id = auth.uid()', 'odontologo_id = auth.uid()'),
      ('pacientes',          'pacientes: eliminar propios',      'delete', 'odontologo_id = auth.uid()', null),
      ('citas',              'citas: ver propias',               'select', 'odontologo_id = auth.uid()', null),
      ('citas',              'citas: insertar propias',          'insert', null, 'odontologo_id = auth.uid()'),
      ('citas',              'citas: actualizar propias',        'update', 'odontologo_id = auth.uid()', 'odontologo_id = auth.uid()'),
      ('citas',              'citas: cancelar/eliminar propias', 'delete', 'odontologo_id = auth.uid()', null),
      ('historias_clinicas', 'historias: ver propias',           'select', 'odontologo_id = auth.uid()', null),
      ('historias_clinicas', 'historias: insertar propias',      'insert', null, 'odontologo_id = auth.uid()'),
      ('historias_clinicas', 'historias: actualizar propias',    'update', 'odontologo_id = auth.uid()', 'odontologo_id = auth.uid()'),
      ('historias_clinicas', 'historias: eliminar propias',      'delete', 'odontologo_id = auth.uid()', null),
      ('mensajes_enviados',  'mensajes: ver propios',            'select', 'odontologo_id = auth.uid()', null),
      ('mensajes_enviados',  'mensajes: insertar propios',       'insert', null, 'odontologo_id = auth.uid()'),
      ('mensajes_enviados',  'mensajes: actualizar propios',     'update', 'odontologo_id = auth.uid()', 'odontologo_id = auth.uid()'),
      ('mensajes_enviados',  'mensajes: eliminar propios',       'delete', 'odontologo_id = auth.uid()', null),
      ('plantillas_mensajes','plantillas: ver propias',          'select', 'odontologo_id = auth.uid()', null),
      ('plantillas_mensajes','plantillas: insertar propias',     'insert', null, 'odontologo_id = auth.uid()'),
      ('plantillas_mensajes','plantillas: actualizar propias',   'update', 'odontologo_id = auth.uid()', 'odontologo_id = auth.uid()'),
      ('plantillas_mensajes','plantillas: eliminar propias',     'delete', 'odontologo_id = auth.uid()', null)
    ) as t(tabla, nombre, cmd, usando, chequeo)
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = p.tabla and policyname = p.nombre
    ) then
      execute format('create policy %I on public.%I for %s%s%s', p.nombre, p.tabla, p.cmd,
        coalesce(' using (' || p.usando || ')', ''),
        coalesce(' with check (' || p.chequeo || ')', ''));
    end if;
  end loop;
end $$;
