create table public.tratamientos_catalogo (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  nombre text not null,
  descripcion text,
  precio_base integer not null default 0 check (precio_base >= 0),
  duracion_minutos integer not null default 30 check (duracion_minutos > 0),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index tratamientos_catalogo_odontologo_idx on public.tratamientos_catalogo (odontologo_id);

alter table public.tratamientos_catalogo enable row level security;

create policy "tratamientos: ver propios" on public.tratamientos_catalogo
  for select using (odontologo_id = auth.uid());
create policy "tratamientos: insertar propios" on public.tratamientos_catalogo
  for insert with check (odontologo_id = auth.uid());
create policy "tratamientos: actualizar propios" on public.tratamientos_catalogo
  for update using (odontologo_id = auth.uid()) with check (odontologo_id = auth.uid());
create policy "tratamientos: eliminar propios" on public.tratamientos_catalogo
  for delete using (odontologo_id = auth.uid());;
