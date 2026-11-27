# Tracker 27 — Integrar CIE10 y CUPS via buscador reusable

- **Plan:** [`27_codigos-clinicos_plan.md`](../fase_de_desarrollo/27_codigos-clinicos_plan.md)
- **Herramienta en uso:** Claude

## Checklist
- [x] Revisar plan y contrato (`expediente.json`)
- [x] Pista datos / migraciones y tipos — migración `20261127100000_cie10_cups_columnas.sql` **aplicada a prod 2026-11-27** (OK usuario). Columnas `historias_clinicas.cie10_codigo` y `tratamientos_catalogo.cups_codigo` creadas + FK. Advisors: cero hallazgos nuevos. Tipos alineados a mano en services.
- [x] Implementar cambios y pruebas unitarias — buscador reusable `codigo-buscador` + `etiquetaCodigo` (spec 3 casos); cableado evoluciones (CIE10) y tratamientos (CUPS); services con embed de descripción.
- [x] Validar gates locales — `tsc --noEmit` 0 errores · `npm run build` OK · `npm test` 137/137 (32 files) · `sincronizar --check` OK (19 archivos).
- [~] Revisión adversarial — auto-revisión N0 de componente + services + migración (embed FK, error propagado, sin `[]` silencioso, sin loop en effect). `verificador` subagente NO ejecutado (riesgo de rate-limit; cambio aditivo bajo riesgo). Ofrecer al usuario.
- [x] Commit (local) — `7818090` (feat) + `de8ae57` (fix nombre tabla)
- [x] Aplicar migración a prod (OK usuario 2026-11-27)
- [ ] **OK usuario:** `git push`

## Pendientes
- Página de manual de **evoluciones** no existe (gap preexistente); crear = fuera de alcance de este plan.
- Spec del componente buscador no creado (solo función pura); contrato solo exigía la función pura.
- Hasta aplicar la migración, `getHistorias`/`getTratamientos` fallan por columna/embed inexistente (muestran error, no lista vacía). La migración es retrocompatible: aplicarla antes de desplegar el frontend no rompe el app desplegado actual.
