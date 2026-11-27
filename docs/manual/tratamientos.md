# Tratamientos

**Pantalla:** `Tratamientos` (menú lateral) · ruta `/tratamientos`
**Para:** odontólogo

## Qué hace

Es el catálogo de tratamientos del consultorio. Desde aquí los creas, editas, activas/desactivas y eliminas. Los tratamientos activos alimentan el autocompletado de duración al agendar una cita y la carga de ítems en presupuestos.

## Qué muestra

- **Indicadores (arriba):** Total de tratamientos, Activos, Precio promedio y Duración promedio del catálogo.
- **Buscador y filtro:** busca por nombre o descripción; el filtro **Todos / Activos / Inactivos** acota la lista.
- **Tabla (escritorio):** columnas Nombre, Descripción, Precio, Duración y Estado, ordenables por Nombre, Precio y Duración. En móvil se ve como tarjetas compactas.
- **Acciones por fila:** Editar, Activar/Desactivar y Eliminar.

## Acciones

- **Nuevo tratamiento / Editar:** abre un formulario con nombre (obligatorio), descripción, precio, duración en minutos (mínimo 5) y **código de procedimiento CUPS** (opcional). El CUPS se elige con un buscador por código o descripción; al seleccionarlo queda asociado al tratamiento. No guarda si hay errores de validación.
- **Activar/Desactivar:** cambia el estado al instante (reversible). Un tratamiento inactivo deja de ofrecerse al agendar o presupuestar, pero no se borra.
- **Eliminar:** pide confirmación. El borrado es definitivo; si el tratamiento ya está referenciado en un presupuesto, la operación puede rechazarse.

## Notas

- Los precios se muestran en pesos colombianos sin decimales.
- La relación de una cita con su tratamiento es por nombre: renombrar un tratamiento no cambia las citas ya registradas con el nombre anterior.
- El código CUPS es opcional y se valida contra el catálogo oficial; sirve para facturación/RIPS. La columna CUPS aparece en la tabla (escritorio) y en la tarjeta (móvil).
- "Tratamiento más usado" y estadísticas de uso llegarán en una entrega posterior.

_Última actualización: 2026-11-27._
