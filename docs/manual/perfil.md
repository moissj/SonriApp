# Mi perfil

**Pantalla:** `Mi perfil` (menú lateral / cuenta) · ruta `/perfil`
**Para:** odontólogo

## Qué hace

Administra la información de tu consultorio y tu cuenta: nombre, logo, datos del consultorio, **datos fiscales del prestador** y horarios de atención.

## Secciones

1. **Cabecera (logo):** muestra tu nombre, consultorio y correo. **Cambiar logo** sube una imagen que aparece en la app.
2. **Datos del consultorio:** nombre completo y nombre del consultorio (obligatorios), y demás datos de contacto.
3. **Datos del prestador (facturación):** información que se usará para RIPS y factura electrónica.
   - **NIT:** número de identificación tributaria del prestador. Numérico de 6 a 10 dígitos, con dígito de verificación opcional (ej. `900123456-7`).
   - **Código de habilitación REPS:** código del Registro Especial de Prestadores de Servicios de Salud. Solo dígitos (8 a 12).
   - **Razón social:** nombre legal del prestador (máximo 200 caracteres).
   - Los tres campos son **opcionales por ahora**; se vuelven necesarios al emitir factura/RIPS (módulo posterior).
4. **Horarios y citas:** hora de apertura/cierre y parámetros de agenda.

## Cómo usarla

1. Abre **Mi perfil**.
2. Edita los campos que necesites. Si un dato no cumple el formato, verás el mensaje de ayuda bajo el campo.
3. Pulsa **Guardar**. El botón se deshabilita mientras guarda; al terminar verás confirmación (o un error si algo falla).

## Notas

- Los datos del prestador son **tuyos** (de tu consultorio) y solo tú los ves y editas.
- El formato de NIT/REPS es una validación de ayuda; la verificación oficial contra DIAN/REPS se hará en el módulo de facturación.

_Última actualización: 2026-11-24._
