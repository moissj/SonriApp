---
paths:
  - "package.json"
  - "supabase/config.toml"
  - ".env.example"
  - "scripts/set-env.js"
---
# Entorno local y versiones
- Versiones verificadas: Node `v24.22.1`, npm `11.19.1` (`packageManager: npm@10.9.0`), Angular CLI `21.2.17`, Claude Code `2.1.308`. Gemini CLI y Supabase CLI no están en `PATH` (Gemini se opera vía Antigravity y Supabase vía MCP verificando siempre el proyecto enlazado).
- Puertos definidos en `supabase/config.toml`: API `54321`, DB `54322` (Postgres 17), Studio `54323`, Inbucket `54324`, Analytics `54327`; app Angular en `4200`.
- Variables requeridas (solo nombres, jamás valores): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (cliente/build); `SUPABASE_SERVICE_ROLE_KEY` (solo Edge Functions).
- Con `supabase` CLI disponible en entorno local: `supabase start` y `supabase db reset`.
**Por qué:** documentar versiones exactas y el proyecto MCP activo evita ejecutar migraciones o scripts contra una BD equivocada.

