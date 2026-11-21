---
paths:
  - "src/app/**/*.html"
  - "src/app/**/*.scss"
  - "src/app/**/*.css"
  - "tailwind.config.js"
---
# Tailwind CSS y sistema de diseño
- Centraliza tokens de color, tipografía y sombras en `tailwind.config.js` y variables CSS de diseño; no inventes paletas ad hoc.
- PrimeNG (`Aura` claro fijo en `app.config.ts`) corre en la capa CSS `primeng` para no colisionar con utilidades Tailwind.
- Extrae componentes reutilizables en `shared/components/` cuando una estructura visual se repita en 2+ pantallas en vez de duplicar cadenas largas de clases.
- Evita estilos en línea (`style="..."`) y `!important`, salvo casos de cálculo dinámico documentados (p. ej. SVG/geometría).
**Por qué:** `examen-ingreso` y `historias-clinicas` usan CSS plano propio en paralelo a Tailwind y PrimeNG, fragmentando estilos y tamaños táctiles.

