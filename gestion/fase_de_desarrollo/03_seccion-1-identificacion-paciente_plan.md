# Plan 03 — Sección 1 Identificación y datos del paciente

- **ID:** `03_seccion-1-identificacion-paciente`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/03_seccion-1-identificacion-paciente.md`](../tracker/03_seccion-1-identificacion-paciente.md)

## Objetivo
Refactorizar `pacientes/formulario` (`< 200` líneas por archivo) alineándolo con la Sección 1 del formato en papel y las mejoras de consultorio, sin perder ningún campo ya existente (`email`, `departamento`, EPS, ubicación DANE).

## Enfoque
- Separar lógica de normalización y validadores a `src/app/features/pacientes/funciones/paciente-form.funcion.ts` (+ `.spec.ts`).
- Aplicar validación de documento por tipo desde `validacion-documento.funcion.ts` y edad en `America/Bogota` desde `fechas-clinicas.funcion.ts`.
- Ajustar `remite` según matriz aprobada (texto libre o contacto opcional si así se aprueba frente a papel).
- Agregar autoguardado local de borrador con estado visible y `canDeactivate` guard para avisar antes de salir con cambios sin guardar.
- Garantizar objetivos táctiles ≥ 40 px y manejo explícito de errores de carga/guardado.

## Archivos a crear / modificar
- `src/app/features/pacientes/funciones/paciente-form.funcion.ts` (+ `.spec.ts`)
- `src/app/features/pacientes/formulario/formulario.ts` / `.html` / subcomponentes por sub-bloque
- `src/app/core/services/patient.service.ts` (select explícito y propagación real de errores)

## Cambios de BD / SQL / RLS
- Solo si el Plan 01/matriz aprueba relajar `remite` o añadir tipos de documento/campos adicionales.

## Reglas de negocio y contrato
- `nombre_completo` sigue siendo columna generada en BD (jamás enviarla en `INSERT`/`UPDATE`).
- Normalización celular colombiano `+57` / 10 dígitos preservada.

## Casos de prueba
- Creación y edición con payload limpio; error `23505` (documento duplicado) legible; guardia de salida con formulario sucio.
