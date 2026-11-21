# Plan 02 — Controles clínicos reutilizables tri-estado y validaciones

- **ID:** `02_controles-clinicos-reutilizables`
- **Estado:** Pendiente de ejecución (depende de Plan 01)
- **Tracker:** [`gestion/tracker/02_controles-clinicos-reutilizables.md`](../tracker/02_controles-clinicos-reutilizables.md)

## Objetivo
Construir en `src/app/shared/` los controles clínicos reactivos reutilizables (`ControlValueAccessor` / señales) y funciones puras de fechas, edad y validación de documento para todas las secciones del formulario.

## Enfoque
1. Crear funciones puras en `src/app/shared/funciones/`:
   - `fechas-clinicas.funcion.ts` + `.spec.ts`: cálculo de edad en `America/Bogota`, parseo seguro `YYYY-MM-DDT12:00:00Z`, formato colombiano (`dd/MM/yyyy`).
   - `validacion-documento.funcion.ts` + `.spec.ts`: reglas de longitud/patrón por tipo (`CC`, `TI`, `CE`, `PA`, `RC`, y `PPT`/`NUIP` si se aprueban).
2. Crear componentes reutilizables (`OnPush`, objetivos táctiles ≥ 40×40 px, orden de tab lógico, `aria-pressed` y `<label>`):
   - Tri-estado `Sí / No / No evaluado` (`null` explícito, deseleccionable al tocar de nuevo o botón explícito «No eval.») con observación condicional obligatoria cuando `critico === true && valor === 'si'`.
   - Tri-estado `Normal / Anormal / No evaluado` (`null` explícito) con observación condicional.
   - Control de lateralidad `Derecha / Izquierda / Ambas` (`D / I / D+I`).
   - Selector de escala numérica `1–6` (frecuencia de cepillado).
   - Selector múltiple con campo «Otro» condicional.
   - Indicador reutilizable de estado de borrador («Guardado hace…» / «Cambios sin guardar» / «Error al guardar»).

## Archivos a crear / modificar
- `src/app/shared/funciones/fechas-clinicas.funcion.ts` (+ `.spec.ts`)
- `src/app/shared/funciones/validacion-documento.funcion.ts` (+ `.spec.ts`)
- `src/app/shared/components/clinical-tristate/` (+ `.spec.ts`)
- `src/app/shared/components/clinical-laterality/` (+ `.spec.ts`)
- `src/app/shared/components/clinical-scale/` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Ninguno (usa el contrato aprobado en Plan 01).

## Reglas de negocio y contrato
- Nunca inicializar respuestas clínicas en `false` (`null` = no evaluado).
- Observación visible solo al marcar `si` o `anormal`; obligatoria únicamente en ítems críticos de alerta.

## Casos de prueba
- Cumpleaños en UTC-5 (`America/Bogota`) a las 23:30 sin desfase de 1 día.
- Tri-estado alterna correctamente entre `null`, `'si'` y `'no'`; validador exige observación solo en ítem crítico marcado `'si'`.
- Validación por cada tipo de documento colombiano.
