# Plan 05 — Sección 3 Antecedentes de salud

- **ID:** `05_seccion-3-antecedentes-salud`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/05_seccion-3-antecedentes-salud.md`](../tracker/05_seccion-3-antecedentes-salud.md)

## Objetivo
Migrar la Sección 3 de `examen-ingreso` a Reactive Forms tipados con los 21 ítems exactos verificados del papel, controles tri-estado (`Sí / No / No evaluado`), observación condicional obligatoria únicamente en los 8 ítems críticos de alerta, toma de presión, temperatura corporal y observaciones generales.

## Enfoque
- Reemplazar `ChecklistItemComponent` (`ngModel` + getter `opciones`) por el control tri-estado reutilizable de Plan 02.
- Etiqueta exacta «Úlceras / gastritis» y corrección ortográfica de «Reacciones alérgicas».
- Validación de signos vitales: formato de presión arterial (`SIS/DIA`, ej. `120/80`) y rango de temperatura (`34.0–43.0 °C`).
- Marcar visualmente los ítems críticos que alimentan las alertas clínicas de cabecera.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-antecedentes-salud/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/funciones/antecedentes.funcion.ts` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Consumir tabla/columnas del contrato v1 (Plan 01), con backfill sin pérdida desde `antecedentes_salud` previo.

## Reglas de negocio y contrato
- Observación oculta cuando es `no` o `null`; visible al elegir `si`; obligatoria solo en ítems críticos de alerta.

## Casos de prueba
- Validación cruzada en ítems críticos vs no críticos; hidratación desde registros antiguos sin perder observaciones previas.
