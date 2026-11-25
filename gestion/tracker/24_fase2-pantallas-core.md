# Tracker 24 — Fase 2 — Pantallas core (Inicio/Agenda/Pacientes)

- **Plan:** [`24_fase2-pantallas-core_plan.md`](../fase_de_desarrollo/24_fase2-pantallas-core_plan.md)
- **Contrato:** [`24_fase2-pantallas-core_expediente.json`](../fase_de_desarrollo/24_fase2-pantallas-core_expediente.json)
- **Brief:** `docs/producto/rediseno-sonriapp-brief.md` (sec. 4.1-4.6)
- **Herramienta en uso:** Claude

## Wave B — Inicio (4.1) — commit `358f288` ✅
- [x] KpiCard nuevo (`shared/components/kpi-card/`)
- [x] Inicio: 5 KpiCards reales + héroe "Siguiente paciente" + timeline hoy + doughnut "Citas por estado" (reemplaza tarjeta Reportes)
- [x] Fix TZ Bogotá en `dashboard.service.ts` (ventana "hoy" + inicio de mes)
- [x] Manual `docs/manual/inicio.md`
- [x] Gates verde (tsc 0 / 60 tests / build / sincronizar) + verificador APROBADO
- Obs no-bloqueantes: default tono KpiCard 'neutral' (instancias pasan explícito); signal `proximas7` quedó sin uso (limpiar); `en_atencion` fuera de tasa/doughnut (limitación fuente ReporteService).

## Wave C — Agenda + modal (4.2/4.3) — pendiente
## Wave D — Pacientes + Detalle (4.5/4.6) — pendiente

## Diferido (ver contrato)
- Gráficos ingresos 6m / top5 tratamientos; KPIs ocupación/ticket/inactivos>6m/delta mes-anterior; sparklines+deltas (requieren agregado nuevo -> capa-datos).
- Alertas médicas en héroe/detalle -> Fase 3.
- Drag&drop agenda -> wave C si alcanza.

## Push
- [ ] Fase 1 + fix topbar + Fase 2 -> **pendiente OK del usuario**.
