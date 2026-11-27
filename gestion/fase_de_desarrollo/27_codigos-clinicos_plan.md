# Plan 27 — Integrar CIE10 y CUPS via buscador reusable

- **ID:** `27_codigos-clinicos`
- **Estado:** En ejecución
- **Tracker:** [`gestion/tracker/27_codigos-clinicos.md`](../tracker/27_codigos-clinicos.md)
- **Contrato:** [`27_codigos-clinicos_expediente.json`](./27_codigos-clinicos_expediente.json)

## Objetivo
Dar uso a los servicios huérfanos `Cie10Service` / `CupsService` (catálogos ya sembrados: CIE10 12.634, CUPS 13.640 filas) integrándolos en los módulos clínicos correspondientes:
- **CIE10 → Evoluciones** (`historias_clinicas`): diagnóstico codificado (1 principal), junto al `diagnostico` texto libre actual (que se conserva como descripción).
- **CUPS → Tratamientos (catálogo)**: cada tratamiento con su código de procedimiento oficial.

**Fuera de alcance:** herencia de CUPS en `presupuesto_items` (plan aparte), varios diagnósticos por evolución (tabla puente futura si RIPS lo exige), CUPS en citas.

## Enfoque
- **1 componente reusable** `shared/components/codigo-buscador/` (ambos servicios devuelven `{codigo, descripcion}` → misma forma). No se refactoriza `patient-autocomplete`; se modela su patrón (debounce 300ms, dropdown, limpiar).
- Orden: BD (migración aditiva) → tipos → componente shared → cableado evoluciones + tratamientos → verificador.
- Columnas nuevas viven en tablas con RLS tenant existente → **heredan policy** (sin policy nueva). Catálogos ya tienen SELECT para `authenticated` → `buscar()` funciona sin cambios.

## Archivos a crear / modificar
- **Crear:** `supabase/migrations/<ts>_cie10_cups_columnas.sql`
- **Crear:** `src/app/shared/components/codigo-buscador/{codigo-buscador.ts,.html,.scss}`
- **Crear:** `src/app/shared/components/codigo-buscador/funciones/etiqueta-codigo.funcion.ts` (+ `.spec.ts`)
- **Modificar:** `src/app/core/services/historias-clinicas.service.ts` (campo `cie10_codigo`), `tratamiento.service.ts` (campo `cups_codigo`)
- **Modificar:** `evoluciones.ts/.html`, `tratamientos.ts/.html`

## Cambios de BD / SQL / RLS
- `historias_clinicas` → `ADD COLUMN IF NOT EXISTS cie10_codigo text REFERENCES public.catalogo_cie10(codigo)` (nulable; FK valida código).
- `tratamientos` → `ADD COLUMN IF NOT EXISTS cups_codigo text REFERENCES public.catalogo_cups(codigo)` (nulable).
- Idempotente (`IF NOT EXISTS`). Aditivo: cero pérdida; `diagnostico` texto y filas existentes intactos. Reversible (drop column; narrativa conservada).
- Sin policy RLS nueva (heredan de la tabla). Sin índice por ahora (YAGNI; agregar si reporting RIPS lo pide).

## Reglas de negocio y contrato
- Código es opcional (nulable); no bloquea guardar la evolución ni el tratamiento.
- FK garantiza que solo se guarden códigos válidos del catálogo activo.
- Un fallo al guardar nunca muestra éxito; error de carga del buscador muestra estado de error, no lista vacía silenciosa.

## Casos de prueba
- `etiquetaCodigo`: formatea `{codigo, descripcion}` → `"K021 — Caries..."`; borde: descripcion vacía, código solo.
- Buscador: query vacía → `[]`; selección emite `{codigo, descripcion}`; limpiar emite `null`.
- Persistencia: guardar evolución con `cie10_codigo` y tratamiento con `cups_codigo`, recargar, el código persiste (datos sintéticos).
