# Análisis competitivo — Dentalink vs SonriApp

> **Fecha:** 2026-11-24 · **Fuente Dentalink:** páginas públicas `softwaredentalink.com/co` (home, agenda, odontograma/periodontograma, confirmaciones, planes, convenios). **Fuente SonriApp:** relevamiento de historia clínica (Plan 00) + código.
> **Alcance:** comparación de funcionalidades para priorizar mejoras. No es un plan de implementación; cada ítem priorizado se convierte en su propio plan con `tools/plan/nuevo-plan.mjs`.

## Contexto

- **SonriApp:** Angular + Supabase, PWA/Capacitor. Consultorio único aislado por `odontologo_id`; roles `odontologo` y `super_admin`. Fuerte en historia clínica odontológica y catálogo EPS colombiano.
- **Dentalink:** suite SaaS madura multi-sede (planes Esencial/Pro/Titanium), 100% nube AWS, add-ons de IA.

> Limitación: el inventario de SonriApp proviene del relevamiento **solo de historia clínica**. Los módulos marcados «verificar» no se confirmaron en código.

## Matriz de brechas funcionales

| # | Función en Dentalink | SonriApp | Prioridad | Notas de implementación |
|---|---|---|---|---|
| 1 | Cumplimiento CO: **RIPS/FEV-RIPS** (Res. 948), **factura electrónica DIAN**, HC interoperable (Res. 1888) | ausente | **Alta** | Regulatorio. Debe reflejarse en el modelo de datos (Plan 01) y en facturación. |
| 2 | **Recordatorios/confirmación de cita** por WhatsApp/email, reglas por sede/profesional | verificar | **Alta** | Edge Function + proveedor WhatsApp/email. ROI directo (menos inasistencias). |
| 3 | **Consentimientos informados + firma electrónica** | ausente | **Alta** | Legal. Plantillas + captura de firma + almacenamiento con RLS. |
| 4 | **Periodontograma** + odontogramas de **reevaluación versionados** (comparar en el tiempo) | odontograma SVG sin versiones ni periodontograma | Media-Alta | Extiende `odontograma.service`. Respetar protección SVG (`clinica/odontograma.md`). |
| 5 | **Plan de tratamiento ligado al odontograma** (diente→ítem) + estados/seguimiento | presupuestos sin vínculo a dientes ni flujo de aprobación | Media | Relación `presupuesto_items`↔pieza dental + estados. |
| 6 | **Carga de imágenes/documentos** por paciente (RX, fotos) | verificar (probable ausente) | Media | Supabase Storage con RLS por `odontologo_id`/`paciente_id`. |
| 7 | **Agenda** con estados (confirmada/sala/en atención) por sillón y profesional | verificar | Media | Base para recordatorios (#2). |
| 8 | **Caja / cierre diario**, pagos en cuotas | `pagos` existe; sin arqueo | Media | Cierre de caja + conciliación. |
| 9 | **Roles finos** (recepción/auxiliar) además de odontólogo/admin | solo 2 roles | Media | Ampliar `rol_usuario_enum` + RLS. |
| 10 | **Reportes/indicadores** (producción, morosidad, inasistencia) | verificar (mínimo) | Media | Vistas/RPC agregadas en Postgres. |
| 11 | **Convenios** empresa/aseguradora con descuentos | modelo EPS (distinto) | Baja-Media | Complementa EPS; no urgente. |
| 12 | Liquidación de honorarios / comisiones | ausente | Baja | Útil con varios profesionales. |
| 13 | Inventario / gastos / laboratorios | ausente | Baja | Según crezca. |

## No adoptar (aún) — sobredimensionado para consultorio único

Contact Center IA, dictado por voz con IA, RX con IA, simulador de sonrisa, videoconsulta, financiamiento a cuotas propio, multi-sede. Revisitar si el producto escala a cadenas.

## Diferencia crítica de seguridad

Dentalink promociona ISO 27001 / HIPAA / GDPR y respaldos diarios. SonriApp (verificado contra el esquema vivo, 2026-11-24) **sí tiene RLS activa en las 15 tablas** con policies fail-closed por `odontologo_id = auth.uid()` + `is_cuenta_activa()`. La brecha real es de **reproducibilidad**: varias tablas base (`pacientes`, `historias_clinicas`, `citas`, `profiles`) existen en producción **sin `CREATE TABLE` en el repo** (drift repo↔prod) → cerrar en **Plan 13** antes de presumir trazabilidad/respaldos.

## Orden sugerido

1. **Plan 01/13** — cerrar modelo + RLS de historia clínica (base de todo, y la brecha de seguridad real).
2. **#1 Cumplimiento CO** (RIPS/FEV-RIPS, DIAN) — diferenciador y obligación legal.
3. **#2 Recordatorios** — mayor ROI operativo.
4. **#3 Consentimientos/firma**, luego **#4 periodontograma/versionado** y **#5 plan↔odontograma**.
