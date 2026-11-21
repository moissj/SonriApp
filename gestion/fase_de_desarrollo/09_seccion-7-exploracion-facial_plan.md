# Plan 09 — Sección 7 Exploración facial y modelos

- **ID:** `09_seccion-7-exploracion-facial`
- **Estado:** Pendiente de ejecución (depende de Planes 01 y 02)
- **Tracker:** [`gestion/tracker/09_seccion-7-exploracion-facial.md`](../tracker/09_seccion-7-exploracion-facial.md)

## Objetivo
Construir desde cero la Sección 7 («Exploración facial», anomalías de posición, planos terminales, tipo de dentición y descripción de modelos) fiel a la página 2 del formato en papel verificado contra las fotos.

## Enfoque
- Sub-bloques con controles tipados y tri-estado:
  1. Biotipología facial: `perfil` (`recto | concavo | convexo`), `asimetria_facial` (S/N/null + detalle), `forma_cara` (`redonda | ovalada | cuadrada`), `patron_crecimiento` (`normo | dolico | braqui`), `nariz` (`recta | desviacion`), **`posicion_labial`**.
  2. Vía aérea y sueño: `respirador_oral`, `ronca`, `apnea_sueno`, `apnea_diagnosticada` (confirmar valor `A` en matriz), `uso_cpap`, `aparat_sueno_removible_no_cpap`, `menton` (`normal | hipotonico | hipertonico`), `ojeras`.
  3. Alteraciones de mordida (cada una con `S/N/null` + ubicación multi-selección `anterior | posterior | izquierda | derecha` + detalle): `mordida_abierta`, **`mordida_cruzada`**, **`mordida_profunda`**.
  4. `anomalias_posicion`: `rotaciones`, `diastemas`, `translocaciones`, `giroversiones`, `ausencias`, `retenidos`, `apinamientos` + **`descripcion` general al cierre**.
  5. `planos_terminales` (`escalon_recto | escalon_mesial | escalon_distal`), `tipo_denticion` (`temporal | mixta | permanente`), `descripcion_modelos`.

## Archivos a crear / modificar
- `src/app/features/historias-clinicas/components/seccion-exploracion-facial/` (+ `.spec.ts`)
- `src/app/features/historias-clinicas/funciones/exploracion-facial.funcion.ts` (+ `.spec.ts`)

## Cambios de BD / SQL / RLS
- Contrato `exploracion_facial` v1 definido en Plan 01.

## Casos de prueba
- Selección múltiple de cuadrantes en mordidas; valores por defecto `null`; serialización fiel a contrato v1.
