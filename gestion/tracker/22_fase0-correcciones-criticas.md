# Tracker 22 — Fase 0 — Correcciones criticas UI

- **Plan:** [`22_fase0-correcciones-criticas_plan.md`](../fase_de_desarrollo/22_fase0-correcciones-criticas_plan.md)
- **Contrato:** [`22_fase0-correcciones-criticas_expediente.json`](../fase_de_desarrollo/22_fase0-correcciones-criticas_expediente.json)
- **Brief maestro:** `docs/producto/rediseno-sonriapp-brief.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Contrato `expediente.json` + plan + tracker
- [x] Lucide instalado (`lucide-angular ^1.0.0`)
- [x] T1 — `fecha-bogota.funcion.ts` (+spec) aplicado en citas/inicio (bug "hoy") — commit `62a231e`
- [x] T2 — Cita modal: conflicto solo con paciente+fecha+hora (usa `selectedPatient()`) — `62a231e`
- [x] T3 — Antecedentes `null` + modo `si-no-nosabe` + sin "Todos Si" — `62a231e`
- [x] T4 — `tieneAlergiaReal` + chip neutro — `62a231e`
- [x] Gates verde T1-T4 (tsc 0 / build ok / 55 tests / sincronizar OK)
- [x] T5 — 24 emojis -> iconos Lucide (`app.config` registra 20; `empty-state` por nombre) — commit `2fca604`
- [x] Revisión adversarial (`verificador`): **APROBADO**, 0 bloqueantes (fecha Bogota real, conflicto con paciente, antecedentes null+tri-estado, chip alergia, 0 emojis en UI, sin cambios de datos/RLS)
- [ ] **Pendiente OK:** push

## Deuda no-bloqueante
- `cita-modal.ts` 221 lineas (>200) — PREEXISTENTE, diff minimo.
- JSDoc de `mode` en checklist-item omite `si-no-nosabe` (el type si lo incluye).
- Emojis en TEXTO de mensajes WhatsApp (`plantilla.service.ts`, `presupuestos.ts:281`) — contenido al paciente, no UI; se conservan.

## Pendientes / deuda (a fases posteriores)
- "Ver horarios libres" en modal de cita -> Fase 2 (4.3).
- Alerta medica desde antecedente "Si" + observacion obligatoria -> Fase 3 (4.7).
