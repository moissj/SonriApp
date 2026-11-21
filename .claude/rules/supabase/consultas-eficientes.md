---
paths:
  - "src/app/core/services/**"
  - "src/app/features/**/*.service.ts"
---
# Consultas eficientes a Supabase
- Prohibido el patrón N+1 en listados o detalles; usa joins acotados o vistas/RPC cuando corresponda.
- Usa `select('col1, col2, ...')` con columnas explícitas en listados y cabeceras; evita `select('*')` en tablas grandes o con JSONB pesado.
- Pagina listados en servidor usando `.range(desde, hasta)` cuando superen vistas de detalle puntual.
- Toda columna usada en filtros frecuentes o policies RLS (`odontologo_id`, `paciente_id`, `fecha`) debe tener índice en Postgres.
- Verifica e informa **siempre** el `error` devuelto por Supabase; nunca devuelvas `[]` silencioso ocultando un fallo de red o RLS.
**Por qué:** `PatientService.getPatients` usa `select('*')` sin paginar y captura errores devolviendo `[]`, ocultando fallos reales al usuario.

