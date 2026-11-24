# Diseño — Recordatorios mejorados (por día, enviados, enviar todos)

> **Fecha:** 2026-11-24 · **Estado:** aprobado (brainstorming). · **Base:** módulo `features/recordatorios/` (Plan 15) + `WhatsappService` (click-to-chat `wa.me`, registro en `mensajes_enviados`).

## 1. Objetivo y alcance

Mejorar el módulo de recordatorios para que el odontólogo:
- vea las citas **agrupadas por día** (próximos 7 días con citas), con su estado de recordatorio;
- vea los recordatorios **ya enviados**, con opción de **volver a enviar**;
- use **"Enviar todos (N)"** por día, que abre una pestaña `wa.me` por cada pendiente.

**Fuera de alcance (YAGNI):** envío automático/programado (sigue siendo click-to-chat manual), API oficial de WhatsApp Business, plantilla distinta por reintento, recordatorios de tipos distintos a `recordatorio`, migración o tabla nueva.

## 2. Decisiones

- **Volver a enviar registra un nuevo envío** en `mensajes_enviados` (auditoría veraz de cada envío; coherente con `WhatsappService.enviar()`, que registra siempre).
- **Ventana:** próximos **7 días** con citas, agrupados por fecha (`America/Bogota`).
- **Sin cambios de BD:** se reutiliza `mensajes_enviados` (ya tiene `cita_id`, `tipo_plantilla`, `created_at`). No hay migración.

## 3. Mecánica WhatsApp (sin cambios de fondo)

- Reusa `WhatsappService.enviar()` → `window.open(wa.me, '_blank', 'noopener')` **dentro del gesto del clic** (evita bloqueo de pop-up) + registro en `mensajes_enviados`.
- "Volver a enviar" = mismo `enviar()` (abre pestaña + registra otro envío).
- **"Enviar todos" y pop-ups:** en un clic se invoca `window.open` N veces. El navegador solo abre varias si el usuario **permite pop-ups** para el sitio; si no, bloquea las extra (política del navegador, inevadible). Aviso visible la 1ª vez. Cita sin teléfono → deshabilitada, no cuenta en N. Antes de abrir: confirmación "se abrirán N pestañas".

## 4. Capa de datos (service)

`RecordatorioService`:
- Reemplaza `getPendientes()` (solo mañana) por `getRecordatoriosRango(desde: Date, dias = 7): Promise<DiaRecordatorios[]>`:
  - trae las citas del rango (`CitaService.getCitas(inicio, fin)`);
  - trae de `mensajes_enviados` los `tipo_plantilla='recordatorio'` de esas citas (filtrado `odontologo_id = user.id`), con su `created_at` más reciente por `cita_id`;
  - agrupa por día y separa pendientes/enviados.
- Siempre informa el `error` de Supabase (nunca `[]` silencioso que oculte un fallo).

**Tipos:**
```
interface CitaRecordatorio { cita: Cita; ultimoEnvio: string | null; }  // ultimoEnvio ISO o null
interface DiaRecordatorios { fecha: string; pendientes: CitaRecordatorio[]; enviados: CitaRecordatorio[]; }
```

## 5. Funciones puras (con specs)

- `funciones/agrupar-por-dia.funcion.ts`: `agruparPorDia(citas: Cita[], enviadosPorCita: Map<string,string>): DiaRecordatorios[]` — agrupa por fecha local (`America/Bogota`, clave `YYYY-MM-DD`), ordena días asc y citas por hora; separa enviado (está en el map) / pendiente; `ultimoEnvio` = valor del map. Determinista y testeable.
- Se conservan/ajustan `funciones/pendientes.funcion.ts` y `ventana-manana.funcion.ts` según se reutilicen; si `ventana-manana` deja de usarse, se elimina con su spec (sin código muerto).

## 6. Frontend (Angular standalone, OnPush, signals)

- Reshape `recordatorios.ts` + `.html`:
  - signals: `dias` (`DiaRecordatorios[]`), `cargando`, `error`, `enviandoId`, `avisoPopup`.
  - Render: por cada día, encabezado de fecha + subgrupo **Pendientes** (botón Enviar por cita + "Enviar todos (N)") y subgrupo **Enviados** (hora cita, paciente, hora último envío, badge, "Volver a enviar").
  - `enviarTodos(dia)`: confirma N → itera pendientes llamando `whatsapp.enviar()` en el mismo gesto (sin `await` previo al primer `window.open`); muestra aviso de pop-ups.
  - Error de carga → estado de error (nunca "sin registros"). Botones deshabilitados durante envío. `@for` con `track` por `cita.id`.
- Accesibilidad: objetivos táctiles ≥40×40, `aria-label`/`<label>`, foco visible, confirmación antes de enviar en lote. Fechas `America/Bogota`.

## 7. Archivos

- **Modificar:** `src/app/features/recordatorios/recordatorios.ts`, `recordatorios.html`, `services/recordatorio.service.ts`.
- **Crear:** `src/app/features/recordatorios/funciones/agrupar-por-dia.funcion.ts` (+ `.spec.ts`).
- **Posible baja:** `funciones/pendientes.funcion.ts` / `ventana-manana.funcion.ts` si quedan sin uso (quitar con su spec).
- **Sin migración.**

## 8. Casos de prueba

- `agrupar-por-dia.spec.ts`: agrupa 2 días; separa enviado/pendiente por presencia en el map; `ultimoEnvio` correcto; orden por hora; límite de 7 días; zona `America/Bogota` sin desfase (cita 00:30 local no se corre de día).
- Servicio (lógica de mapeo si se extrae a función pura): último envío por cita = `max(created_at)`.
- UI: sin teléfono → deshabilitado y excluido de N; error de carga → estado de error.
