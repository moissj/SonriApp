---
paths:
  - "src/**/*.spec.ts"
  - "tools/**/tests/**"
  - "supabase/tests/**"
---
# Estrategia de pruebas por módulo y RLS
- Toda función pura (`*.funcion.ts`) y script (`tools/**/*.mjs`) incluye pruebas automatizadas con casos borde (`null` / «no evaluado», fechas límite, cálculo de edad en cumpleaños, validación de documento).
- Todo bug corregido en formularios o lógica clínica incorpora primero un test que lo reproduzca en rojo y pase tras el arreglo.
- Las policies RLS críticas (`pacientes`, `historias_clinicas`, `historia_clinica_inicial`) requieren pruebas de aislamiento (`supabase test db`/pgTAP si está disponible, o prueba smoke local) verificando que un odontólogo **no lee ni escribe** registros de otro consultorio.
- Usa exclusivamente datos sintéticos en fixtures y specs; jamás datos reales de pacientes.
**Por qué:** solo 5 archivos de `src/` tienen `.spec.ts` actualmente y ningún formulario clínico ni política RLS cuenta con pruebas automatizadas.

