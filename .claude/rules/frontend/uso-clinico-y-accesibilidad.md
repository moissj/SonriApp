---
paths:
  - "src/app/**/*.html"
  - "src/app/**/*.scss"
  - "src/app/**/*.css"
---
# Uso clínico en consultorio y accesibilidad
- Diseña formularios para uso rápido con una mano, tablet y móvil: progreso visible por secciones y acciones primarias accesibles sin scroll excesivo.
- Garantiza objetivos táctiles de **al menos 40×40 px** (`min-h-10 min-w-10`) en botones clínicos (S/N, N/A, D/I, escalas) y selectores.
- Mantén orden lógico de tabulación por teclado, foco visible y `<label for="...">` o `aria-label` asociado a cada control.
- Asegura contraste legible en ambiente iluminado de consultorio y pide confirmación explícita antes de descartar cambios o eliminar registros.
**Por qué:** en consulta con tablet los botones pequeños y la falta de etiquetas asociadas causan errores de registro o pérdida de datos al navegar.

