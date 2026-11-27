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

## F4 — Edicion
- [ ] Herramienta activa, borrador, toggle, 'x' por simbolo, limpiar/descartar, deshacer/rehacer, menu contextual, autosave, auditoria

## F5 — Inicial/Final
- [ ] Segmentado Inicial|Final, crear final (copiar/blanco), cerrar/reabrir con motivo, comparar, vinculo presupuesto

## F6 — Leyenda / PDF / a11y
- [ ] Leyenda 4 col desde catalogo, toolbar, PDF, pulido movil + accesibilidad

## Cierre
- [ ] Gates por fase + verificador final
- [ ] Aplicar migracion a prod + push: SOLO con OK explicito
