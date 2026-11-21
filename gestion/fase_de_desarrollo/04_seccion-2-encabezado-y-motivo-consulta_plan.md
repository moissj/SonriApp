# Plan 04 — Encabezado N° historia y Sección 2 Motivo de consulta

- **ID:** `04_seccion-2-encabezado-y-motivo-consulta`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/04_seccion-2-encabezado-y-motivo-consulta.md`](../tracker/04_seccion-2-encabezado-y-motivo-consulta.md)

## Objetivo
Implementar el encabezado clínico de apertura (fecha de apertura Día/Mes/Año en `America/Bogota` + `numero_historia` único por odontólogo) y la Sección 2 («Motivo de consulta» inicial), hoy ausentes en `examen-ingreso`.

## Enfoque
- Mostrar barra de progreso de las secciones 2 a 9 en `historias-clinicas/historia-clinica`.
- Generar `numero_historia` consecutivo en servidor (secuencia/función SQL segura por `odontologo_id`) o editable con unicidad `(odontologo_id, numero_historia)` según lo definido en Plan 01.
- Crear componente de sección `seccion-motivo-consulta` (`OnPush`, Reactive Forms, autoguardado de borrador).

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/encabezado-historia/`
- `src/app/features/historias-clinicas/components/seccion-motivo-consulta/`
- `src/app/features/historias-clinicas/historia-clinica.ts` / `.html`

## Cambios de BD / SQL / RLS
- Consumir columnas aprobadas en Plan 01 (`fecha_apertura`, `numero_historia`, `motivo_consulta_inicial`).

## Reglas de negocio y contrato
- `numero_historia` nunca colisiona entre pacientes del mismo odontólogo; timestamp oficial en servidor.

## Casos de prueba
- Asignación consecutiva sin duplicados; validación de motivo de consulta requerido al cerrar historia.
