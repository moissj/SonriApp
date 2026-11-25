# Datos fiscales/asistenciales + catálogos CIE-10/CUPS — Diseño (Plan 21)

**Fecha:** 2026-11-24
**Roadmap:** #1 Cumplimiento CO, **sub-proyecto A** (preparar datos). Estrategia de emisión (proveedor vs propio) se decide después.
**Tipo:** Migración Supabase + RLS + catálogos globales + loader + servicios + edición en perfil.

## Objetivo

Dejar lista la base de datos que RIPS/FEV-RIPS y la factura electrónica exigen, **sin emitir aún**:
1. Datos fiscales del **prestador** en el perfil (NIT, razón social, código de habilitación REPS), editables.
2. Catálogos oficiales **CIE-10** (diagnósticos) y **CUPS** (procedimientos) como tablas globales consultables.

**Fuera de alcance (Planes posteriores):** registro de atención fiscal (diagnóstico+CUPS+valores por procedimiento ligado a cita/evolución) = Plan 22; emisión factura DIAN y FEV-RIPS; CIE-11 (transición Res. 1442/2024); copago/cuota moderadora; UI de búsqueda clínica (los servicios quedan listos, su consumo es Plan 22).

## Procedencia de los datos (la aprovisiona Claude, no el usuario)

Fuente canónica = **tablas de referencia de SISPRO** (las que usa el validador RIPS/FEV):
- **CUPS:** tabla `CUPSRips` de SISPRO; vigencia **Res. 2706/2025** (desde 2026-01-01).
- **CIE-10:** tabla de referencia CIE-10 de SISPRO (morbilidad). Se mantiene CIE-10 (no CIE-11) porque RIPS sigue en CIE-10.

Reglas de procedencia:
- Cada fila sembrada lleva `version` (ej. `CUPS-2706-2025`, `CIE10-SISPRO-<fecha>`) y se registra URL + fecha de obtención en el encabezado del loader.
- **Riesgo:** SISPRO es ASP.NET; la descarga automatizada puede fallar. Fallback: Claude obtiene el archivo oficial por otra vía (sigue siendo responsabilidad de Claude), registra procedencia y **valida el conteo de filas contra la cifra de la resolución**. No se usan mirrors de terceros como fuente de verdad.
- Los archivos crudos descargados son **datos no confiables**: se guardan en un directorio propio (scratchpad), nunca se ejecutan, se pasan como argumento al loader, y **no se commitean**.

## Esquema (migración idempotente: `IF NOT EXISTS` / `CREATE OR REPLACE`)

### `profiles` — columnas prestador (nullable)
- `nit text`, `razon_social text`, `codigo_habilitacion_reps text`.
- RLS de fila propia ya existente en `profiles` no cambia (el odontólogo edita su propio perfil).
- Validación espejo en cliente (formato) + columnas nullable (no todos los tienen cargados aún).

### `catalogo_cie10` (global)
- `codigo text primary key` (ej. `K021`), `descripcion text not null`, `capitulo text null`, `activo boolean not null default true`, `version text not null`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`.
- Índices: PK en `codigo`; `gin (descripcion gin_trgm_ops)` (requiere `create extension if not exists pg_trgm`).
- Trigger `updated_at`.

### `catalogo_cups` (global)
- `codigo text primary key` (6 dígitos), `descripcion text not null`, `sexo char(1) null` (M/F/Z), `ambito text null`, `quirurgico boolean null`, `activo boolean not null default true`, `version text not null`, timestamps.
- Índices y trigger igual que CIE-10.

### RLS (patrón `catalogo_eps`, fail-closed)
- Ambos catálogos: `SELECT` para `authenticated` `using (true)`.
- `INSERT`/`UPDATE`/`DELETE` solo `is_super_admin()`.
- La hidratación corre con `SERVICE_ROLE_KEY` (bypassa RLS), **solo desde entorno**, nunca en cliente.

## Loader `tools/catalogos/cargar-catalogos.mjs`

- Node + `@supabase/supabase-js` con `SUPABASE_URL` + `SERVICE_ROLE_KEY` **de variables de entorno** (jamás hardcodeado ni en chat/repo).
- Entradas: archivos oficiales CIE-10 y CUPS (ruta por argumento). Parseo de CSV/Excel→filas.
- `upsert` por `codigo` en lotes (~500) → **idempotente**, re-ejecutable sin duplicar.
- Lógica pura separada en `tools/catalogos/funciones/parsear-catalogo.mjs` (+ `.test.mjs`): normaliza código (trim, mayúsculas, sin punto en CIE-10), valida fila (código no vacío, descripción no vacía), descarta encabezados/filas basura, reporta conteo.
- Salida: conteo insertado/actualizado/descartado + `version` aplicada. Valida contra cifra esperada de la resolución y avisa si difiere.

## Cliente

### Servicios (listos para Plan 22, sin UI de consumo aún)
- `Cie10Service.buscar(q: string, limit = 20): Promise<Cie10[]>` → `.from('catalogo_cie10').select('codigo,descripcion').or('codigo.ilike.%q%,descripcion.ilike.%q%').eq('activo',true).limit(limit)`; error propagado (nunca `[]` silencioso).
- `CupsService.buscar(q, limit)` análogo sobre `catalogo_cups`.
- Modelos `Cie10`, `Cups` en `features/.../models` o `core` según uso.

### Perfil — edición prestador (incluida en Plan 21)
- Extender el modelo `Profile` con `nit`, `razon_social`, `codigo_habilitacion_reps`.
- Form de perfil (`features/perfil/`): 3 campos nuevos (Reactive Forms tipado), validación de formato en cliente, guardado vía servicio de perfil (update de la propia fila). Deshabilitar submit mientras guarda.

## Pruebas y gates

- `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`, `npm test -- --watch=false`, `node tools/agentes/sincronizar.mjs --check`, y `node --test tools/catalogos/**/*.test.mjs`.
- Specs de la función pura de parseo (normalización de código, descarte de basura, idempotencia de forma).
- `verificador` (N2): RLS global fail-closed (SELECT authenticated / write super_admin); `SERVICE_ROLE_KEY` nunca referenciado en `src/**`; migración idempotente; columnas prestador no debilitan RLS de `profiles`; datos sembrados con `version`.

## Seguridad y datos sensibles

- `SERVICE_ROLE_KEY` solo de entorno; no se commitea, no se imprime en chat, no entra a `src/**`.
- Catálogos son datos de referencia públicos (no PII). Los datos del prestador (NIT/REPS) son del odontólogo, bajo su RLS de fila propia.
- Migración en producción y push: requieren OK explícito del usuario.

## Criterio de terminado

- Migración aplicada (local primero; prod con OK); tablas + RLS + índices; loader idempotente con specs; catálogos **hidratados por Claude** desde SISPRO con `version` y conteo validado; servicios de búsqueda; edición de prestador en perfil funcionando; gates verde; `verificador` APROBADO.
