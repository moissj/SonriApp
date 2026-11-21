---
paths:
  - "supabase/**"
  - "src/app/features/historias-clinicas/**"
---
# Integridad de la historia clínica
- Una historia clínica cerrada o firmada **no se sobrescribe**: toda corrección crea una nueva versión o nota aclaratoria con autor, motivo y marca de tiempo del servidor.
- **Prohibido el borrado físico** de historias clínicas o evoluciones; usa anulación/inactivación auditada si aplica.
- Guarda en cada registro la `plantilla_version` con la que fue diligenciado para interpretar campos históricos sin ambigüedad.
- El timestamp oficial de cierre/registro se genera en el servidor (`now()` en Postgres), nunca con el reloj del navegador.
- El diseño definitivo de estados (borrador editable vs. cerrado inmutable) se aprueba explícitamente en el plan `01_modelo-historia-clinica`.
**Por qué:** hoy `ExamenIngresoService.upsert` sobrescribe el registro único de `historia_clinica_inicial` sin dejar rastro de cambios ni versión.

