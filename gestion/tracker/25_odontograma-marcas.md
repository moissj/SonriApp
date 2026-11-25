# Tracker 25 — Odontograma: cajita de marcas por diente + navegacion HC

- **Plan:** [`25_odontograma-marcas_plan.md`](../fase_de_desarrollo/25_odontograma-marcas_plan.md)
- **Contrato:** [`25_odontograma-marcas_expediente.json`](../fase_de_desarrollo/25_odontograma-marcas_expediente.json)
- **Herramienta en uso:** Claude
- **Regla clave:** `clinica/odontograma.md` — plan dedicado, aditivo, tests de mapeo, NO tocar superficies/geometria/enum existente.
- **Decisiones usuario:** nucleo=azul · incluido_semi=una marca · corona_acero=una marca.

## Wave 1 — Datos (migracion + service) ✅
- [x] Migracion `20261125100000_odontograma_marcas.sql`: `marca_diente_enum` (5) + tabla `odontograma_marcas` + RLS fail-closed + indice (idempotente)
- [x] `odontograma.service.ts` aditivo: tipos + `getMarcas` + `setMarca` (fecha Bogota) + mapeo puro `core/funciones/marcas-odontograma.funcion.ts` (+spec)
- [x] tsc 0 / 95 tests. Supabase CLI no en PATH: RLS no probada vs BD viva (va con apply a prod)
- [ ] NO aplicar a prod (requiere OK explicito)

## Wave 2 — Odontograma UI ✅
- [x] Cajita `<g.tooth-box translate(0,32)>` por diente; SOLO viewHeight +22 (geometria/superficies/FDI/piezaAusente intactas)
- [x] `funciones/catalogo-marcas.ts` (5 marcas) + `letrasDeMarcas`; render letras de color; computed `letrasPorPieza`
- [x] Modal `#modalMarcas` toggle optimista (setMarca, revierte si falla) + leyenda + spec

## Wave 3 — Navegacion HC ✅
- [x] `id` por 5 secciones + indice sticky con salto + seccion activa (IntersectionObserver, cleanup DestroyRef) + scroll-mt-36

## Gates + cierre
- [x] tsc 0 / 100 tests / build / sincronizar + verificador APROBADO-CON-OBSERVACIONES
- [x] Fix defensivo `getMarcas` `.eq(odontologo_id)` (consistencia getOdontograma)
- [x] Commit local
- [x] Migracion aplicada a BD viva por el usuario (SQL Editor, 2026-11-25); odontograma carga y marcas guardan
- [ ] `git push`: SOLO con OK explicito del usuario

## Observaciones no bloqueantes (verificador)
- `odontograma.ts` 338 líneas (>200, preexistente agravado): extraer catalogo/estado a `funciones/` en plan de refactor.
- RLS `odontograma_marcas` NO probada vs BD viva (supabase CLI no en PATH): verificar aislamiento cross-consultorio al aplicar a prod.
- Policy UPDATE inocua (modelo es insert/delete); `updated_at` nunca escrito desde cliente (consistente).
- Manual: odontograma sin página de manual (pendiente, regla manual-usuario).
