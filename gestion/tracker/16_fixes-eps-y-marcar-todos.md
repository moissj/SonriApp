# Tracker 16 — Fixes: EPS duplicada en registro + botones marcar todos S/N en examen de ingreso

- **Plan:** [`16_fixes-eps-y-marcar-todos_plan.md`](../fase_de_desarrollo/16_fixes-eps-y-marcar-todos_plan.md)
- **Herramienta en uso:** Claude

## Tarea A — EPS duplicada en registro
- [x] Diagnóstico medido (esquema vivo, solo lectura): 11 EPS en 2 regímenes; dropdown las muestra 2 veces
- [x] Impacto FK medido: 0 pacientes referencian las filas duplicadas
- [x] Decisión usuario + OK explícito de borrado: conservar contributivo, borrar 11 subsidiado
- [x] Ejecutado en prod vía API (sin migración; tabla en rework): 11 borradas → 54 filas, 0 duplicados, verificado
- [ ] (otro plan) Arreglar el seeder EPS para que no reintroduzca duplicados — pertenece al rework EPS

## Tarea B — Botones "marcar todos" en examen de ingreso
- [x] Implementado (cliente-web): función pura `aplicar-todos-hd` + 3 setters + botonera + CSS 40x40
- [x] Gates: tsc OK, build OK (aviso budget CSS +175 b, no rompe), test 30/30 verde
- [~] Commit: BLOQUEADO — archivos dentro de feature UNTRACKED `historias-clinicas/` (WIP de otro plan); se commitean con esa feature
- [ ] Manual de usuario: diferido (pantalla aún WIP sin release)

## Commit de este plan
- [x] Solo docs del plan (expediente + plan + tracker). El código de Tarea B no es commiteable aislado; Tarea A no genera archivos (operación de datos en prod).

## Decisiones
- EPS: fix por datos (no UI, no migración) por decisión del usuario; régimen conservado = contributivo.
- Marcar-todos: dominios por sección (Sí/No, Normal/Alterado); apertura mapea No→normal, Sí→alterada.

## Pendientes
- Revocar/rotar el PAT de Supabase al cerrar (expuesto en chat).
- Verificación visual en navegador de los botones y del dropdown EPS (QA del usuario).
