---
paths:
  - "src/app/**"
---
# Arquitectura por módulo (Angular)
- Estructura cada módulo nuevo o refactorizado como `features/<modulo>/{models,funciones,services,components,pages}`.
- Coloca lógica pura de negocio y validadores en `funciones/*.funcion.ts` con su `.spec.ts` al lado.
- Un módulo de `features/` nunca importa desde el interior de otro módulo; lo compartido por 2+ módulos va a `shared/` o `core/`.
- Evita dependencias circulares entre servicios y componentes.
- El cliente Supabase se consume desde un único punto (`src/app/core/supabase.client.ts`), nunca instanciando `createClient` en features.
**Por qué:** la ruta `/historia-clinica/:pacienteId` tuvo que extraer `examen-ingreso` fuera de `pacientes/detalle` por acoplamiento entre módulos.

