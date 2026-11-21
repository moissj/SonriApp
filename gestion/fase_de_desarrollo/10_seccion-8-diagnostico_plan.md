# Plan 10 — Sección 8 Diagnóstico inicial

- **ID:** `10_seccion-8-diagnostico`
- **Estado:** Pendiente de ejecución (depende de Plan 01)
- **Tracker:** [`gestion/tracker/10_seccion-8-diagnostico.md`](../tracker/10_seccion-8-diagnostico.md)

## Objetivo
Implementar la Sección 8 («Diagnóstico» inicial de la historia clínica), diferenciándola claramente del diagnóstico por nota de evolución diaria en `evoluciones/`.

## Enfoque
- Componente dedicado `seccion-diagnostico` (`OnPush`, Reactive Forms, autoguardado de borrador).
- Preparar estructura para futura vinculación opcional de catálogo CIE-10 sin acoplarse ni inventar códigos hoy.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-diagnostico/` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Usa columna `diagnostico_inicial` definida en Plan 01.

## Casos de prueba
- Persistencia, límites de longitud, restauración de borrador tras recarga y bloqueo en historia cerrada.
