-- Plan 21: datos fiscales del prestador + catalogos globales CIE-10 / CUPS.
-- profiles: solo ADD COLUMN aditivo. Catalogos: SELECT authenticated, escritura solo is_super_admin().
-- Reversibilidad:
--   drop table if exists public.catalogo_cups;
--   drop table if exists public.catalogo_cie10;
--   alter table public.profiles drop column if exists nit, drop column if exists razon_social, drop column if exists codigo_habilitacion_reps;

create extension if not exists pg_trgm;

-- 1. profiles (aditivo)
alter table public.profiles add column if not exists nit text;
alter table public.profiles add column if not exists razon_social text;
alter table public.profiles add column if not exists codigo_habilitacion_reps text;

-- 2. Catalogos
create table if not exists public.catalogo_cie10 (
  codigo text primary key,
  descripcion text not null,
  capitulo text,
  activo boolean not null default true,
  version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalogo_cups (
  codigo text primary key,
  descripcion text not null,
  sexo char(1),
  ambito text,
  quirurgico boolean,
  activo boolean not null default true,
  version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'catalogo_cups_sexo_chk') then
    alter table public.catalogo_cups add constraint catalogo_cups_sexo_chk check (sexo is null or sexo in ('M','F','Z'));
  end if;
end $$;

-- 3. Indices de busqueda
create index if not exists idx_cie10_descripcion_trgm on public.catalogo_cie10 using gin (descripcion gin_trgm_ops);
create index if not exists idx_cups_descripcion_trgm on public.catalogo_cups using gin (descripcion gin_trgm_ops);

-- 4. RLS
alter table public.catalogo_cie10 enable row level security;
alter table public.catalogo_cups enable row level security;

drop policy if exists "cat_cie10_select_auth" on public.catalogo_cie10;
create policy "cat_cie10_select_auth" on public.catalogo_cie10 for select to authenticated using (true);
drop policy if exists "cat_cie10_insert_admin" on public.catalogo_cie10;
create policy "cat_cie10_insert_admin" on public.catalogo_cie10 for insert to authenticated with check (public.is_super_admin());
drop policy if exists "cat_cie10_update_admin" on public.catalogo_cie10;
create policy "cat_cie10_update_admin" on public.catalogo_cie10 for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "cat_cie10_delete_admin" on public.catalogo_cie10;
create policy "cat_cie10_delete_admin" on public.catalogo_cie10 for delete to authenticated using (public.is_super_admin());

drop policy if exists "cat_cups_select_auth" on public.catalogo_cups;
create policy "cat_cups_select_auth" on public.catalogo_cups for select to authenticated using (true);
drop policy if exists "cat_cups_insert_admin" on public.catalogo_cups;
create policy "cat_cups_insert_admin" on public.catalogo_cups for insert to authenticated with check (public.is_super_admin());
drop policy if exists "cat_cups_update_admin" on public.catalogo_cups;
create policy "cat_cups_update_admin" on public.catalogo_cups for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "cat_cups_delete_admin" on public.catalogo_cups;
create policy "cat_cups_delete_admin" on public.catalogo_cups for delete to authenticated using (public.is_super_admin());

-- 5. Triggers updated_at (funcion compartida public.set_updated_at)
drop trigger if exists trg_cat_cie10_updated on public.catalogo_cie10;
create trigger trg_cat_cie10_updated before update on public.catalogo_cie10 for each row execute function public.set_updated_at();
drop trigger if exists trg_cat_cups_updated on public.catalogo_cups;
create trigger trg_cat_cups_updated before update on public.catalogo_cups for each row execute function public.set_updated_at();
