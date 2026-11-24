# Tracker 14 — Reconciliar migraciones base (reproducibilidad repo<->prod)

- **Plan:** [`14_reconciliar-migraciones-base_plan.md`](../fase_de_desarrollo/14_reconciliar-migraciones-base_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [x] Contrato + snapshot DDL vivo (`_expediente.json`, `_ddl-vivo.md`) desde Management API (solo lectura)
- [x] Implementar baseline `supabase/migrations/20260701000000_baseline_tablas_base.sql` (capa-datos)
- [x] Revisión adversarial contra esquema vivo (N0): corregidos 2 bugs — (A) faltaba `pacientes.nombre_completo` original que `20260705040728` lee y dropea; (B) policy DELETE de citas renombrada a `"citas: cancelar/eliminar propias"` (nombre real de prod). Enums y nombres SELECT cotejados vs prod.
- [~] Gates locales: `tsc/build/test` NO corridos (cambio SQL+docs, no toca TS; árbol con `.ts` WIP ajeno). `supabase db reset` BLOQUEADO (sin Docker/CLI) → verificación lógica + grep de colisiones (ninguna).
- [x] Commit

## Pendientes
- Verificar fidelidad real con `supabase db reset` cuando haya Docker/CLI.
- `db push` a prod NO ejecutado (requiere OK explícito; la baseline es no-op idempotente en prod).
- Verificado que el resto de enums/funciones sí los crean migraciones existentes: `rol_usuario_enum`, `estado_cuenta_enum`, `is_super_admin`, `protect_profile_privileged_cols` en `20260702010429`; `is_cuenta_activa` en `20260702015419`. `handle_new_user` + trigger `on_auth_user_created` NO estaban en repo (drift) → agregados a la baseline.
