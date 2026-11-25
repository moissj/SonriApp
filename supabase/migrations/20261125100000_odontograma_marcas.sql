-- Marcas a nivel diente del odontograma (aditivo; no toca odontogramas ni sus enums)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'marca_diente_enum') then
    create type public.marca_diente_enum as enum (
      'obt_temporal', 'incluido_semi', 'superficie_sellada', 'corona_acero', 'nucleo'
    );
  end if;
end $$;

create table if not exists public.odontograma_marcas (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  pieza text not null,
  marca public.marca_diente_enum not null,
  notas text,
  fecha date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (paciente_id, pieza, marca)
);

create index if not exists odontograma_marcas_paciente_idx
  on public.odontograma_marcas (paciente_id);

alter table public.odontograma_marcas enable row level security;

drop policy if exists "odontograma_marcas: ver propios" on public.odontograma_marcas;
create policy "odontograma_marcas: ver propios" on public.odontograma_marcas
  for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());

drop policy if exists "odontograma_marcas: insertar propios" on public.odontograma_marcas;
create policy "odontograma_marcas: insertar propios" on public.odontograma_marcas
  for insert with check (odontologo_id = auth.uid());

drop policy if exists "odontograma_marcas: actualizar propios" on public.odontograma_marcas;
create policy "odontograma_marcas: actualizar propios" on public.odontograma_marcas
  for update using (odontologo_id = auth.uid()) with check (odontologo_id = auth.uid());

drop policy if exists "odontograma_marcas: eliminar propios" on public.odontograma_marcas;
create policy "odontograma_marcas: eliminar propios" on public.odontograma_marcas
  for delete using (odontologo_id = auth.uid());
