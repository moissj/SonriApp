---
paths:
  - "supabase/functions/**"
---
# Edge Functions (Deno / Supabase)
- Valida el JWT del solicitante en servidor (`auth.getUser()`) y verifica su rol desde BD antes de usar `SERVICE_ROLE_KEY`.
- Valida estructura y tipos del cuerpo de entrada; responde códigos HTTP semánticos (`400` legible, `401`, `403`, `404`, `409`), nunca `500` para casos esperables.
- Define headers CORS explícitos y maneja `OPTIONS` preflight; restringe orígenes en producción si la función es privada.
- Lee todos los secretos exclusivamente con `Deno.env.get(...)`; jamás hardcodees llaves ni devuelvas trazas internas en el JSON de error.
**Por qué:** `crear-cuenta-odontologo` usa `SERVICE_ROLE_KEY` para invitar usuarios; cualquier falla de validación abriría alta no autorizada de cuentas.

