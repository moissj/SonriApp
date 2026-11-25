# Tracker 23 — Fase 1 — Sistema de diseno + AppShell

- **Plan:** [`23_fase1-sistema-diseno-shell_plan.md`](../fase_de_desarrollo/23_fase1-sistema-diseno-shell_plan.md)
- **Contrato:** [`23_fase1-sistema-diseno-shell_expediente.json`](../fase_de_desarrollo/23_fase1-sistema-diseno-shell_expediente.json)
- **Brief:** `docs/producto/rediseno-sonriapp-brief.md` (sec. 2, 3, 7)
- **Herramienta en uso:** Claude

## Ola 1 (paralela) — commit `f9d5afb`
- [x] T1 — Tokens `tailwind.config.js` (primary azul #0284C7, accent teal, semanticos, `cita-atencion` violeta, `darkMode:'class'`, `secondary` eliminado 0 usos)
- [x] T2 — Fuente unica `ESTADO_CITA` + `tonoAClasesBadge` + `en_atencion` al union; StatusBadge la consume (+spec, 2 tests)
- [x] T3 — Button a tokens/compacto + signals (+variante danger) + FormFooter nuevo + footer piloto (pacientes/formulario)
- [x] Gates Ola 1 (tsc 0 / 57 tests / build ok / sincronizar)

## Ola 2
- [x] T4 — Sidenav agrupado (Operacion/Clinica/Gestion) + Lucide + pie (email profesional + version `v2.0` placeholder); "Mi perfil" al menu avatar
- [x] T5 — Header breadcrumb + "Nueva cita" + campana + menu avatar; bottom-nav Lucide; PageHeader nuevo (piloto inicio/pacientes); rutas con data.title
- [x] Fix doble-padding: contenedor revertido a neutral (contenedor unico max-w-7xl -> Fase 2, al soltar wrappers propios)

## Cierre
- [x] Gates verde (tsc 0 / 57 tests / build ok / sincronizar)
- [x] Revision adversarial (`verificador`): APROBADO con observaciones; defecto de doble-padding corregido
- [ ] **Pendiente OK:** push

## Diferido (fases posteriores)
- Barrido masivo `sky-*` -> `primary-*` (242 lineas).
- KpiCard/DataTable/Drawer/Toast/SegmentedControl/Avatar -> JIT Fase 2.
- GlobalSearch Ctrl+K + apertura global modal Nueva cita -> Fase 2.
- Adopcion de PageHeader en todas las pantallas -> Fase 2.
- Dark mode (vars listas) -> Fase 4.
- Migrar duplicaciones estado-cita en features -> Fase 2.
- Contenedor unico max-w-7xl + padding en `app.html` (hoy neutral) -> Fase 2, cuando cada pantalla suelte su wrapper propio al adoptar PageHeader; incluye recuperar full-bleed/sticky de Agenda.
- Registrar en Lucide `pick` los iconos de `ESTADO_CITA` (clock/calendar-check/activity/check-circle/x-circle/user-x) cuando se rendericen -> Fase 2.
- Fuente real del nombre de consultorio (hoy email) + version real (hoy `v2.0`) en pie del sidenav.
- Target tactil >=40px en boton `md` (hoy ~32px por densidad desktop) -> revisar en pase movil Fase 4.
