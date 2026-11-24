# Plan 19 — Recordatorios mejorados (por día, enviados, enviar todos)

- **ID:** `19_recordatorios-mejorados`
- **Estado:** En ejecución
- **Tracker:** [`gestion/tracker/19_recordatorios-mejorados.md`](../tracker/19_recordatorios-mejorados.md)
- **Diseño aprobado:** [`docs/superpowers/specs/2026-11-24-recordatorios-mejorados-design.md`](../../docs/superpowers/specs/2026-11-24-recordatorios-mejorados-design.md)
- **Contrato:** [`19_recordatorios-mejorados_expediente.json`](19_recordatorios-mejorados_expediente.json)

## Objetivo
Mejorar el módulo de recordatorios: listar citas **agrupadas por día** (próximos 7 días) con estado de recordatorio, mostrar los **enviados** con opción de **volver a enviar**, y **"Enviar todos (N)"** por día (abre 1 pestaña `wa.me` por pendiente en el mismo gesto del clic).

**Fuera de alcance (YAGNI):** envío automático/programado, API oficial WhatsApp Business, plantilla por reintento, otros tipos de mensaje, migración o tabla nueva.

## Enfoque
Frontend-only, **sin BD**. Reusa `WhatsappService` (click-to-chat `wa.me` + registro en `mensajes_enviados`) y `CitaService`. Se extrae la agrupación a una función pura con spec. Un solo especialista (`cliente-web`) → `verificador`.

## Archivos a crear / modificar
- **Crear:** `funciones/agrupar-por-dia.funcion.ts` (+ `.spec.ts`).
- **Modificar:** `services/recordatorio.service.ts` (`getRecordatoriosRango`), `recordatorios.ts`, `recordatorios.html`.
- **Posible baja:** `funciones/pendientes.funcion.ts` / `ventana-manana.funcion.ts` (+specs) si quedan sin uso.
- Detalle ruta:línea e interfaces en el `expediente.json`.

## Cambios de BD / SQL / RLS
- **Ninguno.** Se reutiliza `mensajes_enviados` (ya tiene `cita_id`, `tipo_plantilla`, `created_at`, RLS por `odontologo_id`).

## Reglas de negocio y contrato
- `window.open` dentro del gesto del clic (antes de cualquier `await`), si no el navegador bloquea.
- Reutilizar siempre `WhatsappService`; nunca construir URLs de WhatsApp aparte.
- "Enviar todos" por día con confirmación del N; depende de que el usuario permita pop-ups (limitación del navegador) → aviso la 1ª vez.
- Volver a enviar registra un nuevo envío (auditoría).
- Fechas `America/Bogota` sin desfase; error de Supabase propagado; sin código muerto tras el reshape.

## Casos de prueba
- `agrupar-por-dia.spec.ts`: agrupa por día; separa enviado/pendiente por presencia en el map; `ultimoEnvio` correcto; orden por hora; tope 7 días; `America/Bogota` sin desfase.
- UI: sin teléfono → deshabilitado y excluido de N; error de carga → estado de error (nunca "sin registros").
