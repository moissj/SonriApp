-- Datos de referencia: departamentos y municipios de Colombia
create table public.departamentos (
  id integer primary key generated always as identity,
  nombre text not null unique
);

create table public.municipios (
  id integer primary key generated always as identity,
  departamento_id integer not null references public.departamentos(id) on delete cascade,
  nombre text not null,
  unique (departamento_id, nombre)
);
create index municipios_departamento_idx on public.municipios (departamento_id);

-- Datos de solo lectura para cualquier usuario autenticado (no hay escritura desde el cliente;
-- la carga se hace vía Edge Function con service_role).
alter table public.departamentos enable row level security;
alter table public.municipios enable row level security;
create policy "departamentos: lectura" on public.departamentos for select to authenticated using (true);
create policy "municipios: lectura" on public.municipios for select to authenticated using (true);;
