# Tracker 20 — Compactar componentes y densidad UI

- **Plan:** [`20_compactar-componentes_plan.md`](../fase_de_desarrollo/20_compactar-componentes_plan.md)
- **Diseño:** `docs/superpowers/specs/2026-11-24-compactar-componentes-design.md`
- **Herramienta en uso:** Claude

## Checklist
- [x] Diseño aprobado (brainstorming) + spec commiteado (`c2a25aa`)
- [x] Plan + tracker escritos (sin BD, sin contrato JSON: el contrato es la escala de densidad)
- [x] Fase 1 (`cliente-web`): inicio, detalle, citas, historia-clinica a la escala (pacientes.html sin cambio: solo tenía FAB excluido). Gates verde, diff solo esos 4.
- [x] Fase 2 (`cliente-web`): 13 html (auth x3, onboarding, perfil, admin, reportes, plantillas, config-eps, tratamientos, historial, formulario, evoluciones solo `sm:pl-6`). pagos sin cambio. Gates verde.
- [x] Gates verde (`tsc` limpio / `build` OK / `test` 39 / `sincronizar --check`)
- [x] Revisión adversarial (`verificador`): **APROBADO**, 0 bloqueantes (diff = 17 html, cero exclusiones, cero clínico <40, sin cambio estructural)
- [x] Manual: sin cambio de campos/acciones/flujo → contenido del manual inalterado (solo densidad); no requiere reescritura ni `revisado`
- [x] Commit local `bba4588` (17 html + plan + tracker; spec `c2a25aa`). **Pendiente OK explícito:** push

## Pendientes / deuda
- Glifos clínicos <40px (24/28px, 0.9rem en examen/checklist/odontograma): deuda de accesibilidad (agrandar), fuera de este plan.
- Enfoque page-shell compartido (densidad en un solo lugar): descartado por ahora.
