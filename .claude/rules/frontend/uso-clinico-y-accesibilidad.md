---
paths:
  - "src/app/**/*.html"
  - "src/app/**/*.scss"
  - "src/app/**/*.css"
---
# Uso clínico en consultorio y accesibilidad
- Diseña formularios para uso rápido con una mano, tablet y móvil: progreso visible por secciones y acciones primarias accesibles sin scroll excesivo.
- **Densidad compacta (decisión de producto):** la UI usa controles pequeños; el mínimo táctil 40×40 queda relajado. Apunta a ~28–32 px de alto en botones/selectores/filas; conserva algo de holgura solo donde el flujo clínico con guante/tablet lo exija. No es excusa para quitar foco visible, etiquetas ni contraste.
- Mantén orden lógico de tabulación por teclado, foco visible y `<label for="...">` o `aria-label` asociado a cada control.
- Asegura contraste legible en ambiente iluminado de consultorio y pide confirmación explícita antes de descartar cambios o eliminar registros.
**Por qué:** en consulta con tablet los botones pequeños y la falta de etiquetas asociadas causan errores de registro o pérdida de datos al navegar.

