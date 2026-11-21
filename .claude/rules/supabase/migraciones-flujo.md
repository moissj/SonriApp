---
paths:
  - "supabase/migrations/**"
---
# Flujo de migraciones Supabase
- Escribe migraciones **idempotentes** en `supabase/migrations/` (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`, seeds con `WHERE NOT EXISTS`).
- **Nunca edites ni reescribas** una migración ya aplicada; corrige siempre con una migración nueva y timestamp posterior.
- Verifica timestamps entre sesiones antes de crear archivos para evitar colisiones de orden.
- Toda migración de datos clínicos (`pacientes`, `historias_clinicas`, `historia_clinica_inicial`, `odontogramas`) debe ser reversible o incluir respaldo previo.
- Verifica con `supabase db reset` local cuando el CLI esté disponible; hoy `supabase` CLI no está en `PATH` (ver `docs/mapa-repo.md`).
**Por qué:** tablas base como `pacientes`, `historias_clinicas` y `historia_clinica_inicial` carecen de migración inicial en el repo, dificultando reproducir la BD desde cero.

