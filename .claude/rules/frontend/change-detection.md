---
paths:
  - "src/app/**/*.ts"
---
# Detección de cambios explícita
- Declara `changeDetection: ChangeDetectionStrategy.OnPush` explícitamente en todo `@Component` nuevo o modificado.
- Usa `signal()`, `computed()`, `input()` y `output()` en lugar de mutar propiedades planas tras peticiones `async`.
- Síntoma «200 en Network pero la UI queda en Cargando»: revisa primero si falta `OnPush` con actualización vía `signal.set()` o si una señal no cambió de referencia.
**Por qué:** los componentes `OnPush` dependen de señales o eventos del template; mutar objetos internos o olvidar `finally { loading.set(false) }` congela la vista.

