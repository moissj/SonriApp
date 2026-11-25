# Tracker 21 — Datos fiscales prestador + catálogos CIE-10/CUPS

- **Plan:** [`21_datos-fiscales-cie10-cups_plan.md`](../fase_de_desarrollo/21_datos-fiscales-cie10-cups_plan.md)
- **Contrato:** [`21_datos-fiscales-cie10-cups_expediente.json`](../fase_de_desarrollo/21_datos-fiscales-cie10-cups_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-datos-fiscales-cie10-cups-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec commiteado (`e812397`)
- [x] Contrato `expediente.json` v1 + plan + tracker
- [ ] Tarea 1 (`capa-datos`): migración `profiles` cols + `catalogo_cie10`/`catalogo_cups` + RLS fail-closed + pg_trgm + índices + triggers; aplicada local
- [ ] Tarea 2 (`capa-datos` + N0): loader + parseo (+test); hidratación desde SISPRO (CUPS Res. 2706/2025, CIE-10) con `version` y conteo validado
- [ ] Tarea 3 (`cliente-web`): `Cie10Service`/`CupsService` + `Profile` 3 cols + edición prestador en perfil
- [ ] Gates verde (`tsc` / `build` / `test` / `sincronizar --check` / `node --test tools/catalogos`)
- [ ] Revisión adversarial (`verificador`): RLS global, SERVICE_ROLE fuera de src, idempotencia
- [ ] Manual: actualizar página de perfil (nuevos campos del prestador)
- [ ] Aplicar migración a **prod (OK explícito)** + commit local. **Pendiente OK:** push

## Pendientes / deuda
- Registro de atención fiscal (diagnóstico+CUPS+valores por procedimiento) → **Plan 22**.
- Emisión factura DIAN + FEV-RIPS → planes posteriores (decidir proveedor vs propio).
- CIE-11 (transición Res. 1442/2024): fuera de alcance hasta que RIPS lo exija.
- Riesgo SISPRO ASP.NET: si falla descarga automatizada, N0 obtiene el archivo por vía alterna (sigue siendo Claude) y registra procedencia.
