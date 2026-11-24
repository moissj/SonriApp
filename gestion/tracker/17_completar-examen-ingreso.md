# Tracker 17 — Completar examen de ingreso: secciones 6-resto, 7 y 9

- **Plan:** [`17_completar-examen-ingreso_plan.md`](../fase_de_desarrollo/17_completar-examen-ingreso_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [x] Contrato `17_..._expediente.json` (modelo §6/§7/§9, decisiones usuario: apnea A=Alterada, §8 reusa evolución, §9 texto libre)
- [x] Migración `20261124000000_add_exploracion_facial_y_plan_tratamiento.sql` (capa-datos): +exploracion_facial jsonb, +plan_tratamiento text; idempotente, reversible, sin cambio RLS
- [x] Implementación (cliente-web): subcomponente `exploracion-facial/` (§7), filas §6 (hábitos orales, supernumerarios, sellantes, cepillado 1-6, seda, enjuague) + fix ubicación (sensibilidad↔cuellos), textarea §9; refactor examen-ingreso.ts 288→198 (extrae `examen-ingreso.constantes.ts`, unifica getters en patchEntry, quita código muerto); specs actualizados
- [x] Gates locales verde: TSC_OK, BUILD_OK, TEST_OK (31), SYNC_OK (aviso budget CSS +175 b, no bloquea)
- [x] Revisión adversarial (`verificador`): **APROBADO** (re-corrido 2026-11-24). 0 regresiones en §3/4/5/6; refutación falló en todos los puntos. Hallazgos no bloqueantes: §6 botones 26×26 (deuda preexistente), hydrate() spread superficial en objetos anidados (seguro hoy), RLS sin is_cuenta_activa() (diferido a Plan 01).
- [x] Commit + push: en `9beb752` (commit amplio del usuario) + ya en origin/main
- [x] Migración aplicada a **producción** vía Management API (2026-11-24): columnas verificadas + registradas en `supabase_migrations.schema_migrations` (sin drift)

## Pendientes / deuda
- §6 filas nuevas reusan `.si-no-btn` de 26×26 px (< 40×40 de la regla de accesibilidad); misma deuda que las filas existentes. Corregir al unificar estilos del examen de ingreso.
- `examen-ingreso.css` +175 b sobre budget (aviso). Mover a Tailwind o recortar al unificar.
- Orden de campos en §7 agrupado por tipo (no idéntico al papel). Aceptado.
- Manual de usuario: diferido (pantalla WIP sin release).
- Revisión adversarial del Plan 17 no cerrada (ver arriba).
- Revocar/rotar el PAT de Supabase al cerrar (expuesto en sesiones previas).
