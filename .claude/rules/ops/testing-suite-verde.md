---
paths:
  - "src/**"
  - "tools/**"
  - "supabase/**"
---
# Suite completa siempre en verde
- No existen fallos «conocidos» ni tests saltados con `skip` o aserciones relajadas para pasar un check.
- Si aparece un fallo rojo ajeno a tu cambio, clasifícalo con evidencia real (`archivo:línea` y salida) y resuélvelo o escálalo al dueño del plan antes de continuar.
- Ejecuta la suite completa (`npm test -- --watch=false`, `npx tsc --noEmit -p tsconfig.app.json`, `npm run build` y `node --test tools/**/tests/*.test.mjs`) antes de commitear código funcional.
**Por qué:** trabajar sobre un build roto (como la referencia faltante `epsService.seedComunes()` en `configuracion-eps.ts:103`) oculta regresiones nuevas.

