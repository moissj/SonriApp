# Tracker 18 — Consentimientos informados (subir firmado en papel)

- **Plan:** [`18_consentimientos-informados_plan.md`](../fase_de_desarrollo/18_consentimientos-informados_plan.md)
- **Contrato:** [`18_consentimientos-informados_expediente.json`](../fase_de_desarrollo/18_consentimientos-informados_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-consentimientos-informados-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec committeado
- [x] Contrato `expediente.json` v1 (modelo, SQL, RLS, Storage, interfaces, funciones, integración)
- [x] **F1 Datos** (`capa-datos`): migración `20261124130000_consentimientos_informados.sql` (2 tablas + bucket + 9 policies + 2 triggers + 2 índices + seed 5 tipos). Idempotente, reversible, verificada contra contrato. **Sin aplicar a prod.**
- [x] **F2 Cliente odontólogo** (`cliente-web`): módulo `features/consentimientos/` + servicio (URL firmada TTL 60s, rollback de objeto, anular con motivo) + sección en detalle paciente + vista imprimible (`@media print` global) + 2 funciones puras con specs (40 tests). Servicio verificado (sin `getPublicUrl`, sin PII, columnas explícitas)
- [x] **F3 Admin catálogo** (`cliente-web`): pantalla CRUD super_admin (`configuracion/consentimientos`, adminGuard); service += `listarTodos/crear/editar(sube version)/activar`
- [ ] Gates locales verde (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false`, `sincronizar.mjs --check`)
- [x] Revisión adversarial (`verificador`): **APROBADO_CON_RESERVAS**, 0 bloqueantes, 4 gates verde; todas las refutaciones de RLS/integridad/storage/PII fallaron
- [x] Endurecimiento de reservas (contrato v2, `capa-datos`): insert valida pertenencia del paciente; trigger de inmutabilidad + no-des-anular. Migración v2 (sin aplicar)
- [x] Commits locales (F1, F2+F3, endurecimiento)
- [x] Migración aplicada a **producción** (Management API, 2026-11-24): verificado 2 tablas+RLS, 9 policies (sin DELETE en consentimientos_paciente), bucket privado, 3 triggers, seed 5 tipos; registrada en `supabase_migrations.schema_migrations` (sin drift)
- [x] Push a `origin/main` (OK explícito del usuario)

## Pendientes / deuda
- **Sin verificación e2e contra BD real** (migración no aplicada; sin Supabase CLI local): bucket, policies y join `catalogo:catalogo_consentimientos` sin probar de punta a punta.
- `catalogo-admin`: botones nativos 40×40 (app-button <40px); textarea angosto en `app-modal` (`max-w-sm`); `editar()` lee-version→update no atómico (OK con 1 super_admin, shortcut comentado); sin enlace de navegación a `configuracion/consentimientos`.
- `mapear()` del servicio usa `any` (sin tipos Supabase generados en el repo).
- Validación legal con profesional (Ley 527, habeas data, retención, menores) antes de uso real.
- Relleno del cuerpo real de cada plantilla por super_admin (seed va vacío).
- Aplicar migración a producción: requiere OK explícito.
- Manual de usuario de la pantalla (si se libera).
- Revocar/rotar el PAT de Supabase expuesto en sesiones previas.
