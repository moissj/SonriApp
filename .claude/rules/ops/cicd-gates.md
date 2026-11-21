---
paths:
  - ".github/**"
  - "vercel.json"
  - "package.json"
  - "tools/**"
---
# Gates locales y CI/CD
- Gates activos hoy en local (sin `.github/workflows/` configurado aún):
  - Tipos: `npx tsc --noEmit -p tsconfig.app.json` (custodia compilación estricta Angular/TS).
  - Build: `npm run build` (custodia bundle web, templates y presupuestos de tamaño).
  - Tests app: `npm test -- --watch=false` (custodia pruebas Vitest de lógica crítica).
  - Tests herramientas: `node --test tools/agentes/tests/*.test.mjs tools/plan/tests/*.test.mjs`.
  - Sincronía agentes/skills: `node tools/agentes/sincronizar.mjs --check` (custodia cero deriva entre fuentes neutras y `.claude`/`.gemini`).
- Jamás desactives o relajes un gate para «sacar rápido». Lint (ESLint) queda pendiente como plan dedicado.
**Por qué:** sin un gate automático de `--check` y compilación, las copias de agentes o contratos de servicios se desincronizan silenciosamente.

