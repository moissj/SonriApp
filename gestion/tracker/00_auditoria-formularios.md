# Tracker 00 — Auditoría de formularios vs papel y estado RLS

- **Plan:** [`00_auditoria-formularios_plan.md`](../fase_de_desarrollo/00_auditoria-formularios_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [ ] Relevar formularios actuales de paciente e historia clínica (`relevador`)
- [ ] Inventariar esquema actual de BD y RLS en Supabase (confirmando proyecto SonriApp)
- [ ] Completar `docs/clinica/matriz-brechas.md` campo por campo vs las 4 fotos en papel
- [ ] Inventariar columnas con datos sensibles de salud y hallazgos RLS (`historia_clinica_inicial`, `catalogo_eps`)
- [ ] Resolver dudas clínicas marcadas (`DIAGNOSTICADA A` en apnea, `remite.parentesco`, `PA`/`PP`) con OK del usuario
- [ ] Verificación (`verificador`) y aprobación explícita de la matriz antes de iniciar Plan 01
- [ ] Commit
