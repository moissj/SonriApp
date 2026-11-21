# Mapa del repositorio — SonriAppV2

> SaaS de gestión de consultorio odontológico para profesionales independientes en Colombia. Stack web cliente **Angular + TypeScript + Tailwind CSS + PrimeNG** y backend gestionado en **Supabase** (Postgres, Auth, RLS, Storage y Edge Functions). **No usa Ionic.**

## 1. Stack y plataforma verificados

| Pieza | Versión / Detalle | Archivo de referencia |
|---|---|---|
| Node.js / npm | `v24.22.1` / `11.19.1` (`packageManager: npm@10.9.0`) | `package.json` |
| Angular / Angular CLI | `21.2.17` (standalone, `OnPush` en schematics) | `package.json`, `angular.json` |
| TypeScript | `5.9.3` (`strict: true`, `strictTemplates: true`) | `tsconfig.json` |
| UI y estilos | Tailwind CSS `3.4.19`, PrimeNG `21.1.9` (`@primeuix/themes` Aura claro fijo), Chart.js `4.5.1` | `tailwind.config.js`, `src/app/app.config.ts` |
| Empaquetado / PWA | `@angular/service-worker` + Capacitor `8.4.1` (`android/` creado, sin Ionic) | `ngsw-config.json`, `capacitor.config.ts` |
| Backend (BaaS) | Supabase (`@supabase/supabase-js` `2.108.2`, Postgres 17 local en `supabase/config.toml`) | `supabase/config.toml`, `src/app/core/supabase.client.ts` |
| Pruebas unitarias | Vitest `4.1.9` (`@angular/build:unit-test`, `jsdom`) | `package.json`, `tsconfig.spec.json` |
| Deploy | Vercel (`dist/SonriAppV2/browser`, `npm run build:prod`) y `_redirects` para Netlify | `vercel.json`, `public/_redirects` |

## 2. Módulos reales existentes vs. inexistentes

### Módulos presentes en `src/app/features/` y `src/app/app.routes.ts`
- `auth` (login, forgot-password, reset-password) y `onboarding`
- `inicio` (panel de inicio)
- `citas` (agenda con Realtime y detección de solapamiento)
- `pacientes` (listado, `formulario`, `detalle`, subvistas `presupuestos`, `pagos` y `odontograma` SVG de 6 superficies incluyendo anillo cervical)
- `historias-clinicas` (`historia-clinica`, `examen-ingreso` con `checklist-item`, `evoluciones`)
- `tratamientos` (catálogo de tratamientos) y `plantillas` (plantillas de mensajes WhatsApp)
- `historial` (registro/historial de comunicaciones)
- `perfil`, `configuracion-eps` (catálogo EPS Colombia) y `reportes` (citas, cobrado vs. por cobrar, pacientes inactivos)
- `admin` (panel `super_admin` para alta y control de cuentas de odontólogos)

### Backend en `supabase/`
- `supabase/migrations/`: 20 migraciones desde `20260701` (nota: las tablas base iniciales y `historia_clinica_inicial` no tienen migración inicial en el repo).
- `supabase/functions/`: `crear-cuenta-odontologo` y `seed-colombia`.
- Storage: bucket `logos` con policies por UID (`<uid>/logo.ext`).
- Sin archivo de tipos autogenerados de Supabase en `src/` actualmente.

### Módulos que NO existen hoy en el repositorio
- RIPS, codificación CIE-10, codificación CUPS, facturación electrónica DIAN.

## 3. Comandos reales verificados

| Propósito | Comando | Estado verificado |
|---|---|---|
| Servidor de desarrollo | `npm start` | Script `ng serve` |
| Verificación de tipos | `npx tsc --noEmit -p tsconfig.app.json` | Ejecutado; falla hoy solo por `seedComunes` faltante en `configuracion-eps.ts:103` (cambio previo sin commitear) |
| Build | `npm run build` | Ejecutado; mismo error preexistente en `configuracion-eps.ts:103` |
| Build producción | `npm run build:prod` | Ejecuta `scripts/set-env.js && ng build` (requiere `SUPABASE_URL` y `SUPABASE_ANON_KEY`) |
| Pruebas unitarias app | `npm test -- --watch=false` | Ejecutado; 5 archivos, 23 pruebas en verde (Vitest) |
| Lint | *(sin script)* | No hay ESLint instalado ni script `lint` en `package.json` |
| Sincronizar agentes/skills | `node tools/agentes/sincronizar.mjs` | Genera `.claude/` y `.gemini/` desde fuente neutra |
| Gate deriva agentes/skills | `node tools/agentes/sincronizar.mjs --check` | Falla con exit 1 si existe deriva o faltan generados |
| Pruebas herramientas proceso | `node --test tools/agentes/tests/*.test.mjs tools/plan/tests/*.test.mjs` | Pruebas nativas con `node:test` |
| Crear plan + tracker | `node tools/plan/nuevo-plan.mjs <slug> "<Título>"` | Crea `NN_<slug>_plan.md` y `NN_<slug>.md` |
| Supabase local | `supabase db reset` / `supabase gen types typescript` | **No probado en esta máquina** (`supabase` CLI no instalado en `PATH`; verificar proyecto MCP antes de consultar BD) |

## 4. Fuente única de verdad vs. archivos generados (Claude Code + Gemini CLI)

| Pieza | Fuente única (editar aquí) | Salidas generadas / consumidas (NO editar a mano) |
|---|---|---|
| Reglas de proyecto | `.claude/rules/<carpeta>/<tema>.md` | Claude Code las carga por `paths:`; `GEMINI.md` importa las transversales e indexa las demás |
| Agentes | `tools/agentes/fuente/<nombre>.md` | `.claude/agents/<nombre>.md` y `.gemini/agents/<nombre>.md` (vía `sincronizar.mjs`) |
| Skills / Comandos | `tools/skills/fuente/<nombre>.md` | `.claude/skills/<nombre>/SKILL.md`, `.gemini/skills/<nombre>/SKILL.md` y `.gemini/commands/<nombre>.toml` |
| Protocolo N0/N1/N2 | `docs/agentes/protocolo.md` | Referenciado por ambas herramientas |
| Planes y estado | `gestion/fase_de_desarrollo/` y `gestion/tracker/` | Actualizado únicamente por la sesión activa |
| Referencias en papel | `docs/superpowers/referencias/historia-clinica-papel/` | 4 fotos `.jfif` originales del formato de historia clínica |

