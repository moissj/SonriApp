---
paths:
  - "src/app/features/pacientes/detalle/odontograma/**"
  - "src/app/core/services/odontograma.service.ts"
  - "supabase/migrations/*odontograma*"
---
# Protección del módulo Odontograma
- El odontograma SVG con las 6 superficies (`vestibular`, `lingual_palatina`, `mesial`, `distal`, `oclusal_incisal`, `cervical`) y su geometría concéntrica es una pieza delicada.
- **No modifiques** el odontograma dentro de un plan de formularios de paciente o historia clínica.
- Todo cambio de geometría, estados clínicos o persistencia en `odontogramas` exige su **propio plan dedicado** con pruebas unitarias de mapeo e integración.
- Las alertas clínicas en la vista del odontograma se consumen desde la cabecera del paciente o un componente de banner externo sin alterar los trazos SVG.
**Por qué:** cambios incidentales sobre el SVG o el enum `superficie_diente_enum` pueden desalinear coordenadas táctiles y registros por cara en producción.

