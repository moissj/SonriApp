create type public.estado_presupuesto_enum as enum ('pendiente','aceptado','rechazado');
create type public.metodo_pago_enum as enum ('efectivo','transferencia','tarjeta');

create table public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  estado public.estado_presupuesto_enum not null default 'pendiente',
  subtotal integer not null default 0,
  descuento_tipo text not null default 'ninguno',
  descuento_valor integer not null default 0,
  total integer not null default 0,
  notas text,
  created_at timestamptz not null default now()
);
create index presupuestos_paciente_idx on public.presupuestos (paciente_id);

create table public.presupuesto_items (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos(id) on delete cascade,
  tratamiento_id uuid references public.tratamientos_catalogo(id),
  nombre text not null,
  precio integer not null default 0,
  cantidad integer not null default 1 check (cantidad > 0)
);
create index presupuesto_items_presupuesto_idx on public.presupuesto_items (presupuesto_id);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  odontologo_id uuid not null references public.profiles(id),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  presupuesto_id uuid references public.presupuestos(id) on delete set null,
  cita_id uuid references public.citas(id) on delete set null,
  monto integer not null check (monto > 0),
  metodo public.metodo_pago_enum not null default 'efectivo',
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);
create index pagos_paciente_idx on public.pagos (paciente_id);;
