# Plan 18 — Consentimientos informados (subir firmado en papel)

- **ID:** `18_consentimientos-informados`
- **Estado:** En ejecución
- **Tracker:** [`gestion/tracker/18_consentimientos-informados.md`](../tracker/18_consentimientos-informados.md)
- **Diseño aprobado:** [`docs/superpowers/specs/2026-11-24-consentimientos-informados-design.md`](../../docs/superpowers/specs/2026-11-24-consentimientos-informados-design.md)
- **Roadmap:** Dentalink #3 (`docs/producto/analisis-competencia-dentalink.md`).

## Objetivo
El odontólogo, dentro de un paciente, elige un consentimiento del catálogo global, lo imprime con los datos del paciente, lo hace firmar en papel y sube el PDF/foto firmado. Queda guardado **inmutable** (sin borrado físico; corrección = anulación auditada) con fecha de firma y `plantilla_version` congelada. `super_admin` mantiene el catálogo de textos.

**Fuera de alcance (YAGNI):** firma digital/canvas, e-firma certificada, envío/portal del paciente, recordatorios de consentimiento, módulo genérico de documentos (roadmap #6).

## Enfoque
Decisiones del usuario (brainstorming): firma = subir papel firmado; catálogo = global (super_admin, patrón `catalogo_eps`); plantilla en blanco = texto en BD + vista imprimible.

Orden de pistas (serie): **BD/RLS/Storage** (`capa-datos`) → regenerar/alinear tipos → **cliente web** (servicio + sección en paciente + subir/listar/anular + vista imprimible) → **cliente web** (CRUD super_admin del catálogo) → **verificador** (adversarial) → cierre.

## Fases
1. **F1 — Datos + Storage + RLS** (`capa-datos`): 2 tablas (`catalogo_consentimientos`, `consentimientos_paciente`), bucket privado `consentimientos`, policies fail-closed, seed de tipos con cuerpo placeholder, trigger `updated_at`. Migración idempotente y reversible; **no se aplica a prod sin OK explícito**.
2. **F2 — Flujo del odontólogo** (`cliente-web`): módulo `features/consentimientos/` (models, funciones, services, components), sección "Consentimientos" en el detalle del paciente (listar/subir/ver vía URL firmada/anular con confirmación+motivo) + vista imprimible.
3. **F3 — CRUD super_admin del catálogo** (`cliente-web`): pantalla de administración (crear/editar texto → sube `version`, activar/desactivar) bajo `adminGuard`.

## Archivos a crear / modificar
- **Crear:** `supabase/migrations/<ts>_consentimientos_informados.sql`; `src/app/features/consentimientos/{models,funciones,services,components}/**`.
- **Modificar (puntos de integración, confirmados por relevador en el expediente):** detalle de paciente (montar sección), `src/app/routes.ts` (ruta admin del catálogo). Tipos BD si existe archivo compartido.
- Lista exacta ruta:línea en `18_consentimientos-informados_expediente.json`.

## Cambios de BD / SQL / RLS
- `catalogo_consentimientos` (global): RLS `SELECT` para `authenticated`; `INSERT/UPDATE/DELETE` solo `is_super_admin()`. Sin PII.
- `consentimientos_paciente`: RLS fail-closed `odontologo_id = auth.uid()` en toda operación; `SELECT` añade `is_cuenta_activa()`. FK a `pacientes` y `catalogo_consentimientos`. `created_at` servidor (`now()`), trigger `updated_at`.
- Storage bucket privado `consentimientos`, policies por carpeta `{odontologo_id}/{paciente_id}/`. Solo URLs firmadas de vida corta.
- Inmutabilidad: sin `DELETE` de registros/archivos; corrección = `estado='anulado'` + `motivo_anulacion`. Idempotente (`IF NOT EXISTS`, `WHERE NOT EXISTS`), reversible (drop tablas + bucket).

## Reglas de negocio y contrato
- Contrato versionado: `gestion/fase_de_desarrollo/18_consentimientos-informados_expediente.json`.
- `plantilla_version` congelada al subir. Timestamp oficial de servidor.
- Legal CO (Ley 527, habeas data, retención, menores): **validar con profesional**; catálogo se siembra con placeholder, no con texto legal autoritativo.
- Cero PII/datos clínicos en logs, errores, tests o chat; seeds y tests con datos sintéticos.

## Casos de prueba
- Funciones puras (`funciones/*.spec.ts`): validación de tipo/tamaño de archivo (pdf/jpg/png), construcción de la ruta de Storage `{odontologo_id}/{paciente_id}/{uuid}-{nombre}`, regla de anulación (requiere motivo).
- RLS (aislamiento entre consultorios, datos sintéticos): odontólogo A no ve ni descarga consentimientos de B; catálogo visible para authenticated; escritura de catálogo denegada a `odontologo`; cuenta inactiva → 0 filas.
- Un fallo al subir nunca muestra éxito; error de carga muestra estado de error, nunca "sin registros".
