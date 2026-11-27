# Tracker 26 — Odontograma overhaul

- **Plan:** [`26_odontograma-overhaul_plan.md`](../fase_de_desarrollo/26_odontograma-overhaul_plan.md)
- **Contrato:** [`26_odontograma-overhaul_expediente.json`](../fase_de_desarrollo/26_odontograma-overhaul_expediente.json)
- **Herramienta en uso:** Claude
- **Regla clave:** `clinica/odontograma.md` (plan dedicado, aditivo, tests de mapeo; FDI/cuadrantes/3 zonas/temporal/piezaAusente intactos).
- **Decisiones:** endodoncia ovalito rojo(por realizar)/verde(realizada) · ausente X+'A' · obturado→resina · de corrido.

## F1 — Catalogo + tokens
- [ ] `CatalogoHallazgos` TS (fuente unica) + tokens `odo-*` (tailwind.config.js + odontograma.css) + spec

## F2 — Datos (migracion + service) ✓ (local; sin aplicar a prod)
- [x] Ampliar `estado_diente_enum` (+obt_desadaptada, resina, amalgama) y `marca_diente_enum` (+11) — mig `20261126100000_..._enums.sql`
- [x] `tipo`/meta/cierre: columna tipo + unique con tipo + tabla `odontograma_meta` + RLS (is_cuenta_activa en odontogramas) — mig `20261126100100_odontograma_overhaul.sql`
- [x] Mapeo datos existentes (obturado→resina; sano/corona/endodoncia→marca; ausente+'A') con respaldo `odontogramas_overhaul_backup`
- [x] `odontograma.service.ts` aditivo (tipos, tipo en queries, getMeta/cerrar/reabrir) + `meta-odontograma.funcion.ts`+spec
- [x] Verificado: nombres de unique en prod coinciden (los `drop` corren). tsc 0, 102 tests verdes. Pend: aplicar a prod con OK.

## F3 — Recuadro + fills + figura endodoncia
- [ ] Fills 4 (recolor + trama desadaptada), ovalito endodoncia rojo/verde, recuadro marcas nuevas desde catalogo, compatibilidad + tests

## F4 — Edicion ✓ (local)
- [x] F4a: tabla `odontograma_auditoria` append-only (sin UPDATE/DELETE policy) + `registrarCambio` fallo suave — mig `20261126110000`
- [x] F4b: herramienta activa + goma, toggle, 'x' por simbolo, limpiar/descartar, deshacer/rehacer (>=50, Ctrl+Z/Shift+Z/Y), menu contextual propio, autosave + indicador (aria-live), toast "Hallazgo eliminado · Deshacer", Esc deselecciona
- [x] Pila pura `editor-odontograma.ts` + spec; controlador `edicion-odontograma.ts`; `odontograma.ts` 155 lineas
- [x] Gates: tsc 0, build OK, 124 tests. Fix N0: `isSelected` passthrough (template colgado). Deuda: modal de notas por superficie retirado; `odontograma.css` +162B sobre budget (F6).

## F5 — Inicial/Final ✓ (local)
- [x] Segmentado Inicial|Final, crear final (copiar/blanco), cerrar/reabrir con motivo, comparar (dientes con cambios + indice COP/ceo)
- [x] Solo-lectura al cerrar (cliente) + sub-componentes en `ciclo/`, `crearFinal` en service, funciones puras (indice-cop, comparar, estado-meta) + specs. tsc/build 0, 134 tests.
- [x] **F5b (capa-datos):** trigger `odontograma_no_cerrado` BEFORE INS/UPD/DEL en ambas tablas (SECURITY DEFINER, search_path fijo, P0001) — mig `20261126120000`
- [~] Vinculo presupuesto DIFERIDO (boton "proximamente"); COP/ceo criterio clinico A CONFIRMAR; service 305 lineas (deuda codigo-limpio)

## F6 — Leyenda / PDF / a11y ✓ (local)
- [x] Leyenda 4-col desde catalogo (`leyenda-odontograma.component.ts`), impresion/PDF (window.print + @media print, reusa `.zona-imprimir`), pulido movil (wrap toolbar/segmentado, scroll SVG), a11y AA (tokens odo-* oscurecidos para texto/glifo, role=alert/menu, foco visible, Space)
- [x] Budget CSS: odontograma.css <4KB (dedupe) + `angular.json` anyComponentStyle 4→6KB (examen-ingreso preexistente). Build 0 warnings. odontograma.ts 190 lineas.
- [~] Diferido: recuadro-insignia+panel en movil; imprimir ambos (inicial+final) a la vez. Nota: fills tailwind vs tokens-texto divergen (AA).

## Cierre
- [x] Gates por fase + verificador final
- [x] Aplicadas a prod 2026-11-26 (MCP apply_migration) en orden: enums -> overhaul -> auditoria -> bloqueo_cerrado. Respaldo previo `odontogramas_bak_20261126` (40) + `odontograma_marcas_bak_20261126` (12). Verificado: resina 23, caries 9, implante 1, sano/corona/endodoncia/ausente/obturado 0; `overhaul_backup` 30; meta+auditoria con RLS; 2 triggers presentes. Fix post-apply: RLS fail-closed en las 2 tablas `_bak_` (advisor ERROR `rls_disabled_in_public`).
- [ ] Push a origin/main: PENDIENTE OK explicito del usuario
- [ ] Limpieza post-verif: `drop table odontogramas_bak_20261126, odontograma_marcas_bak_20261126` cuando el usuario confirme
- [ ] Usuario: rotar token Supabase expuesto en chat
