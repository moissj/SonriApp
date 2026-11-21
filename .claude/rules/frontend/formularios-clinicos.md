---
paths:
  - "src/app/features/pacientes/**"
  - "src/app/features/historias-clinicas/**"
  - "src/app/shared/components/**"
---
# Formularios clínicos y control de errores
- Usa **Reactive Forms tipados**, un componente por sección, y controles reutilizables (tri-estado `null` explícito, lateralidad D/I, escala 1–6, múltiple con «otro»).
- Checklist clínico con 3 estados (`Sí` / `No` / `No evaluado = null` o `Normal` / `Anormal` / `null`), nunca `false` por defecto.
- Muestra el campo de observación **solo** al elegir `Sí` o `Anormal`, y hazlo obligatorio únicamente en ítems críticos de alerta (medicamentos, cardíacos, coagulación, infectocontagiosas, hepatitis, VIH/SIDA, alergias, embarazo).
- Aplica validación en cliente (UX) y espejo en Postgres (`CHECK`/`NOT NULL`); agrega autoguardado de borrador visible y confirmación antes de salir con cambios sin guardar.
- Un fallo al guardar nunca muestra éxito; un error de carga muestra estado de error, jamás «no hay registros».
**Por qué:** `examen-ingreso` usa `ngModel` con campos de observación siempre visibles, ubicación invertida en `cuellos_expuestos` y sobrescribe sin borrador ni protección al salir.

