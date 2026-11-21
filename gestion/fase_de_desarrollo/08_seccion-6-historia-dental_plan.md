# Plan 08 — Sección 6 Historia dental

- **ID:** `08_seccion-6-historia-dental`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/08_seccion-6-historia-dental.md`](../tracker/08_seccion-6-historia-dental.md)

## Objetivo
Completar al 100 % la Sección 6 («Historia dental») respecto al formato en papel, corrigiendo la inversión actual de `ubicación` y añadiendo todos los ítems faltantes (hábitos maestro, supernumerarios, retracciones, alteración periodontal, higiene oral, cepillado 1–6, seda, enjuague + frecuencia, fluorización y sellantes).

## Enfoque
- Corregir inversión detectada en `examen-ingreso.html`: **`ubicación` va en `sensibilidad`**, no en `cuellos_expuestos`.
- Usar componente de lateralidad `D / I / D+I` en `dolor_atm`, `ruido_articular` y `desviacion_apertura` (visible cuando respuesta es `'si'`).
- Añadir interruptor maestro `habitos_orales` (`S / N / null`) y los 4 sub-hábitos (`succion_digital` con observación, `habito_lengua`, `habito_unas`, `chupete`).
- Añadir bloques nuevos: `supernumerarios` (+ descripción), `retracciones`, `alteracion_periodontal` (sangrado, placa blanda, cálculo, bolsa periodontal — cada uno S/N/null), `higiene_oral` (`buena | regular | mala | null`), `frecuencia_cepillado` (escala `1..6`), `uso_seda_dental`, `uso_enjuague_bucal` (+ `frecuencia`), `terapia_fluorizacion`, `sellantes` (+ detalle).

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-historia-dental/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/funciones/historia-dental.funcion.ts` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Contrato `historia_dental` v1 en Plan 01 y migración de datos existentes preservando observaciones previas de `cuellos_expuestos`.

## Casos de prueba
- Migración de JSONB previo de `examen-ingreso` sin perder datos; lateralidad visible solo al responder `'si'`; escala 1–6 de cepillado.
