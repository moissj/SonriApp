# Reparto de modelos por tier
- **Razonamiento** (Claude `opus` / Gemini `pro`): investiga, diseña contratos, planifica, revisa, verifica y pule UI final. Nunca delegues diseño ni seguridad a tiers menores.
- **Codificación** (Claude `sonnet` / Gemini `flash`): único tier que escribe código y tests, siempre con brief autocontenido (archivos, contrato, reglas, validación, criterio de terminado).
- **Barrido** (Claude `haiku` / Gemini `flash-lite`): lectura masiva, inventarios y borradores de manual con salida `ruta:línea`, sin opiniones ni decisiones.
- Toda decisión no cubierta por contrato o reglas va a `pendientes`; jamás se improvisa.
**Por qué:** evita sobre-costo en lecturas mecánicas y errores de criterio en código sin contrato.

