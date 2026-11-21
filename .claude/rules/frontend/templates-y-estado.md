---
paths:
  - "src/app/**/*.html"
  - "src/app/**/*.ts"
---
# Templates y estado reactivo
- Prohibido usar getters en componentes que devuelvan arrays u objetos nuevos en cada ciclo de template; reemplázalos con `computed()`.
- Todo `@for` lleva `track` por identificador estable (nunca por índice si la lista es mutable o reordenable).
- Deshabilita botones de envío (`[disabled]="saving()"`) mientras una petición HTTP/Supabase está en vuelo para evitar dobles inserciones.
- Libera toda suscripción RxJS (`takeUntilDestroyed`) y canales Supabase Realtime al destruir el componente o servicio.
**Por qué:** `ChecklistItemComponent.opciones` hoy es un getter que crea un arreglo nuevo por cada evaluación del template.

