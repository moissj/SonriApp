# Commit al terminar la tarea
- Si la tarea terminó y **todas las validaciones locales pasan** (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false` y `sincronizar.mjs --check`), haz commit local sin preguntar, incluyendo solo los archivos de la tarea (`git add <rutas explícitas> && git commit`).
- **Requieren OK explícito previo:** `git push`, crear/mergear PR, deploy a producción, aplicar migraciones o cambios de RLS en producción, borrados destructivos y reescribir historial (`--amend`, `rebase`, `reset --hard`).
- Jamás uses `git add -A` ni `git add .` para no arrastrar cambios ajenos o secretos.
**Por qué:** cambios sin commitear acumulan deuda y mezclan tareas, como el error preexistente en `configuracion-eps.ts`.

