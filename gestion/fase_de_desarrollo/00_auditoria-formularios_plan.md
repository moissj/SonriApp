# Plan 00 — Auditoría de formularios vs papel y estado RLS

- **ID:** `00_auditoria-formularios`
- **Estado:** Pendiente de ejecución (requiere OK de la matriz antes de rediseñar)
- **Tracker:** [`gestion/tracker/00_auditoria-formularios.md`](../tracker/00_auditoria-formularios.md)

## Objetivo
Comparar cada campo del formato en papel (`docs/superpowers/referencias/historia-clinica-papel/`) contra los formularios actuales (`pacientes/formulario`, `historias-clinicas/examen-ingreso`, `detalle`), producir `docs/clinica/matriz-brechas.md` completa, inventariar columnas con datos sensibles de salud y auditar el estado actual de RLS y migraciones en Supabase.

## Enfoque
1. Usar `relevador` (solo lectura) para inventariar todos los campos en `src/app/core/services/patient.service.ts`, `historias-clinicas.service.ts`, `examen-ingreso.service.ts`, templates y `supabase/migrations/**`.
2. Verificar vía MCP de Supabase (confirmando previamente que el proyecto enlazado sea SonriApp) el esquema real de tablas base sin migración en el repo (`pacientes`, `historias_clinicas`, `historia_clinica_inicial`, `odontogramas`, `profiles`) y sus policies vigentes.
3. Completar la matriz campo por campo en `docs/clinica/matriz-brechas.md` con propuesta y dudas explícitas (p. ej. `DIAGNOSTICADA A` en apnea, `remite.parentesco`, `PA`/`PP`, `ubicacion` invertida en `cuellos_expuestos`).
4. Esperar OK explícito del usuario sobre la matriz antes de iniciar el Plan 01.

## Archivos a crear / modificar
- `docs/clinica/matriz-brechas.md` (matriz completa + inventario de columnas de salud + mapa de RLS)
- `gestion/tracker/00_auditoria-formularios.md`

## Cambios de BD / SQL / RLS
- Ninguno en este plan (solo inspección de solo lectura y documentación de hallazgos; p. ej. `historia_clinica_inicial` sin migración en el repo y `catalogo_eps` sin `is_cuenta_activa()`).

## Reglas de negocio y contrato
- Sin rediseño ni cambios funcionales hasta aprobación de la matriz.
- Cero datos reales de pacientes en el informe; solo nombres de columnas y tipos.

## Casos de prueba
- Verificación cruzada por `verificador` de que el 100 % de los campos visibles en las 4 fotos `.jfif` aparecen mapeados en `docs/clinica/matriz-brechas.md` con `ruta:línea` real.
