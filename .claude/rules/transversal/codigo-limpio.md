---
paths:
  - "src/**/*.ts"
  - "supabase/functions/**/*.ts"
  - "tools/**/*.mjs"
---
# Código limpio y modular
- Limita cada archivo a **máximo 200 líneas** y cada función a ≤ 30 líneas con una responsabilidad y early returns.
- Separa lógica pura (`*.funcion.ts`) de I/O: componentes Angular y services son orquestadores delgados.
- Nombra conceptos del dominio clínico/negocio en español y los técnicos en inglés; comenta solo el *por qué*.
- Mantén TypeScript `strict` sin `any` injustificado; prohíbe código muerto, `console.log` de depuración o `TODO` sin dueño.
- Todo archivo con lógica de negocio o transformación pura lleva su archivo `.spec.ts` o `.test.mjs` al lado.
**Por qué:** formularios monolíticos como `formulario.ts` (401 líneas) y `examen-ingreso.ts` (275 líneas) mezclan estado, mapeo y validación dificultando probarlos.

