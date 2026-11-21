# Mapa de herramientas, modelos y compatibilidad (Claude Code + Gemini CLI)

> Referencia oficial verificada usada por `tools/agentes/sincronizar.mjs`. Ningún nombre de herramienta o modelo se fija de memoria sin estar documentado aquí.

## 1. Entorno verificado en esta máquina

| Herramienta | Estado en esta máquina | Versión / Fuente de verificación |
|---|---|---|
| **Claude Code** | **Instalado y verificado** (`claude --version`, `claude agents --help`) | `2.1.308` |
| **Gemini CLI** | **No instalado en `PATH`** (el usuario opera con Antigravity) | Verificado contra documentación oficial (`geminicli.com` y `github.com/google-gemini/gemini-cli`) |
| **Supabase CLI** | **No instalado en `PATH`** (se usa MCP en Antigravity) | `supabase/config.toml` + documentación oficial |

## 2. Mapa de tiers a modelos

| Tier abstracto | Uso en el flujo | Modelo en Claude Code | Modelo en Gemini CLI | Notas |
|---|---|---|---|---|
| `razonamiento` | N0, diseño, contrato, plan, `verificador`, pulido final | `opus` | `pro` *(alias oficial; equiv. `gemini-2.5-pro` / `gemini-3.1-pro-preview`)* | Si cambia el alias vigente en Gemini CLI, actualizar `sincronizar.mjs` y esta tabla |
| `codificacion` | Especialistas N1 que editan código y tests | `sonnet` | `flash` *(alias oficial; equiv. `gemini-2.5-flash` / `gemini-3-flash-preview`)* | `sincronizar.mjs` usa los aliases oficiales portables (`pro`, `flash`, `flash-lite`) |
| `barrido` | Lectura masiva, inventarios, borradores de manual (`relevador`) | `haiku` | `flash-lite` *(alias oficial; equiv. `gemini-2.5-flash-lite` / `gemini-3.1-flash-lite-preview`)* | Solo lectura; nunca decide seguridad ni criterio clínico |

## 3. Mapa de herramientas abstractas

| Herramienta abstracta | Claude Code (`.claude/agents/*.md`) | Gemini CLI (`.gemini/agents/*.md`) | Lectura / Escritura |
|---|---|---|---|
| `leer` | `Read` | `read_file` | Solo lectura |
| `editar` | `Edit` | `replace` | Escritura |
| `escribir` | `Write` | `write_file` | Escritura |
| `buscar-archivos` | `Glob` | `glob`, `list_directory` | Solo lectura |
| `buscar-texto` | `Grep` | `grep_search` | Solo lectura |
| `shell` | `Bash` | `run_shell_command` | Ejecución |

- **Garantía de solo lectura:** `relevador` y `verificador` tienen prohibidos `editar` y `escribir` en la fuente neutra; `sincronizar.mjs` falla si aparecen y nunca emite `Edit`/`Write` ni `replace`/`write_file` para ellos.

## 4. Mapa de esfuerzo (`esfuerzo`)

| Abstracto | Claude Code (`effort`) | Gemini CLI |
|---|---|---|
| `alto` | `high` | **No soportado** en frontmatter `.gemini/agents/*.md` (omitido y registrado en cabecera) |
| `medio` | `medium` | **No soportado** (omitido) |
| `bajo` | `low` | **No soportado** (omitido) |

## 5. Mecanismos equivalentes (contexto, skills, seguridad, compresión)

| Capacidad | Claude Code | Gemini CLI |
|---|---|---|
| Contexto raíz | `CLAUDE.md` (< 120 líneas) | `GEMINI.md` (importa `@./CLAUDE.md` + transversales sin globs) |
| Reglas por ruta | `.claude/rules/<carpeta>/<tema>.md` con `paths:` | Sin soporte de globs en `@` imports → índice explícito en `GEMINI.md` apuntando a `.claude/rules/**` |
| Skills / Comandos | `.claude/skills/<nombre>/SKILL.md` | `.gemini/skills/<nombre>/SKILL.md` **y** `.gemini/commands/<nombre>.toml` (`@{ruta}`, `{{args}}`) |
| Compresión contexto | `.claude/settings.json` → `autoCompactWindow: 300000` | `.gemini/settings.json` → `model.compressionThreshold: 0.5` + `/compress` |
| Secretos / Ignore | `permissions.deny`: `Read(.env*)`, `Read(**/.env*)`, `Read(.mcp.json)` | `.geminiignore` + `context.fileFiltering.respectGeminiIgnore: true` |
| Sin atribución IA | `includeCoAuthoredBy: false`, `attribution: { commit: "", pr: "" }` | Sin trailer por defecto; reforzado como regla en `GEMINI.md` |

## 6. No soportado, no verificado o no probado en esta máquina

1. **Globs en `@` imports de `GEMINI.md`:** **No soportado.** Alternativa implementada: `@./` solo con rutas exactas para reglas transversales + tabla índice hacia `.claude/rules/<carpeta>/`.
2. **Campo `effort` en agentes Gemini:** **No soportado.** Alternativa: omitido por `sincronizar.mjs` con nota en la cabecera del generado; `max_turns` acota la iteración.
3. **Reenvío stateful (`SendMessage`) a un subagente en Gemini CLI:** **No verificado.** Alternativa documentada en `protocolo.md`: re-invocar `@<agente>` pasando el informe previo y la causa del rechazo.
4. **Diferencia de garantía de seguridad:** `.geminiignore` filtra herramientas de lectura/búsqueda (`read_file`, `glob`, `grep_search`), pero **no bloquea** lectura vía `run_shell_command` salvo que el usuario configure Policy Engine (`~/.gemini/policies/*.toml`) o `--sandbox`. En Claude Code, `Bash` también requiere sandboxing adicional para bloquear lectura por shell; en ambos está prohibido leer `.env*` o `.mcp.json` por regla y `permissions.deny`/`.geminiignore`.
5. **Carga real de `.gemini/agents/*.md` (`/agents list`) y `supabase db reset`:** **No probado en esta máquina** porque ni `gemini` CLI ni `supabase` CLI están instalados en `PATH`.

