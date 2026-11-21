# Plan 11 — Sección 9 Plan de tratamiento ortopédico e integral

- **ID:** `11_seccion-9-plan-tratamiento`
- **Estado:** Pendiente de ejecución (depende de Plan 01)
- **Tracker:** [`gestion/tracker/11_seccion-9-plan-tratamiento.md`](../tracker/11_seccion-9-plan-tratamiento.md)

## Objetivo
Implementar la Sección 9 («Plan de tratamiento ortopédico e integral») de la historia clínica inicial y el flujo explícito de cierre/firma de la historia completa.

## Enfoque
- Componente `seccion-plan-tratamiento` (`OnPush`, Reactive Forms, autoguardado).
- Botón de cierre de historia con resumen de validaciones pendientes (por ej. ítems críticos marcados `'si'` sin observación) y modal de confirmación antes de pasar a `'cerrada'`.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-plan-tratamiento/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/historia-clinica.ts` / `.html`

## Cambios de BD / SQL / RLS
- Usa columna `plan_tratamiento_integral` y RPC/transición de cierre definida en Plan 01.

## Casos de prueba
- Cierre bloqueado si hay campos críticos sin observación; transición a `'cerrada'` vuelve los formularios de solo lectura.
