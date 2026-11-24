# Tracker 15 — Recordatorios WhatsApp: panel de pendientes (mejora Dentalink)

- **Plan:** [`15_recordatorios-whatsapp_plan.md`](../fase_de_desarrollo/15_recordatorios-whatsapp_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [x] Revisar plan y contrato (`15_recordatorios-whatsapp_expediente.json`)
- [x] Sin pista datos: reusa `citas` + `mensajes_enviados` + servicios existentes; sin migración ni tipos nuevos
- [x] Implementar panel + funciones puras + specs (`cliente-web`): `features/recordatorios/**`, rutas, sidenav, bottom-nav
- [~] Gates locales: tsc/build/test verde (27 tests, +2 nuevos) según cliente-web; `sincronizar.mjs --check` omitido (no se tocaron reglas/agentes). Reconfirmar en `verificador`.
- [~] Revisión adversarial (`verificador`) — en curso
- [ ] Commit

## Decisiones
- Enfoque: panel de pendientes manual-asistido (wa.me). NO Business API, sin costo ni consentimiento nuevo (decisión del usuario).
- Ventana: citas de mañana (24h) en America/Bogota.

## Pendientes
- Tamaño táctil del botón "Enviar recordatorio": host `app-button` lleva `min-h-10 min-w-10` pero el `<button>` interno (size md, `py-2`) puede quedar <40px efectivos → corregir según hallazgo de `verificador`.
- Manual de usuario creado: `docs/manual/recordatorios.md` (primera página de manual del repo; fija convención `docs/manual/`).
- Verificación visual del flujo wa.me en navegador queda para QA manual del usuario.
