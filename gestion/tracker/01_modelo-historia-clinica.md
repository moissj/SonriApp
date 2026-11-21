# Tracker 01 — Modelo de datos, versionado e integridad clínica

- **Plan:** [`01_modelo-historia-clinica_plan.md`](../fase_de_desarrollo/01_modelo-historia-clinica_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [ ] Obtener OK explícito del usuario sobre estrategia de plantilla versionada (Opción A/B/C), modelo de integridad (borrador/cerrada/enmiendas), alertas clínicas y tipos ID (`PA`/`PPT`/`NUIP`)
- [ ] Redactar contrato `gestion/fase_de_desarrollo/01_modelo-historia-clinica_expediente.json` (v1)
- [ ] Capturar DDL base faltante e implementar migración idempotente + RLS fail-closed (`capa-datos`)
- [ ] Verificar reversibilidad y backfill sin pérdida de datos de `historia_clinica_inicial`
- [ ] Regenerar tipos TypeScript de Supabase (o validar contrato contra servicios)
- [ ] Revisión adversarial (`verificador`) de migración, triggers de inmutabilidad y aislamiento RLS
- [ ] Commit
