-- Plan 26 F2 (2/2): tipo inicial/final, meta de cierre, RLS reforzada y mapeo de datos.
-- Requiere 20261126100000 (enums ampliados y ya confirmados).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'odontograma_tipo_enum') then
    create type public.odontograma_tipo_enum as enum ('inicial', 'final');
  end if;
  if not exists (select 1 from pg_type where typname = 'odontograma_cierre_enum') then
    create type public.odontograma_cierre_enum as enum ('borrador', 'cerrado');
  end if;
end $$;

-- Columna tipo + unique recompuesto
alter table public.odontogramas
  add column if not exists tipo public.odontograma_tipo_enum not null default 'inicial';
alter table public.odontograma_marcas
  add column if not exists tipo public.odontograma_tipo_enum not null default 'inicial';

alter table public.odontogramas drop constraint if exists odontogramas_pieza_superficie_key;
alter table public.odontograma_marcas drop constraint if exists odontograma_marcas_paciente_id_pieza_marca_key;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'odontogramas_pieza_superficie_tipo_key') then
    alter table public.odontogramas
      add constraint odontogramas_pieza_superficie_tipo_key unique (paciente_id, pieza, superficie, tipo);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'odontograma_marcas_pieza_marca_tipo_key') then
    alter table public.odontograma_marcas
      add constraint odontograma_marcas_pieza_marca_tipo_key unique (paciente_id, pieza, marca, tipo);
  end if;
end $$;

-- RLS odontogramas: write policies con is_cuenta_activa()
drop policy if exists "odontogramas: insertar propios" on public.odontogramas;
create policy "odontogramas: insertar propios" on public.odontogramas
  for insert with check (odontologo_id = auth.uid() and public.is_cuenta_activa());
drop policy if exists "odontogramas: actualizar propios" on public.odontogramas;
create policy "odontogramas: actualizar propios" on public.odontogramas
  for update using (odontologo_id = auth.uid() and public.is_cuenta_activa())
  with check (odontologo_id = auth.uid() and public.is_cuenta_activa());
drop policy if exists "odontogramas: eliminar propios" on public.odontogramas;
create policy "odontogramas: eliminar propios" on public.odontogramas
  for delete using (odontologo_id = auth.uid() and public.is_cuenta_activa());

-- Meta (borrador/cerrado) por paciente y tipo
create table if not exists public.odontograma_meta (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  tipo public.odontograma_tipo_enum not null,
  estado public.odontograma_cierre_enum not null default 'borrador',
  fecha date not null default current_date,
  creado_por uuid,
  cerrado_en timestamptz,
  notas text, -- motivo de reapertura (la auditoria formal es F4)
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (paciente_id, tipo)
);
create index if not exists odontograma_meta_paciente_idx on public.odontograma_meta (paciente_id);
alter table public.odontograma_meta enable row level security;

drop policy if exists "odontograma_meta: ver propios" on public.odontograma_meta;
create policy "odontograma_meta: ver propios" on public.odontograma_meta
  for select using (odontologo_id = auth.uid() and public.is_cuenta_activa());
drop policy if exists "odontograma_meta: insertar propios" on public.odontograma_meta;
create policy "odontograma_meta: insertar propios" on public.odontograma_meta
  for insert with check (odontologo_id = auth.uid() and public.is_cuenta_activa());
drop policy if exists "odontograma_meta: actualizar propios" on public.odontograma_meta;
create policy "odontograma_meta: actualizar propios" on public.odontograma_meta
  for update using (odontologo_id = auth.uid() and public.is_cuenta_activa())
  with check (odontologo_id = auth.uid() and public.is_cuenta_activa());
drop policy if exists "odontograma_meta: eliminar propios" on public.odontograma_meta;
create policy "odontograma_meta: eliminar propios" on public.odontograma_meta
  for delete using (odontologo_id = auth.uid() and public.is_cuenta_activa());

-- Mapeo de datos (respaldo ANTES de borrar/actualizar). Incluye obturado para poder revertirlo.
create table if not exists public.odontogramas_overhaul_backup as
  select * from public.odontogramas where estado in ('sano', 'corona', 'endodoncia', 'obturado');
alter table public.odontogramas_overhaul_backup enable row level security; -- sin policies: solo service/DBA

-- REVERSA (manual):
--   delete from odontograma_marcas m using odontogramas_overhaul_backup b
--     where m.paciente_id=b.paciente_id and m.pieza=b.pieza and m.tipo='inicial'
--       and m.marca = case b.estado when 'sano' then 'sano' when 'corona' then 'corona_acero'
--                     when 'endodoncia' then 'endo_realizada' end::marca_diente_enum;
--   delete from odontogramas where id in (select id from odontogramas_overhaul_backup);
--   insert into odontogramas select * from odontogramas_overhaul_backup;  -- (columna tipo al final: listar columnas)

update public.odontogramas set estado = 'resina' where estado = 'obturado';

insert into public.odontograma_marcas (odontologo_id, paciente_id, pieza, marca, tipo, fecha)
select distinct odontologo_id, paciente_id, pieza,
  (case estado when 'sano' then 'sano' when 'corona' then 'corona_acero'
     when 'endodoncia' then 'endo_realizada' else 'ausente' end)::public.marca_diente_enum,
  'inicial'::public.odontograma_tipo_enum, fecha
from public.odontogramas
where estado in ('sano', 'corona', 'endodoncia', 'ausente')
on conflict do nothing;

delete from public.odontogramas where estado in ('sano', 'corona', 'endodoncia');
