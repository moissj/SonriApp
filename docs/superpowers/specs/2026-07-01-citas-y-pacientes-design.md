# Especificación de Diseño: Gestión de Pacientes (Detalle/Formulario) y Agenda de Citas (Fase 3)

Este documento detalla la arquitectura, el flujo de datos y el diseño de componentes para completar el módulo de **Pacientes** y desarrollar la **Fase 3: Agenda y Citas** de SonriAppV2.

---

## 1. Arquitectura de Base de Datos y Modelos

### 1.1 Tabla `pacientes`
* **id**: `uuid` (Primary Key)
* **odontologo_id**: `uuid` (Foreign Key -> `profiles.id`)
* **nombre_completo**: `text`
* **tipo_documento**: `tipo_documento_enum` (`'CC'`, `'TI'`, `'CE'`, `'PA'`)
* **numero_documento**: `text`
* **telefono**: `text` (Formato: `+57XXXXXXXXXX`)
* **email**: `text` (Opcional)
* **fecha_nacimiento**: `date`
* **ciudad**: `text`
* **departamento**: `text`
* **direccion**: `text`
* **antecedentes_medicos**: `text` (Opcional)
* **alergias**: `text` (Opcional)
* **afiliacion_salud**: `text` (Opcional)
* **notas_generales**: `text` (Opcional)

### 1.2 Tabla `citas`
* **id**: `uuid` (Primary Key)
* **odontologo_id**: `uuid` (Foreign Key -> `profiles.id`)
* **paciente_id**: `uuid` (Foreign Key -> `pacientes.id`)
* **fecha_hora**: `timestamp with time zone` (Fecha y hora de inicio de la cita)
* **duracion_minutos**: `integer` (Por defecto heredado del consultorio)
* **tipo_tratamiento**: `text`
* **estado**: `estado_cita_enum` (`'pendiente'`, `'confirmada'`, `'atendida'`, `'cancelada'`, `'no_asistio'`)
* **notas**: `text` (Opcional)
* **canal_origen**: `canal_origen_enum` (`'manual'`, `'whatsapp'`, `'portal'`)

---

## 2. Componentes Reutilizables (`/shared/components`)

### 2.1 `ConfirmModalComponent` (Modal de Confirmación)
* **Uso**: Ventana modal nativa usando la etiqueta `<dialog>` para confirmar acciones destructivas (como eliminar un paciente o cancelar una cita).
* **Entradas (`@Input` / Signal inputs)**:
  - `title: string` (ej. "Eliminar Paciente")
  - `message: string` (ej. "¿Estás seguro de eliminar este paciente?")
  - `confirmText: string` (ej. "Eliminar")
  - `cancelText: string` (ej. "Cancelar")
* **Salidas (`@Output` / Signal outputs)**:
  - `confirm: void`
  - `cancel: void`

### 2.2 `StatusBadgeComponent` (Etiqueta de Estado de Cita)
* **Uso**: Mostrar de forma visual el estado de la cita con colores de Tailwind uniformes.
* **Mapeo de colores**:
  - `'pendiente'` -> Amarillo (`bg-yellow-50 text-yellow-800 border-yellow-200`)
  - `'confirmada'` -> Azul (`bg-blue-50 text-blue-800 border-blue-200`)
  - `'atendida'` -> Verde (`bg-green-50 text-green-800 border-green-200`)
  - `'cancelada'` / `'no_asistio'` -> Rojo (`bg-red-50 text-red-800 border-red-200`)

---

## 3. Módulo de Pacientes (Alta/Edición y Ficha de Detalle)

### 3.1 Formulario de Paciente
* **Lógica (`formulario.ts`)**:
  - Reactive Forms con validaciones estrictas en español.
  - Validación del teléfono celular: 10 dígitos. El sistema antepondrá el prefijo `+57` de manera automática antes de enviar los datos a Supabase.
* **Layout**: Formulario en grid adaptable, organizado por secciones (Información básica, Datos de contacto, Datos médicos).

### 3.2 Ficha de Paciente (Detalle)
* **Encabezado**: Nombre, documento, teléfono y botón flotante de WhatsApp.
* **Pestañas Responsivas**:
  - **Mobile**: Menú de pestañas fijado en la parte inferior del dispositivo.
  - **Desktop**: Diseño de dos columnas. Columna izquierda fija (datos rápidos) y columna derecha con scroll (pestañas de Datos Generales, Historial de Citas e Historia Clínica).
* **Confirmación de eliminación**: Llama a `ConfirmModalComponent` antes de proceder con el borrado en Supabase.

---

## 4. Módulo de Citas y Agenda (Fase 3)

### 4.1 Vista de Agenda (`/features/citas`)
* **Lógica de fechas**:
  - Selector de fecha nativo (`input type="date"`) con estilos Tailwind.
  - Al cambiar la fecha, se consulta Supabase en tiempo real filtrando por un rango de fechas.
* **Vista Móvil (Mobile-first)**:
  - Lista de citas ordenada cronológicamente y agrupada en tres secciones deslizables: **Hoy**, **Mañana** y **Esta Semana**.
* **Vista Escritorio (Desktop-first)**:
  - Grid de calendario semanal estructurado en columnas (Lunes a Domingo) y filas correspondientes a franjas horarias configurables (ej. 8:00 AM a 7:00 PM).
  - Celdas con las citas posicionadas absolutamente de acuerdo a la hora de inicio y duración.
  - Las franjas vacías serán clicables para abrir directamente el creador de citas.

### 4.2 Modal de Citas (`CitaModalComponent`)
* **Lógica**:
  - Se abre con el elemento `<dialog>` nativo.
  - **Buscador de Pacientes**: Autocomplete/Buscador reactivo usando RxJS `debounceTime` sobre la tabla `pacientes`.
  - Duración por defecto cargada desde el perfil del odontólogo.
  - Guarda los cambios en Supabase y emite un evento de recarga a la agenda.

---

## 5. Pruebas y Validación de Calidad
1. **Validación de Formularios**: Verificar que los campos requeridos muestren errores en rojo.
2. **Validación de Zona Horaria**: Validar que la fecha y hora de las citas se guarde y muestre correctamente según la hora local de Colombia.
3. **Validación de Responsividad**: Probar el comportamiento de los layouts en resoluciones móviles y de escritorio.
