# Plan 13 — Auditoría y control de acceso a datos sensibles

- **ID:** `13_auditoria-acceso-datos-sensibles`
- **Estado:** Pendiente de ejecución (depende de Plan 01)
- **Tracker:** [`gestion/tracker/13_auditoria-acceso-datos-sensibles.md`](../tracker/13_auditoria-acceso-datos-sensibles.md)

## Objetivo
Completar el endurecimiento de privacidad sobre datos sensibles de salud: bitácora de auditoría de lectura/escritura/cierre de historias clínicas, verificación RLS uniforme (`is_cuenta_activa()` en todas las tablas clínicas y `catalogo_eps`), sanitización de logs/errores y checklist legal para revisión con profesional jurídico en Colombia.

## Enfoque
- Tabla `auditoria_accesos_clinicos` (append-only, `INSERT` vía RPC/triggers `SECURITY DEFINER` con `search_path = public`, sin `UPDATE`/`DELETE`).
- Auditoría automática de `INSERT`/`UPDATE`/cierre/enmienda en historia clínica y registro explícito de apertura de historia clínica o revelación de alerta enmascarada.
- Revisar `supabase/migrations/**` para asegurar `is_cuenta_activa()` en `historia_clinica_inicial` y tablas auxiliares.
- Sanitizar `console.error` en services clínicos para nunca volcar payloads de pacientes.

## Archivos a crear / modificar
- `supabase/migrations/<ts>_auditoria_datos_sensibles.sql`
- `supabase/tests/rls_aislamiento_clinico.sql`
- `docs/clinica/checklist-normativo-colombia.md` (temas legales marcados «a validar con profesional»)

## Cambios de BD / SQL / RLS
- Tabla `auditoria_accesos_clinicos` con RLS restrictiva (cada odontólogo consulta solo sus logs o ninguno modificable; `super_admin` auditado).
- Pruebas pgTAP/smoke de aislamiento entre `odontologo_A` y `odontologo_B` y rechazo a cuenta suspendida.

## Casos de prueba
- `odontologo_B` recibe 0 filas al consultar paciente/historia/auditoría de `odontologo_A`.
- Ningún usuario puede borrar o alterar filas en `auditoria_accesos_clinicos`.
