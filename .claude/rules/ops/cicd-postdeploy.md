---
paths:
  - "vercel.json"
  - "scripts/set-env.js"
  - "ngsw-config.json"
---
# Despliegue y verificación post-deploy
- Todo deploy a producción ocurre vía PR validado con gates en verde y **OK explícito** del usuario (nunca desde cambios locales sin revisar).
- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` existan en las variables del proveedor (Vercel); nunca empaquetes `SERVICE_ROLE_KEY`.
- Checklist obligatorio post-deploy: carga de SPA y Service Worker sin 404 en rutas, login real, consulta de paciente filtrada por RLS, guardado de prueba en entorno seguro y revisión de logs en Vercel/Supabase.
**Por qué:** `scripts/set-env.js` usa valores de respaldo si faltan variables en build; validar entorno evita apuntar producción al proyecto equivocado.

