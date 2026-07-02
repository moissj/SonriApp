# Especificación de Diseño: Autocompletado de Pacientes, Solapamiento y Tiempo Real en Citas

Este documento detalla el diseño de las nuevas capacidades para el módulo de Citas, incluyendo la validación de solapamiento en el frontend, autocompletado reutilizable con creación inline de pacientes, menú de acciones rápidas y sincronización en tiempo real vía Supabase Realtime.

---

## 1. Componente Reutilizable: `PatientAutocompleteComponent`
* **Uso**: Selector de pacientes construido a mano para ser reutilizado en cualquier parte de la aplicación.
* **Características**:
  - Buscador reactivo de pacientes por nombre o documento (`debounceTime(300)`).
  - Listado de resultados interactivo.
  - Opción inline "+ Crear Paciente Nuevo" cuando no existen coincidencias o se desea registrar uno rápido.
  - El formulario inline requiere: Nombre completo, Tipo de documento (CC, TI, CE, PA), Número de documento y Teléfono.
  - Guarda el paciente creado en Supabase y lo selecciona automáticamente en el formulario.
* **Eventos**:
  - `pacienteSeleccionado = output<Patient>()`

---

## 2. Validación de Solapamiento de Horarios
* **Lógica**:
  - Al cambiar la fecha, hora o duración de la cita, se ejecutará una validación en background contra la tabla `citas`.
  - Rango a validar: `[fecha_hora_inicio, fecha_hora_inicio + duracion_minutos]`.
  - Consulta Supabase:
    ```sql
    select * from citas 
    where odontologo_id = :odontologo_id 
      and id != :cita_id -- excluir cita actual si estamos editando
      and estado not in ('cancelada')
      and (
        (fecha_hora <= :nueva_fecha_hora_fin and fecha_hora + (duracion_minutos * interval '1 minute') >= :nueva_fecha_hora_inicio)
      )
    ```
  - Si existen coincidencias, se muestra una alerta preventiva usando `AlertComponent` indicando: "Existe otra cita agendada en este horario para el paciente [Nombre]".
  - Esta alerta es informativa y no bloqueará el botón de guardar.

---

## 3. Menú de Acciones Rápidas ("Bottom Sheet") para Detalle de Cita
* **UI**:
  - En móviles: Se mostrará un menú tipo "bottom-sheet" que se desliza desde abajo.
  - En desktop: Se mostrará un dropdown flotante al lado de la cita.
  - Construido a mano con Angular y clases de Tailwind CSS (sin dependencias).
* **Acciones**:
  - **Confirmar**: Cambia el estado a `'confirmada'`.
  - **Atendida**: Cambia el estado a `'atendida'`.
  - **No Asistió**: Cambia el estado a `'no_asistio'`.
  - **Cancelar**: Abre confirmación y cambia el estado a `'cancelada'`.
* **Optimistic Update**:
  - El estado local en la interfaz se actualiza inmediatamente (efecto visual instantáneo).
  - Si el guardado en Supabase falla, se hace rollback al estado original de la cita y se muestra una alerta.

---

## 4. Sincronización en Tiempo Real (Supabase Realtime)
* **Suscripción**:
  - En `CitasComponent`, al iniciar, se suscribe al canal de cambios de la tabla `citas` filtrando por el `odontologo_id` actual.
  - Escucha eventos `INSERT`, `UPDATE` y `DELETE`.
  - Al recibir cualquier cambio, se dispara de forma automática la recarga de las citas en pantalla sin recargar la página.
