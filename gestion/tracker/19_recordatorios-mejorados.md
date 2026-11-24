# Tracker 19 — Recordatorios mejorados (por día, enviados, enviar todos)

- **Plan:** [`19_recordatorios-mejorados_plan.md`](../fase_de_desarrollo/19_recordatorios-mejorados_plan.md)
- **Contrato:** [`19_recordatorios-mejorados_expediente.json`](../fase_de_desarrollo/19_recordatorios-mejorados_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-recordatorios-mejorados-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec committeado
- [x] Contrato `expediente.json` v1 (frontend-only, sin BD)
- [x] Implementación (`cliente-web`): `getRecordatoriosRango` + `agrupar-por-dia` (+spec, 39 tests) + reshape componente (por día, enviados, enviar todos con confirmación+aviso pop-up, volver a enviar) + baja de 4 funciones muertas (`pendientes`, `ventana-manana` +specs)
- [x] Manual actualizado (`docs/manual/recordatorios.md`): nuevo flujo por día + enviar todos + pop-ups
- [x] Gates locales verde (tsc / test 39 / build / sincronizar)
- [x] Revisión adversarial (`verificador`): **APROBADO**, 0 bloqueantes; refutaciones de gesto/WhatsappService/zona horaria/error/código-muerto fallaron todas
- [x] Commit local. **Pendiente OK explícito:** push

## Pendientes / deuda
- Nit (verificador, no bloqueante): `enviarTodos` no fija `enviandoId`, los botones del lote no quedan `[disabled]` durante el envío; cosmético (los `window.open` disparan síncronos, sin doble inserción dañina).
- Nit (verificador, no bloqueante): tamaño táctil del botón "Enviar todos" sin confirmar ≥40×40 (los por-cita usan `size lg`).
- Envío en lote depende de que el usuario permita pop-ups del sitio (limitación del navegador).
- Envío automático/programado y API oficial WhatsApp Business: fuera de alcance (plan aparte).
- Manual de usuario de recordatorios: actualizar si se libera la pantalla.
