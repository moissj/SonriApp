# DDL vivo de producción — tablas base sin CREATE en repo

> **Fuente:** Supabase Management API (solo lectura), proyecto `sigpqpdfdfjavgylzhni`, 2026-11-24.
> **Uso:** verdad autoritativa para reconstruir la baseline del Plan 14. NO es el archivo de migración; es el snapshot del estado actual de prod.
> Tablas cubiertas (sin `CREATE TABLE` en repo): `profiles`, `pacientes`, `citas`, `historias_clinicas`, `mensajes_enviados`, `plantillas_mensajes`.

## Columnas (estado ACTUAL en prod)

### profiles
```
id uuid NOT NULL                         -- FK auth.users(id) ON DELETE CASCADE
nombre_completo text NOT NULL
nombre_consultorio text
telefono_contacto text
ciudad text
departamento text
logo_url text
color_primario text DEFAULT '#2563EB'
horario_apertura time
horario_cierre time
duracion_cita_defecto integer DEFAULT 30
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
rol rol_usuario_enum NOT NULL DEFAULT 'odontologo'       -- agregado por 20260702010429_profiles_control_acceso
estado_cuenta estado_cuenta_enum NOT NULL DEFAULT 'activo' -- idem
plan_contratado text                                      -- idem
fecha_vencimiento_plan date                               -- idem
creado_por uuid                                           -- idem (FK profiles(id))
email text                                                -- agregado por 20260702010628_profiles_add_email
```

### pacientes
```
id uuid NOT NULL DEFAULT gen_random_uuid()
odontologo_id uuid NOT NULL              -- FK profiles(id) ON DELETE CASCADE
tipo_documento tipo_documento_enum NOT NULL DEFAULT 'CC'
numero_documento text NOT NULL
telefono text                            -- CHECK (telefono ~ '^\d{10}$')
email text
fecha_nacimiento date
ciudad text
departamento text
direccion text
antecedentes_medicos text
alergias text
afiliacion_salud text
notas_generales text
created_at timestamptz NOT NULL DEFAULT now()
-- >>> columnas agregadas por 20260705040728_expand_pacientes_identificacion:
nombres text
primer_apellido text
segundo_apellido text
lugar_nacimiento_ciudad text
lugar_nacimiento_departamento text
sexo text                                -- CHECK sexo in ('M','F')
estado_civil text                        -- CHECK in ('Soltero(a)','Casado(a)','Unión libre','Divorciado(a)','Viudo(a)')
telefono_fijo text                       -- CHECK (telefono_fijo IS NULL OR ~ '^[0-9]{7,10}$')
barrio text
eps_id uuid                              -- FK catalogo_eps(id) ON DELETE SET NULL
tipo_vinculacion text                    -- CHECK in ('Cotizante','Beneficiario','Subsidiado')
ocupacion text
direccion_laboral text
telefono_laboral text                    -- CHECK (telefono_laboral IS NULL OR ~ '^[0-9]{7,10}$')
responsable jsonb
acompanante jsonb
remite jsonb
nombre_completo text GENERATED ALWAYS AS (btrim(coalesce(nombres,'')||' '||coalesce(primer_apellido,'')||' '||coalesce(segundo_apellido,''))) STORED
```

### citas
```
id uuid NOT NULL DEFAULT gen_random_uuid()
odontologo_id uuid NOT NULL              -- FK profiles(id) ON DELETE CASCADE
paciente_id uuid NOT NULL                -- FK pacientes(id) ON DELETE CASCADE
fecha_hora timestamptz NOT NULL
duracion_minutos integer NOT NULL DEFAULT 30  -- CHECK (duracion_minutos > 0)
tipo_tratamiento text
estado estado_cita_enum NOT NULL DEFAULT 'pendiente'
notas text
canal_origen canal_origen_enum NOT NULL DEFAULT 'manual'
created_at timestamptz NOT NULL DEFAULT now()
```

### historias_clinicas
```
id uuid NOT NULL DEFAULT gen_random_uuid()
paciente_id uuid NOT NULL                -- FK pacientes(id) ON DELETE CASCADE
odontologo_id uuid NOT NULL              -- FK profiles(id) ON DELETE CASCADE
fecha date NOT NULL DEFAULT CURRENT_DATE
motivo_consulta text NOT NULL
diagnostico text
notas_clinicas text
created_at timestamptz NOT NULL DEFAULT now()
```

### mensajes_enviados
```
id uuid NOT NULL DEFAULT gen_random_uuid()
odontologo_id uuid NOT NULL              -- FK profiles(id) ON DELETE CASCADE
paciente_id uuid NOT NULL                -- FK pacientes(id) ON DELETE CASCADE
cita_id uuid                             -- FK citas(id) ON DELETE SET NULL
canal text NOT NULL DEFAULT 'whatsapp_link'
texto_enviado text NOT NULL
created_at timestamptz NOT NULL DEFAULT now()
tipo_plantilla tipo_plantilla_enum       -- agregado por 20260701231318_add_tipo_plantilla_to_mensajes
```

### plantillas_mensajes
```
id uuid NOT NULL DEFAULT gen_random_uuid()
odontologo_id uuid NOT NULL              -- FK profiles(id) ON DELETE CASCADE
tipo tipo_plantilla_enum NOT NULL
texto text NOT NULL
created_at timestamptz NOT NULL DEFAULT now()
```

## Constraints (pg_get_constraintdef)
```
citas_pkey PRIMARY KEY (id)
citas_paciente_id_fkey FK (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
citas_odontologo_id_fkey FK (odontologo_id) REFERENCES profiles(id) ON DELETE CASCADE
citas_duracion_minutos_check CHECK (duracion_minutos > 0)
historias_clinicas_pkey PRIMARY KEY (id)
historias_clinicas_paciente_id_fkey FK (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
historias_clinicas_odontologo_id_fkey FK (odontologo_id) REFERENCES profiles(id) ON DELETE CASCADE
mensajes_enviados_pkey PRIMARY KEY (id)
mensajes_enviados_cita_id_fkey FK (cita_id) REFERENCES citas(id) ON DELETE SET NULL
mensajes_enviados_odontologo_id_fkey FK (odontologo_id) REFERENCES profiles(id) ON DELETE CASCADE
mensajes_enviados_paciente_id_fkey FK (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
pacientes_pkey PRIMARY KEY (id)
pacientes_odontologo_documento_uq UNIQUE (odontologo_id, numero_documento)
pacientes_eps_id_fkey FK (eps_id) REFERENCES catalogo_eps(id) ON DELETE SET NULL   -- depende de catalogo_eps (creada en 20260705040701) → va en el ALTER tardío, NO en baseline
pacientes_odontologo_id_fkey FK (odontologo_id) REFERENCES profiles(id) ON DELETE CASCADE
pacientes_telefono_check CHECK (telefono ~ '^\d{10}$')
pacientes_telefono_fijo_check / _laboral_check / _tipo_vinculacion_check / _estado_civil_check / _sexo_check  -- todos sobre columnas del ALTER tardío
profiles_pkey PRIMARY KEY (id)
profiles_id_fkey FK (id) REFERENCES auth.users(id) ON DELETE CASCADE
profiles_creado_por_fkey FK (creado_por) REFERENCES profiles(id)                   -- creado_por es del ALTER tardío
profiles_duracion_cita_default_minutos_check CHECK (duracion_cita_defecto > 0)
```

## Índices (no-constraint) (pg_get_indexdef)
```
idx_citas_odontologo_fecha ON citas (odontologo_id, fecha_hora)
idx_citas_paciente_id ON citas (paciente_id)
idx_citas_estado ON citas (odontologo_id, estado)
idx_historias_paciente_id ON historias_clinicas (paciente_id)
idx_historias_odontologo_id ON historias_clinicas (odontologo_id)
idx_historias_fecha ON historias_clinicas (odontologo_id, fecha)
idx_mensajes_paciente_id ON mensajes_enviados (paciente_id)
idx_mensajes_cita_id ON mensajes_enviados (cita_id)
idx_pacientes_odontologo_id ON pacientes (odontologo_id)
idx_pacientes_documento ON pacientes (odontologo_id, numero_documento)
```

## Triggers
```
-- profiles:
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_protect_profile_cols BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_privileged_cols();
-- auth.users:
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Funciones requeridas (pg_get_functiondef)
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
begin new.updated_at = now(); return new; end; $$;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select exists (select 1 from public.profiles where id = auth.uid() and rol = 'super_admin'); $$;

CREATE OR REPLACE FUNCTION public.is_cuenta_activa() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select exists (select 1 from public.profiles where id = auth.uid() and estado_cuenta = 'activo'
    and (fecha_vencimiento_plan is null or fecha_vencimiento_plan >= current_date)); $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email));
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_cols() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
begin
  if auth.uid() is null or public.is_super_admin() then return new; end if;
  if new.rol is distinct from old.rol
     or new.estado_cuenta is distinct from old.estado_cuenta
     or new.plan_contratado is distinct from old.plan_contratado
     or new.fecha_vencimiento_plan is distinct from old.fecha_vencimiento_plan
     or new.creado_por is distinct from old.creado_por then
    raise exception 'No autorizado para modificar campos de control de acceso';
  end if;
  return new;
end; $$;
```
> `handle_new_user`, `is_super_admin`, `protect_profile_privileged_cols` dependen de columnas que agrega `20260702010429_profiles_control_acceso` (rol, estado_cuenta, …). `is_cuenta_activa` igual. Por eso su definición vive en esas migraciones tardías, NO en la baseline. La baseline solo necesita `handle_updated_at` (usa `updated_at`, que sí existe en el profiles original).

## RLS: estado vivo
- `ENABLE ROW LEVEL SECURITY` activo en las 6 tablas.
- **Policies ya en repo** (NO duplicar en baseline):
  - SELECT «… ver propios/propias» de las 5 tablas de negocio → `20260702015419_enforce_cuenta_activa_rls` (con `is_cuenta_activa()`).
  - `profiles`: «super_admin ve todo / actualiza todo / elimina» → `20260702010429_profiles_control_acceso`.
- **Policies SOLO en prod (drift — deben nacer en la migración correcta)**:
  - `pacientes`, `citas`, `historias_clinicas`, `mensajes_enviados`, `plantillas_mensajes`: `INSERT` (`with check (odontologo_id = auth.uid())`), `UPDATE` (`using`+`with check (odontologo_id = auth.uid())`), `DELETE` (`using (odontologo_id = auth.uid())`), todas «… insertar/actualizar/eliminar propios/propias».
  - `profiles`: «profiles: ver propio» `SELECT using (id = auth.uid())` y «profiles: actualizar propio» `UPDATE using (id = auth.uid()) with check (id = auth.uid())`.
