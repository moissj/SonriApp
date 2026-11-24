-- Plan 18: consentimientos informados (subir firmado en papel).
-- Crea catalogo_consentimientos (global, admin super_admin), consentimientos_paciente (por paciente),
-- y bucket privado 'consentimientos' con policies por carpeta {odontologo_id}/{paciente_id}/.
-- RLS: catalogo = SELECT authenticated + escritura solo is_super_admin();
--      paciente = fail-closed odontologo_id=auth.uid() (+ is_cuenta_activa() en SELECT).
-- Integridad: sin DELETE (registro ni objeto); correccion = estado='anulado' + motivo. plantilla_version congelada.
-- Reversibilidad:
--   drop table if exists public.consentimientos_paciente;
--   drop table if exists public.catalogo_consentimientos;
--   drop function if exists public.tg_consent_touch_updated_at();
--   drop function if exists public.tg_consent_paciente_inmutable();
--   delete from storage.buckets where id='consentimientos';
--   drop policy if exists "consent_obj_select_own" on storage.objects;
--   drop policy if exists "consent_obj_insert_own" on storage.objects;

-- 1. Catalogo global de consentimientos
create table if not exists public.catalogo_consentimientos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null unique,
  titulo text not null,
  cuerpo text not null default '',
  version int not null default 1,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.catalogo_consentimientos enable row level security;
do $$ begin create policy "cat_consent_select_auth" on public.catalogo_consentimientos for select to authenticated using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "cat_consent_insert_admin" on public.catalogo_consentimientos for insert to authenticated with check (public.is_super_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "cat_consent_update_admin" on public.catalogo_consentimientos for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "cat_consent_delete_admin" on public.catalogo_consentimientos for delete to authenticated using (public.is_super_admin()); exception when duplicate_object then null; end $$;

-- 2. Consentimientos por paciente
create table if not exists public.consentimientos_paciente (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  odontologo_id uuid not null references public.profiles(id) on delete cascade,
  catalogo_id uuid not null references public.catalogo_consentimientos(id),
  plantilla_version int not null,
  archivo_path text not null,
  nombre_archivo text not null,
  fecha_firma date not null,
  estado text not null default 'vigente' check (estado in ('vigente','anulado')),
  motivo_anulacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_motivo_si_anulado check (estado <> 'anulado' or motivo_anulacion is not null)
);
create index if not exists idx_consent_paciente on public.consentimientos_paciente(paciente_id);
create index if not exists idx_consent_odontologo on public.consentimientos_paciente(odontologo_id);
alter table public.consentimientos_paciente enable row level security;
do $$ begin create policy "consent_select_own" on public.consentimientos_paciente for select to authenticated using (odontologo_id = auth.uid() and public.is_cuenta_activa()); exception when duplicate_object then null; end $$;
do $$ begin create policy "consent_insert_own" on public.consentimientos_paciente for insert to authenticated with check (odontologo_id = auth.uid() and public.is_cuenta_activa() and exists (select 1 from public.pacientes p where p.id = paciente_id and p.odontologo_id = auth.uid())); exception when duplicate_object then null; end $$;
do $$ begin create policy "consent_update_own" on public.consentimientos_paciente for update to authenticated using (odontologo_id = auth.uid() and public.is_cuenta_activa()) with check (odontologo_id = auth.uid()); exception when duplicate_object then null; end $$;
-- Sin policy DELETE: integridad clinica (borrado fisico prohibido).

-- 3. Trigger updated_at
create or replace function public.tg_consent_touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ begin create trigger trg_cat_consent_updated before update on public.catalogo_consentimientos for each row execute function public.tg_consent_touch_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger trg_consent_paciente_updated before update on public.consentimientos_paciente for each row execute function public.tg_consent_touch_updated_at(); exception when duplicate_object then null; end $$;

-- Integridad: columnas inmutables y sin des-anulacion (solo vigente->anulado + motivo)
create or replace function public.tg_consent_paciente_inmutable() returns trigger language plpgsql as $$
begin
  if new.paciente_id <> old.paciente_id
     or new.odontologo_id <> old.odontologo_id
     or new.catalogo_id <> old.catalogo_id
     or new.plantilla_version <> old.plantilla_version
     or new.archivo_path <> old.archivo_path
     or new.nombre_archivo <> old.nombre_archivo
     or new.fecha_firma <> old.fecha_firma
     or new.created_at <> old.created_at then
    raise exception 'consentimiento: columnas inmutables no pueden modificarse';
  end if;
  if old.estado = 'anulado' and new.estado <> 'anulado' then
    raise exception 'consentimiento: un consentimiento anulado no puede reactivarse';
  end if;
  return new;
end $$;
do $$ begin create trigger trg_consent_paciente_inmutable before update on public.consentimientos_paciente for each row execute function public.tg_consent_paciente_inmutable(); exception when duplicate_object then null; end $$;

-- 4. Bucket privado + policies de Storage (carpeta: {odontologo_id}/{paciente_id}/archivo)
insert into storage.buckets (id, name, public) values ('consentimientos','consentimientos', false) on conflict (id) do nothing;
do $$ begin create policy "consent_obj_select_own" on storage.objects for select to authenticated using (bucket_id = 'consentimientos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_cuenta_activa()); exception when duplicate_object then null; end $$;
do $$ begin create policy "consent_obj_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'consentimientos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_cuenta_activa()); exception when duplicate_object then null; end $$;
-- Sin policy update/delete sobre objetos: inmutabilidad.

-- 5. Seed de tipos base (cuerpo vacio; el texto legal lo completa super_admin/profesional)
insert into public.catalogo_consentimientos (tipo, titulo, cuerpo, version, activo)
select v.tipo, v.titulo, '', 1, true
from (values
  ('tratamiento','Consentimiento informado de tratamiento odontologico'),
  ('habeas_data','Autorizacion de tratamiento de datos personales (habeas data)'),
  ('imagenes','Consentimiento para uso de imagenes clinicas'),
  ('anestesia','Consentimiento informado para anestesia local'),
  ('menores','Consentimiento informado para pacientes menores de edad')
) as v(tipo, titulo)
where not exists (select 1 from public.catalogo_consentimientos c where c.tipo = v.tipo);
