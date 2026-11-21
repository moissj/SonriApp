# SonriAppV2 — Instrucciones del repositorio

**Stack:** Angular `21.2.17` (standalone, `OnPush`) + TypeScript `5.9.3` (`strict`) + Tailwind `3.4.19` + PrimeNG `21.1.9` + Supabase (Postgres 17, Auth, RLS, Storage, Edge Functions) + PWA / Capacitor `8.4.1` (**sin Ionic**). Mapa y comandos reales en `docs/mapa-repo.md`.

## Reglas (fuente única en `.claude/rules/`)

| Carpeta | Contenido | Cuándo se carga |
|---|---|---|
| `transversal/` | Reparto de modelos, commit, sesiones, dos herramientas, worktrees, alcance multi-consultorio, manual | Siempre (salvo `codigo-limpio.md`: al tocar código `.ts`/`.mjs`) |
| `supabase/` | Migraciones, RLS/seguridad, datos sensibles de salud, integridad historia clínica, tipos, consultas, Edge Functions | Al tocar `supabase/**`, services o módulos clínicos |
| `frontend/` | Arquitectura por módulo, `OnPush`, templates/estado, Tailwind, formularios clínicos, accesibilidad, fechas `America/Bogota` | Al tocar `src/app/**` o `tailwind.config.js` |
| `clinica/` | Protección del odontograma SVG (`odontograma.md`) | Al tocar `odontograma/**`, `odontograma.service.ts` o migraciones afines |
| `ops/` | Testing por módulo/RLS, suite verde, gates locales, post-deploy, entorno local | Al tocar tests, configs de build/deploy o `tools/**` |

> Al editar reglas: **un archivo = un tema y < 40 líneas**.
> Este repo se trabaja también con **Gemini CLI / Antigravity**: ver `.claude/rules/transversal/dos-herramientas.md`.

## Mentalidad senior

- **Código y migraciones actuales son la fuente de verdad:** mínima superficie de cambio; decide por trade-offs explícitos.
- **Correctitud de datos, contratos e idempotencia:** migraciones idempotentes (`IF NOT EXISTS`, `CREATE OR REPLACE`); nunca reescribas migraciones ya aplicadas.
- **Refactor ≠ cambio de comportamiento:** mejorar un formulario y migrar sus datos son tareas y planes separados.
- **Valida lo que tocas:** ejecuta `tsc --noEmit`, `npm run build`, `npm test -- --watch=false` y `node tools/agentes/sincronizar.mjs --check`; reporta fallos con su salida real. **Mide, no supongas.**
- **Confirma antes de lo irreversible:** migraciones o cambios de RLS en producción, borrados destructivos y deploys requieren mostrar el plan y esperar OK explícito.
- **Reusa antes de crear:** revisa `src/app/shared/` y `src/app/core/` antes de duplicar controles o helpers.
- **Seguridad por RLS, no por UI:** `@if` en Angular es UX, nunca control de acceso. La `SERVICE_ROLE_KEY` jamás llega al cliente.
- **Datos clínicos sensibles:** mínimo acceso, cero datos de pacientes en logs, errores, analítica, tests o chat; en tests y seeds usa solo datos sintéticos.
- **Credenciales seguras:** solo desde configuración/entorno de desarrollo; nunca hardcodeadas ni repetidas en el chat.

## Workflow obligatorio antes de escribir código funcional

0. **Releer reparto de modelos:** `.claude/rules/transversal/reparto-modelos.md` y `docs/agentes/protocolo.md` (razonamiento piensa/verifica, codificación escribe, barrido lee).
1. **Plan:** crear el par plan + tracker con `node tools/plan/nuevo-plan.mjs <slug> "<Título>"`.
2. **Tracker:** `gestion/tracker/NN_<slug>.md` es la única fuente de verdad del estado (`- [ ]` → `- [~]` → `- [x]`).

## Git

- Nunca pises el tracker, plan o migración de otra sesión; un escritor a la vez.
- Para commitear: `git add <rutas explícitas> && git commit -m "..."` en una sola operación; jamás `git add -A` ni `git add .`.
- Jamás uses `--amend` ni reescribas commits ajenos; para trabajar otra rama en paralelo usa `git worktree`.

## Sin atribución de IA

- Cero atribución, co-autoría o trailers de Claude Code, Gemini CLI ni otra IA en commits, mensajes o PRs.

## Deploy

- Producción solo vía PR con gates en verde, **OK explícito** del usuario y verificación post-deploy (`.claude/rules/ops/cicd-postdeploy.md`).

