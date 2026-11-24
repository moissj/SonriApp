# Tracker 00 — Auditoría de formularios vs papel y estado RLS

- **Plan:** [`00_auditoria-formularios_plan.md`](../fase_de_desarrollo/00_auditoria-formularios_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [x] Relevar formularios actuales de paciente e historia clínica (`relevador`)
- [~] Inventariar esquema actual de BD y RLS en Supabase (confirmando proyecto SonriApp) — hecho desde `supabase/migrations/**`; verificación del esquema **vivo** BLOQUEADA (MCP Supabase caído, `CONNECT_TIMEOUT`) → decisión **D7**
- [x] Completar `docs/clinica/matriz-brechas.md` campo por campo vs las 4 fotos en papel
- [x] Inventariar columnas con datos sensibles de salud y hallazgos RLS (`historia_clinica_inicial`, `catalogo_eps`)
- [ ] Resolver dudas clínicas marcadas (`DIAGNOSTICADA A` en apnea, `remite.parentesco`, `PA`/`PP`) con OK del usuario → ver decisiones **D1–D7** en matriz §5
- [~] Verificación (`verificador`) y aprobación explícita de la matriz antes de iniciar Plan 01 — `verificador` OK (§4 RLS 100% confirmado; 2 errores de matriz corregidos: tejidos 16 ítems, `remite` sin teléfono); falta OK del usuario
- [ ] Commit
