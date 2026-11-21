# Plan 07 — Sección 5 Funciones vitales

- **ID:** `07_seccion-5-funciones-vitales`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/07_seccion-5-funciones-vitales.md`](../tracker/07_seccion-5-funciones-vitales.md)

## Objetivo
Implementar la Sección 5 («Funciones vitales»: Respiración `nasal | oral`, Deglución `normal | atipica`, Fonación `normal | anormal`, Succión `normal | anormal`) con controles táctiles ≥ 40 px y estado inicial `null` («No evaluado»).

## Enfoque
- Sustituir `<select>` básicos de `examen-ingreso` por controles segmentados táctiles tri-estado reutilizables (`OnPush`, Reactive Forms).
- Mantener compatibilidad al leer registros antiguos donde fonación/succión guardaban `'alterada'`.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-funciones-vitales/` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- `CHECK` constraints acordes en el contrato v1 (`NULL` permitido hasta cierre si aplica).

## Reglas de negocio y contrato
- Cada función inicia en `null` (no evaluada) y permite deselección explícita.

## Casos de prueba
- Mapeo de valores heredados (`alterada` -> `anormal`), navegación por teclado y guardado con estados parciales.
