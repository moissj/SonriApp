# Plan 23 — Fase 1: Sistema de diseño + AppShell

- **Tracker:** [`gestion/tracker/23_fase1-sistema-diseno-shell.md`](../tracker/23_fase1-sistema-diseno-shell.md)
- **Contrato:** [`23_fase1-sistema-diseno-shell_expediente.json`](23_fase1-sistema-diseno-shell_expediente.json)
- **Brief:** `docs/producto/rediseno-sonriapp-brief.md` (secciones 2, 3, 7)

## Hallazgo clave
El shell **ya existe** (`app.html` + `layout/sidenav|header|bottom-nav` + `LayoutService`). Fase 1 = **refactor**, no rebuild. Token `primary` se usa en 1 línea; el grueso de color es `sky-*` (242 líneas) → su barrido a `primary-*` se **difiere**.

## Olas
- **Ola 1 (paralela, archivos disjuntos):** T1 tokens · T2 estado-cita (fuente única) · T3 Button→tokens + FormFooter + footer piloto.
- **Ola 2 (tras Ola 1, usa tokens+Lucide):** T4 sidenav agrupado · T5 header breadcrumb/acciones/avatar + bottom-nav Lucide + PageHeader + contenedor.

## Diferido (ver contrato)
Barrido `sky→primary`, KpiCard/DataTable/Drawer/Toast/SegmentedControl/Avatar (JIT Fase 2), GlobalSearch Ctrl+K (Fase 2), adopción global de PageHeader (Fase 2), dark mode (Fase 4).

## Cierre
Gate verde por ola → `verificador` al final → commit por ola → push con OK. Revisar 1920/1366/390.
