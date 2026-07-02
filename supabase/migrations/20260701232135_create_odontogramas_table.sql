-- Enum de estados clinicos de una pieza dental
create type public.estado_diente_enum as enum (
  'sano', 'caries', 'obturado', 'ausente', 'corona', 'endodoncia', 'implante'
);

-- Tabla de odontograma: estado actual de cada pieza por paciente
create table public.odontogramas (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  pieza text not null,
  estado public.estado_diente_enum not null default 'sano',
  notas text,
  fecha date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paciente_id, pieza)
);

create index odontogramas_paciente_idx on public.odontogramas (paciente_id);

-- Seguridad a nivel de fila: cada odontologo solo ve/gestiona lo suyo
alter table public.odontogramas enable row level security;

create policy "odontogramas: ver propios" on public.odontogramas
  for select using (odontologo_id = auth.uid());
create policy "odontogramas: insertar propios" on public.odontogramas
  for insert with check (odontologo_id = auth.uid());
create policy "odontogramas: actualizar propios" on public.odontogramas
  for update using (odontologo_id = auth.uid()) with check (odontologo_id = auth.uid());
create policy "odontogramas: eliminar propios" on public.odontogramas
  for delete using (odontologo_id = auth.uid());;
