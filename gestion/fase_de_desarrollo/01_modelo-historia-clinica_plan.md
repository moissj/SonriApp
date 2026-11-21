# Plan 01 — Modelo de datos, versionado e integridad clínica

- **ID:** `01_modelo-historia-clinica`
- **Estado:** Pendiente de ejecución (**REQUIERE OK EXPLÍCITO DEL USUARIO EN DECISIONES DE ARQUITECTURA**)
- **Tracker:** [`gestion/tracker/01_modelo-historia-clinica.md`](../tracker/01_modelo-historia-clinica.md)

## Objetivo
Definir y aprobar el esquema definitivo de BD, estrategia de **plantilla versionada**, **integridad/inmutabilidad** de la historia clínica, soporte de **borradores** y regla de **alertas clínicas visibles**, garantizando cero pérdida de datos existentes.

## Enfoque — Decisiones y trade-offs para aprobar (no decidir sin OK)

### 1. Trade-offs de plantilla versionada vs. formularios Angular fijos
- **Opción A — Formularios Angular fijos + `plantilla_version`:** componentes Angular dedicados por sección con campos tipados y un entero/semver `plantilla_version` en cada registro de historia.
  - *Pros:* máximo control UX en consultorio (atajos, layout tablet/móvil, validaciones cruzadas como lateralidad o ubicación en sensibilidad), tipado estricto TypeScript y fácil mantenimiento por sección.
  - *Contras:* agregar campos para otra especialidad o profesional requiere despliegue de frontend.
- **Opción B — Definición JSON versionada 100 % dinámica:** un motor genérico renderiza secciones, controles y reglas desde un esquema JSON almacenado en BD (`plantillas_historia`).
  - *Pros:* permite nuevas especialidades o formularios por profesional sin tocar Angular.
  - *Contras:* alta complejidad inicial en validaciones dependientes, riesgo de UX genérica menos ágil, y pérdida de tipado estricto si todo vive en un JSONB sin esquema fijo.
- **Opción C (Recomendada — Híbrido pragmático):**
  1. **Columnas SQL tipadas** para lo que alimenta identificación, RIPS/reportes futuros o alertas clínicas (`pacientes`, cabecera, `numero_historia`, antecedentes críticos, `alergias`, signos vitales, diagnóstico, `plantilla_version`).
  2. **Secciones estructuradas en `jsonb` con `plantilla_version`** y un registro de definición (`plantilla_esquema`) que versiona etiquetas y catálogos por versión (`v1` = formato papel actual).
  3. **Componentes Angular tipados por sección** que consumen el contrato de `v1` hoy y dejan la puerta abierta a nuevas versiones `v2+` o especialidades sin migrar ni romper historias antiguas.

### 2. Propuesta de integridad de la historia clínica
- **Borrador vs. Cerrada:** `estado IN ('borrador', 'cerrada', 'enmendada')`.
  - En `'borrador'`: autoguardado permitido por el mismo `odontologo_id`.
  - Al cerrar/firmar: timestamp del servidor (`cerrada_at = now()`), bloqueo de `UPDATE` destructivo y `DELETE` físico prohibido mediante trigger + RLS.
  - Correcciones posteriores: nueva versión o tabla `historia_clinica_notas_aclaratorias` (o nueva revisión enlazada `version_anterior_id`, con autor, `created_at = now()` y `motivo_correccion` obligatorio).

### 3. Propuesta de regla de alertas clínicas visibles y tipos de ID
- **Alertas clínicas críticas:** se derivan de respuestas `'si'` en Antecedentes (`Reacciones alérgicas`, `Trastorno de coagulación`, `Cardiacos`, `Enfermedad infecto-contagiosa`, `Hepatitis`, `Sida`, `Ginecológicos o embarazo`, `Ingestión de medicamentos`) + resumen `pacientes.alergias`. En listados compartidos o pantalla visible en recepción, los ítems de especial sensibilidad (`Sida`, `Hepatitis`, `Enfermedad infecto-contagiosa`) muestran indicador genérico de «Precaución / Bioseguridad» con detalle completo solo tras acción explícita del odontólogo.
- **Tipos de documento:** mantener `PA` en `tipo_documento_enum` (mostrando etiqueta «Pasaporte (PA / PP)») y decidir si agregar `PPT` (Permiso por Protección Temporal) y `NUIP` en la migración.

## Archivos a crear / modificar
- `gestion/fase_de_desarrollo/01_modelo-historia-clinica_expediente.json` (contrato v1)
- `supabase/migrations/<ts>_historia_clinica_modelo_v1.sql` (y migración base documentada)
- Regeneración de tipos Supabase en `src/app/core/`

## Cambios de BD / SQL / RLS
- Capturar DDL base faltante de `pacientes`, `historias_clinicas`, `historia_clinica_inicial` de forma idempotente.
- Agregar `plantilla_version`, `numero_historia` consecutivo por odontólogo, `estado`, `cerrada_at`, tabla de versiones/notas aclaratorias y `CHECK` para tri-estado (`'si' | 'no' | NULL`, `'normal' | 'anormal' | NULL`).
- Backfill reversible desde `historia_clinica_inicial` sin borrar ni renombrar columnas previas hasta validar en producción.

## Casos de prueba
- Migración idempotente + backfill sin pérdida de filas existentes.
- Trigger impide `UPDATE`/`DELETE` sobre historia en estado `'cerrada'`.
- RLS impide acceso entre distintos `odontologo_id` y bloquea cuentas suspendidas/vencidas.
