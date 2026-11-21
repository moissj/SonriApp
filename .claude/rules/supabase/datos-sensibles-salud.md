---
paths:
  - "supabase/**"
  - "src/app/features/pacientes/**"
  - "src/app/features/historias-clinicas/**"
---
# Protección de datos sensibles de salud
- Mantén un inventario actualizado de columnas clínicas y de identificación en `docs/clinica/` y contratos de plan.
- Aplica mínimo acceso: hoy solo `odontologo` accede a sus pacientes/historias; `super_admin` no lee datos clínicos; futuro rol asistente requerirá separación explícita.
- **Cero PII o datos clínicos** en `console.log`, mensajes de error, analítica, seeds de prueba ni prompts/chats; en tests usa solo datos sintéticos.
- Registra auditoría de lectura/escritura de historias clínicas y enmascara condiciones altamente sensibles (p. ej. VIH/SIDA) en vistas de listado.
- **Normativa colombiana a validar con un profesional** (no asumir detalle legal de memoria): ley de protección de datos personales y sensibles, normativa de historia clínica odontológica, tiempos de retención, historia clínica electrónica e interoperabilidad, y consentimiento informado.
**Por qué:** la historia clínica contiene datos de salud especialmente protegidos cuya fuga o exposición en logs implica riesgo legal y ético grave.

