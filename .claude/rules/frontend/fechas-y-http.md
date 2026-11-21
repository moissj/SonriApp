---
paths:
  - "src/app/**/*.ts"
---
# Fechas, zona horaria y capa HTTP
- Almacena y manipula fechas de negocio sin hora como `YYYY-MM-DD` (o `YYYY-MM-DDT12:00:00Z` al convertir a `Date`), **nunca medianoche local** (`new Date('YYYY-MM-DD')` se interpreta en UTC y resta 1 día en `America/Bogota`).
- Formatea fechas y horas de consulta para el usuario en zona **`America/Bogota`** y formato colombiano.
- Calcula edad desde la fecha de nacimiento en una función pura compartida (nunca duplicada por componente).
- La autenticación, manejo de sesión y verificación de cuenta activa residen únicamente en `AuthService` y guards/interceptores dedicados.
**Por qué:** `formulario.ts`, `detalle.ts` y `historia-clinica.ts` duplican `new Date(birthdate)`, con riesgo de desfase de 1 día en cumpleaños en UTC-5.

