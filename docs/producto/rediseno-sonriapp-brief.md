# Rediseño SonriApp v2.0 — Brief maestro UI/UX

> Fuente: encargo del usuario (2026-11-25). Norte de todas las fases de rediseño. No cambia lógica de negocio, modelo de datos ni RLS. Cada fase = un plan (`gestion/`). Odontograma: solo mejoras aditivas, esquema SVG intacto (ver `.claude/rules/clinica/odontograma.md`).

## 0. Reglas de trabajo
1. Explorar repo antes de codificar; respetar arquitectura (standalone, signals, OnPush).
2. Trabajar por fases; al cerrar cada una: compila, lint/tests, revisar en 1366×768 / 1920×1080 / 390×844, resumen de archivos. No avanzar con build roto.
3. No cambiar nombres de tablas/columnas/contratos. KPIs nuevos = consulta/vista/RPC aditiva documentada; si falta, calcular en cliente con TODO.
4. Sin emojis en UI. Una sola librería de iconos de línea → **Lucide** (`lucide-angular`, instalada).
5. Español (Colombia). Fechas "martes, 24 de noviembre de 2026" (preposiciones minúscula). COP "$ 120.000". Zona **America/Bogota** siempre. Tildes correctas (Moisés, Hipertensión).
6. Accesibilidad WCAG AA: texto ≥12px (cuerpo 14px), foco visible, aria-label en botones solo-icono, táctil ≥40px, teclado en modales/tablas/odontograma.
7. Acción destructiva → ConfirmDialog; preferir archivar/desactivar a borrar si hay relaciones.
8. Datos clínicos sensibles: cero PII en logs/analítica; conservar auditoría.

## 1. Correcciones críticas (Fase 0)
- **BUG agenda:** "hoy" resalta 25 cuando es 24 (desfase UTC vs America/Bogota). Utilidad central de fechas en America/Bogota usada en inicio, agenda, recordatorios, reportes. Tests de cambio de día cerca de medianoche (UTC-5).
- **BUG modal Nueva cita:** aviso de conflicto aparece al abrir. Debe evaluarse solo con paciente+fecha+hora válidos y ofrecer horarios libres en un clic.
- **Historia clínica:** antecedentes NO preseleccionados en "No". Inicial = sin respuesta; control Sí/No/No sabe. Quitar "Todos Sí".
- **Detalle paciente:** alerta alergia roja con "N/A" → chip neutro "Sin alergias registradas"; rojo solo con alergia real.
- Emojis → iconos de línea. Corregir capitalización y tildes.

## 2. Sistema de diseño
- Inter. Escala 12/14/16/20/24/32. Pesos 400/500/600.
- **Primario azul #0284C7 (primary-600)**, escala 50–900. **Acento teal #14B8A6**. Neutros slate (texto #0F172A, secundario #475569 — nunca más claro que #64748B sobre blanco, fondo #F8FAFC, superficie #FFFFFF, borde #E2E8F0).
- Semánticos: success #16A34A, warning #D97706, danger #DC2626, info #0284C7.
- **Estados de cita (mapa único estado→color/ícono/etiqueta):** Pendiente=ámbar, Confirmada=azul, En atención=violeta #7C3AED, Atendida=verde, Cancelada=gris, No asistió=rojo.
- Radios 12 (tarjetas) / 8 (inputs, botones) / pill (badges). Sombras sutiles. Espaciado 4/8. Variables para dark mode (no obligatorio en 1ª entrega).
- Carpeta UI compartida: AppShell, SidebarNav, Topbar, GlobalSearch (Ctrl/⌘+K), PageHeader, KpiCard (valor, delta %, sparkline, tooltip), StatusBadge, AlertChip, Avatar, DataTable, FilterBar, EmptyState, Skeleton, ConfirmDialog, Drawer, Modal, Toast, SegmentedControl, DateTimePicker, TimeSlotChips, PatientSearchSelect, Timeline, ProgressStepper, AutosaveIndicator, ChartCard.
- Gráficos: reusar el existente → **Chart.js** (ya instalado), colores de la paleta.

## 3. Layout global
- **Sidebar** agrupado, colapsable (260/72), un botón de colapso. Grupos: Operación (Inicio, Agenda, Recordatorios) · Clínica (Pacientes, Historias clínicas, Plantillas*) · Gestión (Tratamientos, Reportes, Finanzas/Cobros si existe). Pie: consultorio activo + versión. "Mi perfil" → menú del avatar (Mi perfil, Configuración, Cerrar sesión). (*aclarar nombre real de "Plantillas").
- **Topbar:** breadcrumb (sin título duplicado), búsqueda global (pacientes/citas/tratamientos), botón "+ Nueva cita", campana (punto rojo solo si hay no leídas), avatar con menú.
- Contenedor único: max-w-7xl, padding 24–32px, mismo PageHeader en todas. Sin diferencias de ancho/alineación.
- Responsive: móvil → bottom-nav (Inicio, Agenda, Pacientes, Más); tablas → tarjetas; modales → bottom sheets.

## 4. Pantallas
(Especificación detallada por pantalla — ver secciones 4.1–4.10 del encargo original. Resumen de puntos clave:)
- **4.1 Inicio:** saludo+fecha correcta, selector periodo; héroe "Siguiente paciente" con alertas y acciones; fila de KpiCards con delta+sparkline (Citas hoy, Ocupación semanal, Ingresos mes vs anterior, Cartera, Confirmación, Inasistencia, Nuevos, Inactivos >6m, Ticket promedio); "Agenda de hoy" timeline; panel "Requiere atención"; gráficos (ingresos 6m barras, citas por estado dona, top 5 tratamientos); reemplazar tarjeta "Reportes" por gráficos.
- **4.2 Agenda:** Día/Semana/Mes/Lista; bloques proporcionales por duración y color por estado; línea de hora actual; granularidad 30min; clic celda→modal precargado; drag&drop reprogramar con confirmación; Drawer de detalle; panel lateral (mini calendario, resumen, leyenda, filtros).
- **4.3 Modal Nueva cita:** orden Paciente→Tratamiento(autollena duración/valor)→Fecha/hora→Duración(chips 15/30/45/60/90)→Notas; chips de horarios libres; conflicto ámbar solo cuando aplique + "Ver horarios libres"/"sobrecupo"; Estado/Canal en "Opciones avanzadas"; recordatorio WhatsApp on por defecto; resumen antes de guardar; botón con loading y tooltip de qué falta.
- **4.4 Recordatorios:** KPIs (Enviados, Confirmados, Sin respuesta, Fallidos, Tasa); tabs Próximos/Enviados/Sin respuesta/Fallidos agrupados por día; fila con paciente/hora/canal/plantilla/envío/respuesta/acción (Reenviar solo si sin respuesta o fallido); panel Automatización (reglas 24h/2h, plantilla, preview).
- **4.5 Pacientes:** PageHeader con contador + mini-KPIs; búsqueda + chips filtro + orden; tabla (avatar/nombre/edad, documento, teléfono, próxima, última, saldo, alertas, acciones ⋯); fila clicable; paginación; vacío con CTA; tarjetas en móvil. Corregir encabezado "Última cita".
- **4.6 Detalle paciente:** cabecera compacta horizontal (sin banner degradado) con acciones; banda de alertas solo con datos reales (si no, chips neutros); pestañas con contadores (Resumen por defecto, Información, Citas, Presupuestos, Pagos, Consentimientos, Comunicación); tarjetas editables; sección Acudiente si menor.
- **4.7 Historia clínica:** cabecera sticky + AutosaveIndicator; stepper con progreso e incompletos; antecedentes por sistema en tarjetas plegables, SegmentedControl Sí/No/No sabe (≥36px) sin default, "Sí"→observación obligatoria + alerta médica; respetar inmutabilidad/auditoría de evoluciones firmadas; sin emojis; quitar pill "HISTORIA CLÍNICA" e insignia numérica.
- **4.8 Odontograma:** CONSERVAR numeración FDI, cuadrantes, temporal 51–85, esquema circular 3 zonas, lógica/datos/zonas SVG. AGREGAR: barra de herramientas (hallazgos con color+icono+atajo), leyenda + conmutador Hallazgos/Realizado (rojo=por tratar, azul=realizado — **confirmar convención**), estados hover/selec/foco + tooltip, panel lateral del diente, dentición automática por edad, zoom claro + táctil ≥40px, números ≥12px, resumen COP/ceo + comparación con visita anterior, deshacer/rehacer + autoguardado.
- **4.9 Tratamientos:** KPIs; alternar tarjetas/tabla (nombre, categoría, CUPS, duración, precio, color, estado, veces realizado 90d); búsqueda/filtros/orden; acciones editar/duplicar/desactivar (borrar solo si nunca usado); formulario en Drawer; vacío con importar comunes.
- **4.10 Reportes:** página con ingresos por mes/tratamiento, cartera por antigüedad, productividad día/hora, retención/reactivación, citas por estado, conversión presupuestos; exportar PDF/Excel; filtros por rango.

## 5. Transversales
- Toda lista/tabla/gráfico: skeleton, EmptyState con CTA, error+reintentar. Toasts éxito/error; ConfirmDialog destructivas; micro-transiciones 150–200ms (respetar prefers-reduced-motion). Atajos: Ctrl/⌘+K búsqueda, N nueva cita, T hoy en agenda.

## 6. Criterios de aceptación
- Inicio y agenda muestran el mismo "hoy" en America/Bogota, incluso 19:00–23:59.
- Ningún texto <12px ni contraste <4.5:1 en texto normal.
- Todas las páginas usan AppShell, PageHeader, mismo ancho/márgenes.
- Sin emojis; sin botones solo-icono sin aria-label.
- HC: ninguna pregunta preseleccionada; "Sí" crea alerta médica.
- Odontograma: SVG/numeración/zonas intactos; solo añadidos; datos guardados idénticos.
- Sin pérdida de funciones (WhatsApp, RIPS, CIE-10/CUPS, DIAN, super admin).
- Build/lint/tests pasan; sin errores de consola; Lighthouse a11y ≥90 en pantallas principales.

## 7. Fases
- **F0:** correcciones críticas (§1).
- **F1:** tokens, AppShell, Sidebar, Topbar, PageHeader, componentes UI base.
- **F2:** Inicio, Agenda + modal Nueva cita, Pacientes + Detalle.
- **F3:** Historia clínica + mejoras odontograma.
- **F4:** Recordatorios, Tratamientos, Reportes, dark mode, pulido móvil.
