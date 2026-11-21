---
name: nuevo-formulario-clinico
description: Guía paso a paso para implementar o ampliar una sección del formulario clínico con contrato, migración+RLS, tipos, controles reutilizables tri-estado, validaciones, tests y manual.
---
<!-- GENERADO desde tools/skills/fuente/nuevo-formulario-clinico.md — no editar a mano. -->

# Skill: Implementar sección de formulario clínico

Sigue este orden estricto (N0 coordina; especialistas ejecutan dentro de un plan aprobado):

1. **Contrato primero:** define en `gestion/fase_de_desarrollo/NN_<slug>_expediente.json` cada campo, tipo, nulabilidad, valores permitidos (tri-estado `null` explícito; nunca `false` por defecto), regla de observación condicional (obligatoria solo en ítems críticos de alerta) y vectores de prueba.
2. **Capa datos (`capa-datos`):** migración idempotente en `supabase/migrations/` + RLS fail-closed (`odontologo_id = auth.uid() and public.is_cuenta_activa()`) + `CHECK` en BD + auditoría/integridad + reversibilidad sin pérdida de datos existentes.
3. **Tipos y BD local:** regenera tipos TypeScript con `supabase gen types typescript` (si el CLI está disponible) o verifica alineación exacta con el contrato; valida `supabase db reset` cuando aplique.
4. **Cliente Angular (`cliente-web`):** crea el componente de sección (< 200 líneas, `OnPush`, Reactive Forms tipados) usando controles reutilizables de `shared/` (tri-estado S/N/No evaluado, Normal/Anormal/No evaluado, lateralidad D/I, escala 1–6, múltiple con «otro»), objetivos táctiles ≥ 40 px, progreso visible, autoguardado de borrador y guardia de salida sin guardar.
5. **Validación dual y manejo de errores:** reglas espejo cliente/BD; errores de carga se muestran como error (no como lista vacía); fallo al guardar jamás muestra éxito.
6. **Pruebas y verificación (`verificador`):** tests unitarios de funciones puras (casos borde `null`, `America/Bogota`, edad en cumpleaños, validación documento) y prueba de aislamiento RLS entre consultorios con datos sintéticos; ejecuta `tsc --noEmit`, `npm run build`, `npm test -- --watch=false` y `sincronizar.mjs --check`.
7. **Manual de usuario:** actualiza la página de manual de la pantalla modificada (`.claude/rules/transversal/manual-usuario.md`).
8. **Tracker:** actualiza `gestion/tracker/NN_<slug>.md` hasta `- [x] Commit`.
