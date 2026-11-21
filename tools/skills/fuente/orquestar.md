---
nombre: orquestar
descripcion: Coordina una tarea multi-archivo o multi-especialista como N0 siguiendo docs/agentes/protocolo.md, contrato primero y tracker actualizado.
---
# Skill: Orquestar tarea (N0)

Sigue estrictamente `docs/agentes/protocolo.md` y `.claude/rules/transversal/reparto-modelos.md`:

1. **Verificar contexto y herramienta activa:** lee el plan y tracker en `gestion/tracker/NN_<slug>.md`; confirma que no hay otra sesión editando el mismo plan (`dos-herramientas.md`) y registra `Herramienta en uso: Claude | Gemini`.
2. **Relevamiento (solo si hace falta):** invoca `relevador` (tier `barrido`) con `<paquete>` para ubicar archivos y líneas exactas sin contaminar N0.
3. **Contrato primero:** fija o actualiza `gestion/fase_de_desarrollo/NN_<slug>_expediente.json` (versionado) antes de delegar edición.
4. **Pista en serie:**
   - Si toca BD/RLS: despacha `capa-datos` → regenera tipos / prueba `supabase db reset` si aplica → despacha `capa-edge-functions` (si aplica) → despacha `cliente-web`.
   - Si toca ≥ 2 especialistas o ≥ 4 archivos: usa `<paquete>` estricto por dueño. Si es < 4 archivos y 1 solo especialista, envía brief mínimo al especialista `codificacion`.
5. **Revisión adversarial (N2):** al terminar la implementación, despacha `verificador` con `<paquete>` para auditar contrato, RLS, datos sensibles y gates reales.
6. **Cierre:** actualiza `gestion/tracker/NN_<slug>.md` (marca `- [x]` solo tras evidencia real) y, si todos los gates pasan, realiza commit local explícito sin atribución de IA (o pide OK si involucra push/prod/RLS en prod).

