# Plan 12 — Alertas clínicas visibles en cabecera y odontograma

- **ID:** `12_alertas-clinicas-cabecera`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 05)
- **Tracker:** [`gestion/tracker/12_alertas-clinicas-cabecera.md`](../tracker/12_alertas-clinicas-cabecera.md)

## Objetivo
Mostrar alertas clínicas destacadas (alergias, trastornos de coagulación, embarazo, enfermedades infectocontagiosas/hepatitis/VIH, cardiopatías e ingestión de medicamentos) en la cabecera fija de la historia clínica, ficha del paciente y banner externo sobre el odontograma, **sin tocar el SVG del odontograma**.

## Enfoque
- Función pura `alertas-clinicas.funcion.ts` (+ `.spec.ts`) que evalúa antecedentes críticos y `pacientes.alergias` siguiendo la regla aprobada en Plan 01 (incluyendo enmascaramiento selectivo de condiciones ultra-sensibles con revelación bajo clic).
- Componente reutilizable `app-alertas-clinicas-banner` en `src/app/shared/components/`.
- Insertarlo en la cabecera sticky de `historia-clinica.html`, en `pacientes/detalle/detalle.html` (fuera del tab, arriba de las pestañas) y sobre el contenedor del odontograma sin modificar `odontograma.ts`/`odontograma.html`.

## Archivos a crear / modificar
- `src/app/shared/funciones/alertas-clinicas.funcion.ts` (+ `.spec.ts`)
- `src/app/shared/components/alertas-clinicas-banner/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/historia-clinica.*`
- `src/app/features/pacientes/detalle/detalle.*`

## Cambios de BD / SQL / RLS
- Vista o select acotado que exponga resumen de alertas del paciente al odontólogo dueño sin traer todo el JSONB.

## Casos de prueba
- Priorización de alertas, enmascaramiento de VIH/SIDA hasta clic explícito, ausencia de cambios sobre el SVG del odontograma.
