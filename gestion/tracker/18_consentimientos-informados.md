# Tracker 18 — Consentimientos informados (subir firmado en papel)

- **Plan:** [`18_consentimientos-informados_plan.md`](../fase_de_desarrollo/18_consentimientos-informados_plan.md)
- **Contrato:** [`18_consentimientos-informados_expediente.json`](../fase_de_desarrollo/18_consentimientos-informados_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-consentimientos-informados-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec committeado
- [x] Contrato `expediente.json` v1 (modelo, SQL, RLS, Storage, interfaces, funciones, integración)
- [x] **F1 Datos** (`capa-datos`): migración `20261124130000_consentimientos_informados.sql` (2 tablas + bucket + 9 policies + 2 triggers + 2 índices + seed 5 tipos). Idempotente, reversible, verificada contra contrato. **Sin aplicar a prod.**
- [ ] **F2 Cliente odontólogo** (`cliente-web`): módulo `features/consentimientos/` + servicio + sección en detalle paciente (listar/subir/ver URL firmada/anular) + vista imprimible + specs funciones
- [ ] **F3 Admin catálogo** (`cliente-web`): pantalla CRUD super_admin (`configuracion/consentimientos`, adminGuard)
- [ ] Gates locales verde (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false`, `sincronizar.mjs --check`)
- [ ] Revisión adversarial (`verificador`): contrato, RLS fail-closed, integridad, Storage, datos sensibles
- [ ] Commit (push/prod/aplicar migración → OK explícito)

## Pendientes / deuda
- Validación legal con profesional (Ley 527, habeas data, retención, menores) antes de uso real.
- Relleno del cuerpo real de cada plantilla por super_admin (seed va vacío).
- Aplicar migración a producción: requiere OK explícito.
- Manual de usuario de la pantalla (si se libera).
- Revocar/rotar el PAT de Supabase expuesto en sesiones previas.
