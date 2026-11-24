# Plan 16 — Fixes: EPS duplicada en registro + botones marcar todos S/N en examen de ingreso

- **ID:** `16_fixes-eps-y-marcar-todos`
- **Estado:** Pendiente de ejecución
- **Tracker:** [`gestion/tracker/16_fixes-eps-y-marcar-todos.md`](../tracker/16_fixes-eps-y-marcar-todos.md)

## Objetivo
<!-- Qué problema clínico o técnico resuelve este plan y qué queda fuera de alcance. -->

## Enfoque
<!-- Decisiones clave de diseño y orden de pistas (BD -> tipos -> funciones -> cliente -> verificador). -->

## Archivos a crear / modificar
- *(Definir antes de delegar)*

## Cambios de BD / SQL / RLS
- *(Ninguno o detallar migración idempotente + RLS fail-closed + reversibilidad)*

## Reglas de negocio y contrato
- Contrato versionado: `gestion/fase_de_desarrollo/16_fixes-eps-y-marcar-todos_expediente.json` (si aplica).
- Cero pérdida o sobrescritura silenciosa de datos clínicos existentes.

## Casos de prueba
- *(Casos borde, pruebas unitarias y aislamiento RLS entre consultorios con datos sintéticos)*
