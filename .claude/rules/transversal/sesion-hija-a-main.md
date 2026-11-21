# Integración de rama hija a main (worktrees)
- Si trabajas una rama paralela, hazlo en un `git worktree` separado; nunca cambies de rama en el working tree activo con trabajo abierto.
- La sesión madre integra la rama hija en un worktree temporal usando `git merge --no-ff <rama>`.
- Ejecuta la verificación completa (`tsc --noEmit`, `npm run build`, `npm test -- --watch=false`, `sincronizar.mjs --check`) antes de avanzar `main` con `--ff-only`.
- Nunca dejes un conflicto o merge a medio resolver en el repositorio principal.
**Por qué:** pendiente de documentar.

