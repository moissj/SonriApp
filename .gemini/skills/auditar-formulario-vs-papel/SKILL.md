---
name: auditar-formulario-vs-papel
description: Compara las fotos del formato en papel de historia clínica contra los formularios Angular y esquema Supabase actuales, produciendo docs/clinica/matriz-brechas.md sin modificar código funcional.
---
<!-- GENERADO desde tools/skills/fuente/auditar-formulario-vs-papel.md — no editar a mano. -->

# Skill: Auditar formularios contra formato en papel

Ejecuta esta auditoría **antes de rediseñar o migrar nada**:

1. **Leer las referencias reales:** abre las 4 fotos en `docs/superpowers/referencias/historia-clinica-papel/` y usa la transcripción verificada en `docs/clinica/matriz-brechas.md` como línea base.
2. **Inventariar el código actual** (delegable a `relevador`):
   - `src/app/features/pacientes/formulario/` y `src/app/core/services/patient.service.ts`
   - `src/app/features/historias-clinicas/` (`historia-clinica.*`, `examen-ingreso/**`, `evoluciones/**`) y `src/app/core/services/historias-clinicas.service.ts`
   - `src/app/features/pacientes/detalle/detalle.*` y `odontograma/` (solo lectura de cabecera/alertas)
   - `supabase/migrations/**` (detectar columnas existentes y tablas faltantes como `historia_clinica_inicial`).
3. **Completar la matriz de brechas en `docs/clinica/matriz-brechas.md`:**
   - Para cada campo del encabezado y secciones 1 a 9 del papel: `Sección | Campo en papel | Estado (existe / parcial / falta / sobra) | Dónde (componente / tabla.columna) | Tipo de dato | Propuesta | Dudas`.
   - Añade el inventario de columnas con **datos sensibles de salud** y estado actual de **RLS y auditoría**.
4. **Marcar decisiones pendientes:** cualquier duda clínica o de negocio (p. ej. `DIAGNOSTICADA A` en apnea del sueño, `remite`, `PA/PP`, alertas críticas, versionado de plantilla) queda marcada para OK explícito del usuario.
5. **Regla de parada:** no modifiques componentes, formularios ni SQL en este flujo; espera aprobación de la matriz.
