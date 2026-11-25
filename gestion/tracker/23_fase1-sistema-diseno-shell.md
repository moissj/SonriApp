# Tracker 23 — Fase 1 — Sistema de diseno + AppShell

- **Plan:** [`23_fase1-sistema-diseno-shell_plan.md`](../fase_de_desarrollo/23_fase1-sistema-diseno-shell_plan.md)
- **Contrato:** [`23_fase1-sistema-diseno-shell_expediente.json`](../fase_de_desarrollo/23_fase1-sistema-diseno-shell_expediente.json)
- **Brief:** `docs/producto/rediseno-sonriapp-brief.md` (sec. 2, 3, 7)
- **Herramienta en uso:** Claude

## Ola 1 (paralela)
- [ ] T1 — Tokens en `tailwind.config.js` (primary azul, accent, semanticos, radios, vars dark)
- [ ] T2 — Fuente unica estado-cita + StatusBadge la consume (+spec)
- [ ] T3 — Button a tokens/compacto + FormFooter nuevo + footer piloto (pacientes/formulario)

## Ola 2
- [ ] T4 — Sidenav agrupado + Lucide + pie (consultorio+version)
- [ ] T5 — Header breadcrumb/acciones/avatar + bottom-nav Lucide + PageHeader + contenedor max-w-7xl

## Cierre
- [ ] Gates verde (tsc / build / test / sincronizar)
- [ ] Revision adversarial (`verificador`)
- [ ] Commit por ola + push (OK)

## Diferido (fases posteriores)
- Barrido masivo `sky-*` -> `primary-*` (242 lineas).
- KpiCard/DataTable/Drawer/Toast/SegmentedControl/Avatar -> JIT Fase 2.
- GlobalSearch Ctrl+K + apertura global modal Nueva cita -> Fase 2.
- Adopcion de PageHeader en todas las pantallas -> Fase 2.
- Dark mode (vars listas) -> Fase 4.
- Migrar duplicaciones estado-cita en features -> Fase 2.
