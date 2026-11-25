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

## Wave C — Agenda + modal (4.2/4.3)
### C1 — Modal Nueva cita (4.3) + SegmentedControl JIT ✅
- [x] SegmentedControl nuevo (`shared/components/segmented-control/`, táctil min-h-10)
- [x] Modal: reorden Paciente→Tratamiento→Fecha/hora→Duración(chips)→Notas; Estado/Canal en "Opciones avanzadas"; botón loading + "qué falta"
- [x] `citas.ts` lee `?nueva=1` (ActivatedRoute) → abre modal
- [x] Helpers puros `cita-modal.funcion.ts` (+spec 5 tests); `cita-modal.ts` 195 líneas (<200)
- [x] Gates (tsc 0 / 65 tests / build / sincronizar) + verificador APROBADO
- Diferido C1: "Ver horarios libres" (→ C2); toggle recordatorio (Cita sin campo = modelo); spec de `mensajeSolape`/`valoresFormulario`; TZ Bogotá en texto de solape.
### C2 — Agenda (4.2) + Drawer JIT ✅
- [x] SegmentedControl vistas Día/Semana/Mes/Lista; colores por `ESTADO_CITA` (clases estáticas); línea hora actual (Bogotá, interval limpio); bloques proporcionales; Drawer + cita-detalle (reusa updateCitaEstado/openCitaForm/requestCancel)
- [x] Helpers puros `agenda.funcion.ts`/`calendario.funcion.ts` (+specs); citas.ts 405→260, citas.html 447→258
- [x] Barra agenda compactada a una fila (pedido usuario); `citasDelDia` ref estable
- [x] Gates (tsc 0 / 76 tests / build) + verificador APROBADO
- Diferido: drag&drop reprogramar; panel lateral (mini-calendario/filtros); "Ver horarios libres"; Drawer focus-trap/return-focus; quitar `effect`+markForCheck redundante; citas.ts/.html >200 (deuda muy reducida); manual Agenda.

## Wave D — Pacientes + Detalle (4.5/4.6) ✅
- [x] Avatar nuevo (`shared/components/avatar/` + `iniciales()` pura, elimina getInitials duplicado)
- [x] Fix "Última cita" (última cita pasada, sin cambio de contrato); rótulo unificado tabla/móvil
- [x] Lista: page-header, Avatar, mini-KPIs (Total/Nuevos mes/Inactivos), filtro Todos/Activos/Inactivos; p-table conservado
- [x] Detalle: cabecera compacta, banda alertas real (alergias+antecedentes), tab Citas con `ESTADO_CITA`, `calcularEdad` Bogotá
- [x] `segmentos.funcion.ts` + `edad.funcion.ts` (+specs); manuales pacientes/detalle
- [x] Gates (tsc 0 / 87 tests / build / sincronizar) + verificador APROBADO
- Diferido: DataTable genérico; estado de error de lista + `select('*')` (consultas-eficientes, preexistente); contadores Presupuestos/Pagos/Consentimientos; alertas clínicas historia (Fase 3); getAge en formulario/historia; partir pacientes.html(227)/detalle.html(345).

## Fase 2 COMPLETA ✅ — Waves B (Inicio) · C1 (modal) · C2 (agenda) · D (pacientes/detalle). Falta solo pulido/deuda arriba.

## Diferido (ver contrato)
- Gráficos ingresos 6m / top5 tratamientos; KPIs ocupación/ticket/inactivos>6m/delta mes-anterior; sparklines+deltas (requieren agregado nuevo -> capa-datos).
- Alertas médicas en héroe/detalle -> Fase 3.
- Drag&drop agenda -> wave C si alcanza.

## Push
- [ ] Fase 1 + fix topbar + Fase 2 -> **pendiente OK del usuario**.
