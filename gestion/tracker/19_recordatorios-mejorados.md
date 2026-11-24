# Tracker 19 — Recordatorios mejorados (por día, enviados, enviar todos)

- **Plan:** [`19_recordatorios-mejorados_plan.md`](../fase_de_desarrollo/19_recordatorios-mejorados_plan.md)
- **Contrato:** [`19_recordatorios-mejorados_expediente.json`](../fase_de_desarrollo/19_recordatorios-mejorados_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-recordatorios-mejorados-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec committeado
- [x] Contrato `expediente.json` v1 (frontend-only, sin BD)
- [ ] Implementación (`cliente-web`): `getRecordatoriosRango` + `agrupar-por-dia` (+spec) + reshape componente (por día, enviados, enviar todos, volver a enviar) + limpieza de código muerto
- [ ] Gates locales verde (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false`, `sincronizar.mjs --check`)
- [ ] Revisión adversarial (`verificador`): gesto del clic, reuso WhatsappService, zona horaria, error-handling, sin código muerto
- [ ] Commit (push → OK explícito)

## Pendientes / deuda
- Envío en lote depende de que el usuario permita pop-ups del sitio (limitación del navegador).
- Envío automático/programado y API oficial WhatsApp Business: fuera de alcance (plan aparte).
- Manual de usuario de recordatorios: actualizar si se libera la pantalla.
