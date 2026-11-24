-- 1. Nuevos campos de identificación estructurada
ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS nombres text,
  ADD COLUMN IF NOT EXISTS primer_apellido text,
  ADD COLUMN IF NOT EXISTS segundo_apellido text,
  ADD COLUMN IF NOT EXISTS lugar_nacimiento_ciudad text,
  ADD COLUMN IF NOT EXISTS lugar_nacimiento_departamento text,
  ADD COLUMN IF NOT EXISTS sexo text,
  ADD COLUMN IF NOT EXISTS estado_civil text,
  ADD COLUMN IF NOT EXISTS telefono_fijo text,
  ADD COLUMN IF NOT EXISTS barrio text,
  ADD COLUMN IF NOT EXISTS eps_id uuid REFERENCES public.catalogo_eps(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tipo_vinculacion text,
  ADD COLUMN IF NOT EXISTS ocupacion text,
  ADD COLUMN IF NOT EXISTS direccion_laboral text,
  ADD COLUMN IF NOT EXISTS telefono_laboral text,
  ADD COLUMN IF NOT EXISTS responsable jsonb,
  ADD COLUMN IF NOT EXISTS acompanante jsonb,
  ADD COLUMN IF NOT EXISTS remite jsonb;

-- 2. Migración de datos: separar nombre_completo en nombres / apellidos (heurística Colombia)
UPDATE public.pacientes AS p
SET
  nombres = CASE
    WHEN cardinality(s.w) >= 4 THEN array_to_string(s.w[1:cardinality(s.w)-2], ' ')
    WHEN cardinality(s.w) = 3 THEN s.w[1]
    WHEN cardinality(s.w) = 2 THEN s.w[1]
    ELSE array_to_string(s.w, ' ')
  END,
  primer_apellido = CASE
    WHEN cardinality(s.w) >= 3 THEN s.w[cardinality(s.w)-1]
    WHEN cardinality(s.w) = 2 THEN s.w[2]
    ELSE NULL
  END,
  segundo_apellido = CASE
    WHEN cardinality(s.w) >= 3 THEN s.w[cardinality(s.w)]
    ELSE NULL
  END
FROM (
  SELECT id, regexp_split_to_array(btrim(nombre_completo), '\s+') AS w
  FROM public.pacientes
) AS s
WHERE p.id = s.id AND p.nombre_completo IS NOT NULL AND btrim(p.nombre_completo) <> '';

-- 3. Convertir nombre_completo en columna generada a partir de los campos estructurados
ALTER TABLE public.pacientes DROP COLUMN nombre_completo;
ALTER TABLE public.pacientes
  ADD COLUMN nombre_completo text
  GENERATED ALWAYS AS (
    btrim(coalesce(nombres, '') || ' ' || coalesce(primer_apellido, '') || ' ' || coalesce(segundo_apellido, ''))
  ) STORED;

-- 4. Restricciones de integridad para selects de valores fijos
ALTER TABLE public.pacientes
  ADD CONSTRAINT pacientes_sexo_check CHECK (sexo IN ('M', 'F')),
  ADD CONSTRAINT pacientes_estado_civil_check CHECK (estado_civil IN ('Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)')),
  ADD CONSTRAINT pacientes_tipo_vinculacion_check CHECK (tipo_vinculacion IN ('Cotizante', 'Beneficiario', 'Subsidiado')),
  ADD CONSTRAINT pacientes_telefono_fijo_check CHECK (telefono_fijo IS NULL OR telefono_fijo ~ '^[0-9]{7,10}$'),
  ADD CONSTRAINT pacientes_telefono_laboral_check CHECK (telefono_laboral IS NULL OR telefono_laboral ~ '^[0-9]{7,10}$');;
