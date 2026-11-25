# Detalle del paciente

**Pantalla:** ficha del paciente · ruta `/pacientes/:id`
**Para:** odontólogo
**revisado:** 2026-11-25

## Qué muestra

- **Cabecera:** avatar, nombre, tipo y número de documento, edad (si hay fecha de nacimiento) y acciones: Volver, Llamar, WhatsApp (con teléfono), Editar y Eliminar (con confirmación).
- **Alertas:** etiquetas visibles solo si existen datos reales: **Alergia** (en rojo) y **Antecedentes** médicos (en ámbar). Si no hay ninguno, no aparece la franja.
- **Ver historia clínica:** acceso a la historia clínica completa.
- **Pestañas:**
  - **Información:** datos personales, EPS, antecedentes y observaciones.
  - **Citas** (con contador): tratamiento, fecha y hora de Colombia, duración y estado (Pendiente, Confirmada, En atención, Atendida, Cancelada, No asistió).
  - **Presupuestos, Pagos, Consentimientos:** contenido de cada módulo.
  - **Comunicación** (con contador): historial de mensajes de WhatsApp enviados.
