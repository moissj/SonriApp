-- Reconciliación de drift: esta migración ya estaba APLICADA en producción
-- (supabase_migrations 20260705060351) pero no existía como archivo en el repo.
-- Se recrea idéntica al SQL vivo para que `supabase db reset` reproduzca prod.

-- Tabla principal del examen de ingreso (una fila por paciente)
create table if not exists public.historia_clinica_inicial (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid not null references public.pacientes(id) on delete cascade,
  odontologo_id       uuid not null references public.profiles(id) on delete cascade,

  -- Sección 1: Antecedentes de salud
  -- Arreglo JSON: [{nombre, valor: 'si'|'no'|null, observacion: string|null}]
  antecedentes_salud  jsonb default '[]'::jsonb,
  obs_antecedentes    text,
  toma_presion        text,
  temperatura_corporal numeric(5,2),

  -- Sección 2: Tejidos blandos
  -- Arreglo JSON: [{nombre, valor: 'normal'|'alterado'|null, observacion: string|null}]
  tejidos_blandos     jsonb default '[]'::jsonb,
  obs_tejidos_blandos text,

  -- Sección 3: Funciones vitales
  respiracion         text check (respiracion in ('nasal','oral')),
  deglucion           text check (deglucion in ('normal','atipica')),
  fonacion            text check (fonacion in ('normal','alterada')),
  succion             text check (succion in ('normal','alterada')),

  -- Sección 4: Historia dental
  -- Objeto JSON con campos estructurados
  historia_dental     jsonb default '{}'::jsonb,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  unique (paciente_id, odontologo_id)
);

-- RLS
alter table public.historia_clinica_inicial enable row level security;

create policy "odontologo_own_hci" on public.historia_clinica_inicial
  for all
  to authenticated
  using  ((select auth.uid()) = odontologo_id)
  with check ((select auth.uid()) = odontologo_id);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_historia_clinica_inicial_updated_at
  before update on public.historia_clinica_inicial
  for each row execute function public.set_updated_at();
