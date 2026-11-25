# Compactar componentes y densidad UI — Diseño

**Fecha:** 2026-11-24
**Tipo:** Pase transversal de UI (densidad + accesibilidad). Sin cambio de comportamiento, sin BD.
**Origen:** "corrige tamaños, botones, cards y otros componentes no deberían ser tan gigantes, hazlos más compactos y accesibles. Revisa reglas de accesibilidad".

## Objetivo

Reducir la densidad visual de las pantallas (ritmo vertical, paddings, gaps, títulos y avatares decorativos) a una escala consistente, **sin tocar objetivos táctiles clínicos** (≥40×40) ni cambiar lógica ni datos. Resultado: app más compacta y uniforme, accesibilidad intacta.

## Diagnóstico (inventario `relevador`, ruta relativa a `src/app`)

Lo "gigante" no son los componentes base (`app-button` md ≈36px, `app-card` `p-4 sm:p-5`, `app-input` `px-3 py-2` ya compactos), sino el **ritmo de página repetido**: casi toda pantalla usa `py-6` + `space-y-6`, paddings `p-6` literales y títulos `text-2xl`, más outliers (`p-12`/`p-10`/`p-8`, `text-4xl`, avatares `h-20`).

## Escala de densidad (contrato único)

Valores conservadores (un paso abajo). Aplica **solo a pantallas no clínicas**.

| Hoy | Compacto | Dónde |
|---|---|---|
| `py-6` wrapper | `py-5` | header de página |
| `space-y-6` | `space-y-5` | secciones |
| `space-y-8` | `space-y-6` | secciones grandes |
| `gap-6` | `gap-5` | grids |
| `gap-8` | `gap-6` | grids grandes |
| `p-6` literal | `p-5` | paneles/cards sueltas |
| `p-8` | `p-6` | modales/bloques |
| `p-10` / `p-12` | `p-6 sm:p-8` | empty states, login, modal citas |
| `mb-6` / `mt-6` | `mb-5` / `mt-5` | encabezados |
| `mb-8` / `mt-8` | `mb-6` / `mt-6` | encabezados |
| `text-2xl` (H1 de pantalla) | `text-xl` | título de página |
| `text-3xl` (valor de stat) | `text-2xl` | tiles de dashboard |
| avatar deco `h-20 w-20` | `h-14 w-14` | decorativo, no táctil |
| avatar deco `h-16 w-16` | `h-14 w-14` | decorativo, no táctil |
| icono deco `h-14 w-14` | `h-12 w-12` | decorativo, no táctil |

Regla al aplicar: cambiar la clase **solo** cuando el elemento no es táctil clínico y no está en la lista de exclusión. Mantener `sm:` responsive existente coherente (si una clase trae variante `sm:`, ajustar ambas al mismo paso).

## Exclusiones (NO tocar)

- **Clínico protegido (≥40×40):** `examen-ingreso/**`, `odontograma/**`, `evoluciones/**`, `consentimientos` (inputs/botones `min-h-10`/`min-w-10`, selectores S/N, N/A, D/I, escala 1–6). Regla `uso-clinico-y-accesibilidad.md`.
- **Componentes base compartidos:** `shared/components/button|card|input|modal` — ya compactos, su API de `size`/`padding` no cambia.
- **Layout de impresión:** `consentimiento-imprimible` (`mt-16`, `gap-8`, `p-6` son para hoja impresa).
- **FAB interactivo** `pacientes.html:274` (`h-14 w-14`): es botón táctil → se mantiene ≥40.
- **`size="lg"` de recordatorios** (2 ocurrencias): botón táctil deliberado, se mantiene.

## Fuera de alcance / deuda

- **Glifos clínicos <40px** (24px, 28px, 0.9rem en examen/checklist/odontograma): posible deuda de accesibilidad (agrandar, no compactar). Se registra como pendiente, **no** se toca aquí.
- Refactor a page-shell compartido (enfoque #2): descartado por ahora.
- Nada de `*.ts`, `*.scss` de lógica, migraciones ni BD.

## Fases (archivos del inventario)

**Fase 1 — alto tráfico:**
- `features/inicio/inicio.html`
- `features/pacientes/pacientes.html`
- `features/pacientes/detalle/detalle.html`
- `features/citas/citas.html`
- `features/historias-clinicas/historia-clinica.html`

**Fase 2 — resto:**
- `features/auth/login/login.html`, `features/auth/forgot-password/forgot-password.html`, `features/auth/reset-password/reset-password.html`
- `features/onboarding/onboarding.html`
- `features/perfil/perfil.html`
- `features/admin/admin.html`
- `features/reportes/reportes.html`
- `features/plantillas/plantillas.html`
- `features/configuracion-eps/configuracion-eps.html`
- `features/tratamientos/tratamientos.html`
- `features/historial/historial.html`
- `features/pacientes/formulario/formulario.html`
- `features/historias-clinicas/evoluciones/evoluciones.html` (solo `sm:pl-6` del contenedor, no botones clínicos)
- `features/pacientes/detalle/pagos/pagos.html` (skeleton `h-20`)

## Accesibilidad (verificación del pase)

- Ningún objetivo táctil clínico baja de 40×40 (diff no debe tocar los archivos de la lista de exclusión).
- `app-button` conserva `focus:ring`; no se reduce el área interactiva de botones por debajo de ~36px (md actual).
- `<label for>`/`aria-label` existentes se conservan (el pase solo cambia espaciado/tamaño tipográfico, no estructura de controles).

## Pruebas y gates

- `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`, `npm test -- --watch=false`, `node tools/agentes/sincronizar.mjs --check` en verde.
- Revisión visual a ojo por pantalla tras cada fase (el cambio es puramente CSS de clase, sin test unitario nuevo).
- `verificador` (N2): confirma que el diff **no** toca archivos de exclusión y que no quedó ningún clínico <40 alterado.

## Criterio de terminado

- Escala aplicada en Fase 1 y Fase 2; gates verde; `verificador` APROBADO; sin tocar exclusiones; manual sin cambios (no varían campos ni acciones, solo densidad → se registra `revisado: 2026-11-24` donde aplique).
