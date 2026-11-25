# Plan 21 — Datos fiscales prestador + catálogos CIE-10/CUPS

- **ID:** `21_datos-fiscales-cie10-cups`
- **Estado:** En ejecución
- **Tracker:** [`gestion/tracker/21_datos-fiscales-cie10-cups.md`](../tracker/21_datos-fiscales-cie10-cups.md)
- **Diseño aprobado:** [`docs/superpowers/specs/2026-11-24-datos-fiscales-cie10-cups-design.md`](../../docs/superpowers/specs/2026-11-24-datos-fiscales-cie10-cups-design.md)
- **Contrato:** [`21_datos-fiscales-cie10-cups_expediente.json`](21_datos-fiscales-cie10-cups_expediente.json)

## Objetivo
Roadmap #1 (Cumplimiento CO), sub-proyecto A: dejar lista la base de datos que RIPS/FEV-RIPS y la factura DIAN exigen, **sin emitir**. Dos piezas: datos fiscales del prestador en el perfil, y catálogos oficiales CIE-10/CUPS consultables.

**Fuera de alcance:** registro de atención fiscal (Plan 22), emisión DIAN/FEV-RIPS, CIE-11, copago/cuota moderadora, UI de consumo de catálogos.

## Enfoque
Pista en serie (protocolo): **BD/RLS (`capa-datos`)** → regenerar/extender tipos → **loader + hidratación (`capa-datos` + N0 provisiona raw)** → **cliente (`cliente-web`)** → **`verificador`**. Contrato en `expediente.json`. Catálogos con patrón global `catalogo_eps` (lectura authenticated, escritura `super_admin`). Hidratación la hace Claude desde SISPRO, no el usuario.

## Cambios de BD / SQL / RLS
Migración idempotente nueva (`supabase/migrations/<ts>_datos_fiscales_cie10_cups.sql`):
- `profiles` + `nit`, `razon_social`, `codigo_habilitacion_reps` (nullable). RLS de fila propia **no cambia**.
- `catalogo_cie10` y `catalogo_cups` (ver `expediente.json` para columnas). `create extension if not exists pg_trgm`. Índices PK + GIN trigram en `descripcion`. Trigger `updated_at`.
- RLS fail-closed: `SELECT authenticated using(true)`; `INSERT/UPDATE/DELETE` solo `is_super_admin()`.
- **Nunca** reescribir migraciones aplicadas; `IF NOT EXISTS`/`CREATE OR REPLACE`.

## Reglas de negocio y contrato
- `SERVICE_ROLE_KEY` solo de entorno; jamás en `src/**`, repo ni chat.
- Catálogos = datos de referencia (sin PII); prestador (NIT/REPS) bajo RLS de fila propia.
- Error de Supabase siempre propagado (nunca `[]` silencioso).
- Migración a prod y push: **OK explícito** del usuario.

## Tareas

### Tarea 1 — Migración + RLS (`capa-datos`)
Crear la migración según `expediente.json`. Aplicar en entorno local primero; verificar tablas, RLS (9 policies aprox.), índices, extensión, triggers. Regenerar/ajustar tipos consumidos.
- **Terminado:** migración idempotente escrita y aplicada local; RLS fail-closed verificada; sin tocar RLS previa de `profiles`.

### Tarea 2 — Loader + hidratación (`capa-datos` + N0)
- `tools/catalogos/funciones/parsear-catalogo.mjs` (+ `.test.mjs`): parseo/normalización pura (código trim+mayúsculas, CIE-10 sin punto, descarta basura, valida no vacíos).
- `tools/catalogos/cargar-catalogos.mjs`: `@supabase/supabase-js` + env; upsert por `codigo` en lotes ~500; idempotente; reporta conteos + `version`.
- **N0 provisiona** los archivos oficiales desde SISPRO (CUPS `CUPSRips` / CIE-10) en directorio propio no versionado; valida conteo vs resolución; corre el loader.
- **Terminado:** specs del parseo verdes; catálogos hidratados con `version`; conteos validados; raw files no commiteados.

### Tarea 3 — Servicios + perfil (`cliente-web`)
- Modelos `Cie10`/`Cups`; `Cie10Service.buscar` / `CupsService.buscar` (`.or(codigo.ilike, descripcion.ilike)`, `activo=true`, `limit`, error propagado).
- `Profile` + 3 columnas; form de perfil con 3 campos (Reactive Forms tipado, validación, submit deshabilitado al guardar) y guardado de la propia fila.
- **Terminado:** servicios compilando; edición de prestador funcional; OnPush + signals; gates verde.

### Tarea 4 — Verificación (`verificador`)
Auditar: RLS global fail-closed (SELECT authenticated / write super_admin); `SERVICE_ROLE_KEY` ausente de `src/**`; migración idempotente; columnas prestador no debilitan RLS de `profiles`; filas con `version`; gates reales.

### Tarea 5 — Cierre
Aplicar migración a **prod con OK explícito**; commit local por rutas explícitas (sin atribución IA); push con OK. Manual: `perfil` gana campos → actualizar su página de manual (nuevos campos del prestador).

## Casos de prueba
- `parsear-catalogo.test.mjs`: normaliza código; descarta encabezado/filas vacías; idempotencia de forma; CIE-10 sin punto.
- RLS: usuario no super_admin no puede INSERT/UPDATE/DELETE en catálogos; cualquier `authenticated` puede SELECT; perfil ajeno no visible.
- Gates del `expediente.json`.
