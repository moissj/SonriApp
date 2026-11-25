# Pulido UI/UX — Adopción del sistema de diseño

**Fecha:** 2026-11-25
**Decisiones del usuario:** (1) Sistema de diseño + refactor progresivo. (2) Charts reusando el `ChartComponent` actual (Chart.js).

## Diagnóstico

Los tokens de marca ya existen en `tailwind.config.js` (`primary` teal `#0E7C86`, `secondary`, `success/warning/danger`, `fontSize` semántico `display/headline/title/body/small/caption`, `shadow-card/-md/-lg`) **pero no se usan**: `ButtonComponent` y la mayoría de pantallas pintan `sky-*`, `rounded-xl` y sombras ad-hoc. Además varios botones (Nuevo paciente, Nuevo tratamiento, footers Cancelar/Guardar) son `<button>`/`<a>` crudos que **no pasan por `ButtonComponent`**, de ahí la inconsistencia de tamaño y alineación.

**Causa raíz:** sistema de diseño definido, sin adoptar. El fix no es inventar estilos nuevos, es **adoptar los tokens y centralizar los controles**.

## Principios

1. **Un token, un lugar.** Color de marca = `primary-*` (no `sky-*`). Sombra = `shadow-card`. Texto = escala semántica. Nada ad-hoc nuevo.
2. **Un control, un componente.** Todo botón pasa por `ButtonComponent`; todo footer de formulario por `FormFooter`. Cero `<button>` de acción con Tailwind crudo en features.
3. **Densidad desktop.** Escala compacta; acción primaria `md`, acciones de fila/secundarias `sm`.
4. **Reusar antes de construir.** EPS buscable = PrimeNG `p-select [filter]` (ya está Aura configurado), no un combobox nuevo. Tabla de tratamientos = tabla Tailwind de la casa + filtro por signal.
5. **Accesibilidad intacta:** `focus-visible`, `<label for>`/`aria-label`, contraste. (Excepción táctil 40px solo donde el usuario pidió compacto desktop, ya aplicada en examen-ingreso.)

## Componentes compartidos

### `ButtonComponent` (ajuste, no reescritura)
- Variantes a tokens: `primary` → `bg-primary-600 hover:bg-primary-700`; `secondary` → `bg-white text-primary-700 border-primary-300`; `ghost` igual; **+`danger`** → `bg-danger-600`. `focus:ring-primary-500`.
- Radio `rounded-lg` (no `xl`). Escala compacta: `sm text-xs px-2.5 py-1`, `md text-sm px-3.5 py-1.5`, `lg text-sm px-4 py-2`.
- Migrar `@Input()` → `input()` signals (regla change-detection), sin cambiar la API pública.

### `FormFooter` (nuevo, `shared/components/form-footer/`)
- Layout único Cancelar/Guardar: desktop `flex justify-end gap-3`, móvil `flex-col-reverse` full-width.
- Inputs: `saving` (deshabilita y spinner en Guardar), `submitLabel='Guardar'`, `cancelLabel='Cancelar'`, `submitType='submit'`. Output `(cancelar)`. Usa `ButtonComponent` dentro.
- Reemplaza los footers de: pacientes/formulario, tratamientos (modal), perfil, evoluciones, examen-ingreso.

## Pantallas

- **Recordatorios** `recordatorios.html:77`: "Volver a enviar" → `app-button variant=secondary size=sm`.
- **Pacientes** `pacientes.html:17`: "Nuevo paciente" → `app-button size=sm` (icono + texto), visible también en móvil.
- **Tratamientos** `tratamientos.html:10`: "Nuevo tratamiento" → `app-button size=sm`. Catálogo `tratamientos.html:38-82`: cards → **tabla** (`<table>` Tailwind: columnas Nombre, Categoría/precio según modelo, Acciones) + **buscador** (input con signal `filtro` + `computed` que filtra la lista; sin tocar el servicio). Vacío/skeleton se conservan.
- **Selector EPS** `formulario.html:173`: `<select>` nativo → PrimeNG `p-select` con `[filter]="true"` sobre `epsList()`, bind a `eps_id`, placeholder y `filterPlaceholder`. Mantiene validación del form.
- **Reportes** `reportes.*`: tematizar `ChartComponent`/configs con la paleta de tokens (primary/secondary/success/warning), `responsive:true`, `maintainAspectRatio:false`, leyenda y tooltip con tipografía Inter. Aplicar guía `dataviz` (colores accesibles, un sistema).

## Fases (cada una: gate verde + commit + revisión)

- **F1 — Fundamentos:** `ButtonComponent` a tokens/compacto + `FormFooter` nuevo (+spec). Migrar un footer piloto (pacientes/formulario) para validar.
- **F2 — Botones puntuales:** Recordatorios, Nuevo paciente, Nuevo tratamiento; resto de footers a `FormFooter`.
- **F3 — EPS buscable** (PrimeNG p-select).
- **F4 — Tratamientos tabla + buscador.**
- **F5 — Reportes charts tematizados.**
- **F6 — Barrido `sky-*`→`primary-*`** y botones crudos restantes (relevador localiza, cliente-web migra).

## Fuera de alcance

- Cambios de lógica/negocio o datos (solo presentación).
- Migrar a una librería de componentes completa (seguimos Tailwind de la casa + PrimeNG puntual).
- Dark mode, i18n, animaciones nuevas.

## Gates
`npx tsc --noEmit -p tsconfig.app.json` · `npm run build` · `npm test -- --watch=false` · `node tools/agentes/sincronizar.mjs --check`
