# SonriAppV2 — Contexto para Gemini CLI / Antigravity

> Las instrucciones base del proyecto, mentalidad senior, workflow, Git, prohibición de atribución IA y deploy están en `CLAUDE.md` (importado abajo; no duplicar). Consulta compatibilidad y comandos verificados en `docs/agentes/mapa-herramientas.md` y `docs/mapa-repo.md`.

@./CLAUDE.md
@./.claude/rules/transversal/reparto-modelos.md
@./.claude/rules/transversal/commit-al-terminar.md
@./.claude/rules/transversal/una-sesion-por-plan.md
@./.claude/rules/transversal/dos-herramientas.md
@./.claude/rules/transversal/sesion-hija-a-main.md
@./.claude/rules/transversal/multi-consultorio-alcance.md
@./.claude/rules/transversal/manual-usuario.md

## Índice de reglas por ruta (leer antes de editar — Gemini `@` no soporta globs)

| Si tocas... | Lee obligatoriamente... |
|---|---|
| `src/**/*.ts`, `supabase/functions/**/*.ts`, `tools/**/*.mjs` | `.claude/rules/transversal/codigo-limpio.md` |
| `supabase/migrations/**` | `.claude/rules/supabase/migraciones-flujo.md`, `.claude/rules/supabase/tipos-y-contratos.md` |
| `supabase/**`, `pacientes/**`, `historias-clinicas/**` | `.claude/rules/supabase/rls-y-seguridad.md`, `.claude/rules/supabase/datos-sensibles-salud.md` |
| `supabase/**`, `historias-clinicas/**` | `.claude/rules/supabase/historia-clinica-integridad.md` |
| `src/app/core/services/**`, `**/*.service.ts` | `.claude/rules/supabase/consultas-eficientes.md`, `.claude/rules/supabase/tipos-y-contratos.md` |
| `supabase/functions/**` | `.claude/rules/supabase/edge-functions.md` |
| `src/app/**` | `.claude/rules/frontend/arquitectura-modulo.md`, `change-detection.md`, `templates-y-estado.md`, `fechas-y-http.md` |
| `src/app/**/*.html`, `*.scss`, `*.css`, `tailwind.config.js` | `.claude/rules/frontend/tailwind-y-diseno.md`, `uso-clinico-y-accesibilidad.md` |
| Formularios de paciente, historia clínica o `shared/components/**` | `.claude/rules/frontend/formularios-clinicos.md` |
| `odontograma/**`, `odontograma.service.ts` | `.claude/rules/clinica/odontograma.md` |
| Tests, build, deploy o entorno local | `.claude/rules/ops/*.md` |

## Operación específica en Gemini CLI / Antigravity

- **Agentes (`.gemini/agents/`):** `@capa-datos`, `@capa-edge-functions`, `@cliente-web`, `@relevador`, `@verificador` siguiendo `docs/agentes/protocolo.md`.
- **Comandos / Skills:** `/orquestar`, `/auditar-formulario-vs-papel`, `/nuevo-formulario-clinico` (`.gemini/commands/*.toml` y `.gemini/skills/*/SKILL.md`).
- **Contexto y trazabilidad:** usa `/compress` en sesiones largas; marca `Herramienta en uso: Gemini` en `gestion/tracker/NN_<slug>.md`; **no añadas `Co-authored-by` ni atribución de IA** en commits.
- **Seguridad:** no accedas por shell a `.env*`, `.mcp.json` ni `supabase/.temp/` (ver `.geminiignore`). Si usas MCP de Supabase, confirma que el proyecto conectado es SonriApp antes de consultar.

