# Tracker 22 — Fase 0 — Correcciones criticas UI

- **Plan:** [`22_fase0-correcciones-criticas_plan.md`](../fase_de_desarrollo/22_fase0-correcciones-criticas_plan.md)
- **Contrato:** [`22_fase0-correcciones-criticas_expediente.json`](../fase_de_desarrollo/22_fase0-correcciones-criticas_expediente.json)
- **Brief maestro:** `docs/producto/rediseno-sonriapp-brief.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Contrato `expediente.json` + plan + tracker
- [x] Lucide instalado (`lucide-angular ^1.0.0`)
- [ ] T1 — Utilidad `fecha-bogota.funcion.ts` (+spec) + aplicar en citas/inicio (bug "hoy")
- [ ] T2 — Cita modal: conflicto solo con paciente+fecha+hora
- [ ] T3 — Antecedentes sin preseleccion + Si/No/No sabe + quitar "Todos Si"
- [ ] T4 — Chip alergia neutro cuando no hay alergia real
- [ ] T5 — Emojis -> iconos Lucide + tildes/capitalizacion
- [ ] Gates verde (tsc / build / test / sincronizar)
- [ ] Revisión adversarial (`verificador`)
- [ ] Commit local + push (OK)

## Pendientes / deuda (a fases posteriores)
- "Ver horarios libres" en modal de cita -> Fase 2 (4.3).
- Alerta medica desde antecedente "Si" + observacion obligatoria -> Fase 3 (4.7).
