-- ============================================================
-- Prompt A: Control de acceso sobre profiles
-- ============================================================

-- 1) Enums de rol y estado de cuenta
create type public.rol_usuario_enum as enum ('super_admin', 'odontologo');
create type public.estado_cuenta_enum as enum ('activo', 'suspendido', 'vencido');

-- 2) Nuevas columnas (ALTER, sin recrear la tabla)
alter table public.profiles
  add column rol public.rol_usuario_enum not null default 'odontologo',
  add column estado_cuenta public.estado_cuenta_enum not null default 'activo',
  add column plan_contratado text,
  add column fecha_vencimiento_plan date,
  add column creado_por uuid references public.profiles(id);

-- 3) Función helper para detectar super_admin sin recursión de RLS
create or replace function public.is_super_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'super_admin');
$$;

-- 4) Trigger: impedir que un usuario normal cambie columnas de control de acceso
create or replace function public.protect_profile_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- service_role / SQL editor (sin auth.uid) o super_admin: permitido
  if auth.uid() is null or public.is_super_admin() then
    return new;
  end if;
  if new.rol is distinct from old.rol
     or new.estado_cuenta is distinct from old.estado_cuenta
     or new.plan_contratado is distinct from old.plan_contratado
     or new.fecha_vencimiento_plan is distinct from old.fecha_vencimiento_plan
     or new.creado_por is distinct from old.creado_por then
    raise exception 'No autorizado para modificar campos de control de acceso';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_protect_profile_cols on public.profiles;
create trigger trg_protect_profile_cols before update on public.profiles
  for each row execute function public.protect_profile_privileged_cols();

-- 5) Rehacer políticas RLS
-- Quitar INSERT y DELETE abiertos del flujo anterior
drop policy if exists "profiles: insertar propio" on public.profiles;
drop policy if exists "profiles: eliminar propio" on public.profiles;

-- SELECT propio (se mantiene)
-- UPDATE propio (se mantiene; columnas privilegiadas protegidas por trigger)

-- super_admin: ver y actualizar TODAS las filas
create policy "profiles: super_admin ve todo" on public.profiles
  for select using (public.is_super_admin());
create policy "profiles: super_admin actualiza todo" on public.profiles
  for update using (public.is_super_admin()) with check (public.is_super_admin());
create policy "profiles: super_admin elimina" on public.profiles
  for delete using (public.is_super_admin());;
