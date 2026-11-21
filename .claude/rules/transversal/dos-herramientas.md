# Compatibilidad entre dos herramientas (un escritor a la vez)
- Una sesión (Claude Code o Gemini CLI / Antigravity) = un plan; **nunca dos sesiones editando en paralelo** el mismo plan, tracker, migración o archivo.
- `gestion/tracker/NN_<slug>.md` es la única fuente de verdad del estado y registra `Herramienta en uso: Claude | Gemini`.
- Al cambiar de herramienta a mitad de un plan: cierra la sesión actual, actualiza el tracker y confirma qué quedó pendiente antes de abrir la otra.
- La fuente única de reglas es `.claude/rules/**`, la de agentes es `tools/agentes/fuente/` y la de skills es `tools/skills/fuente/`; tras editarlos ejecuta `node tools/agentes/sincronizar.mjs`.
- Ningún commit ni PR lleva atribución ni trailers de IA de ninguna herramienta.
**Por qué:** mantener copias separadas para Claude y Gemini genera deriva silenciosa entre instrucciones y permisos.

