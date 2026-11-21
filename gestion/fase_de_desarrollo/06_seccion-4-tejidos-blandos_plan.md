# Plan 06 — Sección 4 Tejidos blandos

- **ID:** `06_seccion-4-tejidos-blandos`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/06_seccion-4-tejidos-blandos.md`](../tracker/06_seccion-4-tejidos-blandos.md)

## Objetivo
Implementar la Sección 4 («Tejidos blandos») con las 16 estructuras del formato en papel, estado tri-estado (`Normal / Anormal / No evaluado`), observación condicional al marcar `Anormal` y campo de «Observaciones / hallazgos clínicos».

## Enfoque
- Usar catálogo canónico de las 16 estructuras (Labio superior, Labio inferior, Carrillos, Comisuras, Lengua, Surco vestibular, Úvula, Paladar duro, Paladar blando, Piso de la boca, Glándulas salivales, Frenillo labial superior, Frenillo labial inferior, Frenillo lingual, Encías, Musculares).
- Migrar internamente valores previos `'alterado'` -> `'anormal'` en función pura compatible hacia atrás sin perder datos históricos.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-tejidos-blandos/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/funciones/tejidos-blandos.funcion.ts` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Backfill compatible de `'alterado'` a `'anormal'` o mapeo dual documentado en el contrato v1.

## Reglas de negocio y contrato
- Etiqueta visible «Anormal» (frente a «Alterado» anterior) manteniendo compatibilidad con datos históricos.
- Observación por estructura visible solo cuando es `'anormal'` (opcional, no bloqueante).

## Casos de prueba
- Lectura de registros antiguos con `'alterado'`, selección tri-estado con `null` por defecto, autoguardado.
