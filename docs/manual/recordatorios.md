# Recordatorios de WhatsApp

**Pantalla:** `Recordatorios` (menú lateral y hoja "Más" en móvil) · ruta `/recordatorios`
**Para:** odontólogo

## Qué hace

Lista las **citas de los próximos 7 días** (zona horaria de Colombia) **agrupadas por día**, para que avises a cada paciente por WhatsApp. Por cada día ves dos grupos:

- **Pendientes:** citas que **aún no tienen recordatorio enviado**.
- **Enviados:** citas a las que **ya les enviaste** el recordatorio, con la hora del último envío.

Una cita entra en la lista si es de los próximos 7 días y su estado es `pendiente` o `confirmada` (no cancelada, atendida ni inasistencia).

## Cómo usarla

1. Abre **Recordatorios**. Verás las citas por día: nombre del paciente, hora y teléfono.
2. **Una cita:** pulsa **Enviar recordatorio**. Se abre WhatsApp con el mensaje de la plantilla `recordatorio` ya escrito (nombre, fecha, hora y consultorio rellenados). Envíalo como de costumbre. La cita pasa al grupo **Enviados** con la hora del envío.
3. **Todo un día:** pulsa **Enviar todos (N)** en el encabezado del día. Confirma que **se abrirán N pestañas** (una por paciente pendiente con teléfono) y envía cada una desde WhatsApp.
4. **Reenviar:** en el grupo **Enviados**, pulsa **Volver a enviar** para avisar otra vez (queda registrado como un envío nuevo).

## Notas

- **Permitir ventanas emergentes:** "Enviar todos" abre varias pestañas a la vez. El navegador solo las abre si **permites ventanas emergentes (pop-ups)** para este sitio; si no, abrirá solo la primera. La primera vez verás un aviso recordándotelo. Permite los pop-ups del sitio una vez y listo.
- Si el paciente **no tiene teléfono**, el botón aparece deshabilitado y esa cita **no cuenta** en el total "Enviar todos (N)". Agrega el teléfono en la ficha del paciente.
- El texto del recordatorio se edita en **Plantillas de mensajes** (plantilla `recordatorio`).
- Es un envío **manual asistido**: la app prepara el mensaje y abre WhatsApp, pero el envío lo confirmas tú. No envía nada automáticamente.
- Si no hay citas en los próximos 7 días, verás el estado vacío correspondiente.

_Última actualización: 2026-11-24._
