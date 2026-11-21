---
paths:
  - "supabase/migrations/**"
  - "src/app/core/services/**"
  - "src/app/features/**/*.service.ts"
---
# Tipos y contratos Supabase
- Genera y actualiza los tipos TypeScript de BD con `supabase gen types typescript` (destinando a un único archivo compartido en `src/app/core/` cuando se adopte).
- **Nunca edites a mano** el archivo de tipos generado por Supabase.
- Al agregar, renombrar o cambiar nulabilidad de una columna en migración, regenera tipos y revisa todos los services y formularios consumidores en el mismo plan.
- Toda tabla clínica nueva o alterada se refleja primero en el contrato JSON del plan (`NN_<slug>_expediente.json`) antes de codificar cliente.
**Por qué:** `Patient` y `HistoriaClinicaInicial` están tipados a mano en services y ya divergen de las migraciones recientes (`PA` vs `PP`, `afiliacion_salud`).

