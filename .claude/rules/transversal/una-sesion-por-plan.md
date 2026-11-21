# Una sesión por plan
- Cada sesión (Claude Code o Gemini CLI / Antigravity) ejecuta **un solo plan** hasta cerrarlo y commitearlo.
- Al cerrar un plan, la siguiente tarea inicia en una sesión limpia.
- En Claude Code mantén `autoCompactWindow: 300000` en `.claude/settings.json`; en Gemini usa `model.compressionThreshold: 0.5` y `/compress`.
- Emite informes cortos (≤ 4 000 caracteres) y filtra salidas extensas de comandos (`Select-Object -Last` / `| tail` / `| grep`).
**Por qué:** sesiones largas mezclan contexto entre planes y degradan el cumplimiento del contrato.

