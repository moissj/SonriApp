# Plan 22 — Fase 0: Correcciones criticas UI

- **Tracker:** [`gestion/tracker/22_fase0-correcciones-criticas.md`](../tracker/22_fase0-correcciones-criticas.md)
- **Contrato:** [`22_fase0-correcciones-criticas_expediente.json`](22_fase0-correcciones-criticas_expediente.json)
- **Brief:** `docs/producto/rediseno-sonriapp-brief.md` (seccion 1)

## Objetivo
Corregir los bugs criticos de UI antes del rediseno: desfase de fecha "hoy", aviso de conflicto prematuro en nueva cita, antecedentes preseleccionados, chip de alergia falso-positivo, y emojis en UI. Sin tocar modelo de datos ni RLS.

## Tareas (detalle y contrato en `expediente.json`)
1. **T1 Fecha Bogota** (`cliente-web`): utilidad pura `fecha-bogota.funcion.ts` + spec; aplicar en `citas.ts` e `inicio.ts`.
2. **T2 Cita conflicto** (`cliente-web`): guarda `paciente_id` en el `valueChanges` de `cita-modal.ts`.
3. **T3 Antecedentes** (`cliente-web`): `checklist-item` tri-estado Si/No/No sabe (opciones `computed`), sin preseleccion, quitar "Todos Si".
4. **T4 Alergia** (`cliente-web`): helper puro `tieneAlergiaReal` + spec; chip neutro en `detalle.html`.
5. **T5 Iconos/tildes** (`cliente-web` + barrido): reemplazar 24 emojis por Lucide; corregir tildes/capitalizacion.

## Cierre
Gates verde → `verificador` → commit local → push con OK. Cada tarea deja su pantalla revisada (1366/1920/390).
