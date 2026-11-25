# Plan 20 — Compactar componentes y densidad UI

- **ID:** `20_compactar-componentes`
- **Estado:** En ejecución
- **Tracker:** [`gestion/tracker/20_compactar-componentes.md`](../tracker/20_compactar-componentes.md)
- **Diseño aprobado:** [`docs/superpowers/specs/2026-11-24-compactar-componentes-design.md`](../../docs/superpowers/specs/2026-11-24-compactar-componentes-design.md)

## Objetivo
Reducir densidad visual (ritmo vertical, paddings, gaps, títulos, avatares decorativos) a una escala consistente en pantallas **no clínicas**, sin cambiar lógica, datos ni objetivos táctiles clínicos (≥40×40).

**Fuera de alcance (YAGNI):** page-shell compartido; glifos clínicos <40px (deuda aparte); `*.ts`, migraciones, BD; componentes base compartidos; layout de impresión.

## Enfoque
Frontend-only, **solo clases Tailwind en `.html` de features**. Sin BD, sin contrato JSON (el contrato es la **escala de densidad** del spec). Un solo especialista (`cliente-web`) en 2 fases → `verificador`. Sin tests unitarios nuevos (cambio puramente de clase CSS); verificación por gates + revisión visual + auditoría de exclusiones.

## Escala de densidad (contrato de edición)
Reemplazar clase **solo** si el elemento no es táctil clínico y el archivo no está excluido. Si la clase trae variante `sm:`, ajustar ambas al mismo paso.

| Hoy | → | Hoy | → |
|---|---|---|---|
| `py-6` | `py-5` | `mb-6`/`mt-6` | `mb-5`/`mt-5` |
| `space-y-6` | `space-y-5` | `mb-8`/`mt-8` | `mb-6`/`mt-6` |
| `space-y-8` | `space-y-6` | `text-2xl` (H1 pantalla) | `text-xl` |
| `gap-6` | `gap-5` | `text-3xl` (valor stat) | `text-2xl` |
| `gap-8` | `gap-6` | `text-display sm:text-4xl` | `text-2xl sm:text-3xl` |
| `p-6` literal | `p-5` | avatar deco `h-20 w-20` | `h-14 w-14` |
| `p-8` | `p-6` | avatar deco `h-16 w-16` | `h-14 w-14` |
| `p-10`/`p-12` | `p-6 sm:p-8` | icono deco `h-14 w-14` | `h-12 w-12` |

## Exclusiones (NO tocar)
- Clínico ≥40×40: `examen-ingreso/**`, `odontograma/**`, `evoluciones/**` (salvo `sm:pl-6` del contenedor exterior), `consentimientos` (`min-h-10`/`min-w-10`).
- `shared/components/button|card|input|modal` (API `size`/`padding` intacta).
- `consentimiento-imprimible` (layout de impresión).
- FAB `pacientes.html:274` (`h-14 w-14` táctil → se queda).
- `recordatorios.html` `size="lg"` (2) → se queda.

## Archivos a modificar
**Fase 1 (alto tráfico):** `inicio/inicio.html`, `pacientes/pacientes.html`, `pacientes/detalle/detalle.html`, `citas/citas.html`, `historias-clinicas/historia-clinica.html`.

**Fase 2 (resto):** `auth/login/login.html`, `auth/forgot-password/forgot-password.html`, `auth/reset-password/reset-password.html`, `onboarding/onboarding.html`, `perfil/perfil.html`, `admin/admin.html`, `reportes/reportes.html`, `plantillas/plantillas.html`, `configuracion-eps/configuracion-eps.html`, `tratamientos/tratamientos.html`, `historial/historial.html`, `pacientes/formulario/formulario.html`, `historias-clinicas/evoluciones/evoluciones.html` (solo `sm:pl-6` contenedor), `pacientes/detalle/pagos/pagos.html` (skeleton `h-20`).

Rutas relativas a `src/app/features/`.

## Cambios de BD / SQL / RLS
- **Ninguno.**

## Tareas

### Tarea 1 — Fase 1 (cliente-web)
Aplicar la escala a los 5 html de alto tráfico. Verificar que no se tocó ningún archivo de exclusión ni botón clínico. Gates verde.
- **Terminado:** diff solo en los 5 archivos; `tsc`/`build`/`test`/`sincronizar --check` verde; revisión visual OK.

### Tarea 2 — Fase 2 (cliente-web)
Aplicar la escala a los html restantes (incl. `evoluciones` solo `sm:pl-6` exterior, `pagos` skeleton). Mismas verificaciones.
- **Terminado:** diff solo en archivos de Fase 2; gates verde; visual OK.

### Tarea 3 — Verificación (verificador)
Auditar: diff **no** toca exclusiones; ningún clínico <40 alterado; sin cambio de estructura de controles ni pérdida de `label`/`aria-label`; gates reales verde.

### Tarea 4 — Cierre
Manual sin cambios de campos/acciones → registrar `revisado: 2026-11-24` donde aplique. Commit local por fase o único al cerrar (rutas explícitas, sin atribución IA). Push solo con OK explícito.

## Casos de prueba
- No hay unidad nueva. Gates: `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`, `npm test -- --watch=false`, `node tools/agentes/sincronizar.mjs --check`.
- Auditoría de exclusiones (verificador): `git diff --name-only` no incluye `examen-ingreso/`, `odontograma/`, `consentimiento-imprimible`, ni `shared/components/`.
