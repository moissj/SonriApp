# Tracker 21 — Datos fiscales prestador + catálogos CIE-10/CUPS

- **Plan:** [`21_datos-fiscales-cie10-cups_plan.md`](../fase_de_desarrollo/21_datos-fiscales-cie10-cups_plan.md)
- **Contrato:** [`21_datos-fiscales-cie10-cups_expediente.json`](../fase_de_desarrollo/21_datos-fiscales-cie10-cups_expediente.json)
- **Diseño:** `docs/superpowers/specs/2026-11-24-datos-fiscales-cie10-cups-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec commiteado (`e812397`)
- [x] Contrato `expediente.json` v1 + plan + tracker
- [x] Tarea 1 (`capa-datos`): migración `20261124140000_datos_fiscales_cie10_cups.sql` escrita + revisada N0 (idempotente, aditiva en profiles, RLS fail-closed, funciones `is_super_admin`/`set_updated_at` confirmadas). `db reset` local no disponible (CLI fuera de PATH); aplicación a prod = Tarea 5 con OK
- [x] Tarea 2 (`capa-datos`): loader `tools/catalogos/cargar-catalogos.mjs` + parseo puro (+test 5/5). **Hidratación SISPRO pendiente** (requiere migración en cloud = paso prod con OK)
- [x] Tarea 3 (`cliente-web`): `Cie10Service`/`CupsService` + `Profile` 3 cols + edición prestador en perfil + validadores puros (`perfil-prestador.funcion` +spec)
- [x] Gates verde (tsc 0 / build 0 / test 43 / sincronizar OK / parser 5/5)
- [x] Revisión adversarial (`verificador`): **APROBADO**, 0 bloqueantes (RLS fail-closed, SERVICE_ROLE solo env/fuera de src, idempotencia, labels accesibilidad)
- [x] Commit local del código (migración + loader + servicios + perfil)
- [x] Manual: `docs/manual/perfil.md` creado (incluye datos del prestador)
- [x] PROD — migración aplicada a cloud (HTTP 201) + verificada (prof_cols=3, tablas=2, policies=8, indices=2) + registrada en `schema_migrations`
- [ ] PROD — **hidratación catálogos SISPRO**: bloqueada por (a) `SERVICE_ROLE_KEY` ausente, (b) SISPRO sin descarga directa → requiere scraper de postbacks ViewState (CUPS 13.640 filas) o export por email
- [ ] **Pendiente OK:** push

## Pendientes / deuda
- Registro de atención fiscal (diagnóstico+CUPS+valores por procedimiento) → **Plan 22**.
- Emisión factura DIAN + FEV-RIPS → planes posteriores (decidir proveedor vs propio).
- CIE-11 (transición Res. 1442/2024): fuera de alcance hasta que RIPS lo exija.
- Riesgo SISPRO ASP.NET: si falla descarga automatizada, N0 obtiene el archivo por vía alterna (sigue siendo Claude) y registra procedencia.
