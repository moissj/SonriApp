# Protocolo de orquestación y comunicación de agentes (`<paquete>` / `<informe>`)

Este documento es la **única fuente de verdad** del protocolo de delegación multi-agente para **Claude Code** y **Gemini CLI / Antigravity**.

## 1. Roles y niveles

- **N0 (Sesión principal — tier `razonamiento`):** investiga con apoyo de `relevador`, diseña el contrato, crea el plan y el tracker, despacha paquetes y verifica el resultado final. **Nunca escribe código funcional.**
- **N1 (Especialistas — tier `codificacion` / `barrido`):** ejecutan cambios solo dentro de las rutas de las que son dueños o realizan relevamiento de solo lectura (`relevador`).
- **N2 (`verificador` — tier `razonamiento`, solo lectura):** intenta refutar que la implementación cumple contrato, seguridad RLS y reglas antes de cerrar el plan.

## 2. Cuándo orquestar

- Orquestar con protocolo completo cuando la tarea toca **≥ 2 especialistas** o **≥ 4 archivos**.
- Si toca **1 solo especialista y < 4 archivos**, usar un único especialista del tier `codificacion` con brief mínimo (archivos, contrato, reglas, validación).

## 3. Reglas invariables de delegación

1. **Un archivo, un dueño:** ningún especialista edita archivos fuera de su lista de propiedad. Si necesita un cambio en archivo ajeno, lo reporta en `pendientes` (`decision` o `bloqueo`) y N0 lo resuelve o delega al dueño real.
2. **Contrato primero:** cuando la tarea afecta tablas, columnas, tipos o payloads cliente-servidor, N0 fija el contrato en `gestion/fase_de_desarrollo/NN_<slug>_expediente.json` (tablas, columnas, tipos, nulabilidad, estados tri-estado con `null` explícito, catálogos y vectores de prueba). Todo cambio al contrato incrementa su `version`.
3. **Pista datos en serie antes que cliente:**
   1) Migración idempotente + RLS + funciones/triggers (`capa-datos`),
   2) Regenerar tipos TypeScript de Supabase y probar `supabase db reset` local (o validar contra esquema),
   3) Especialista `capa-edge-functions` (si aplica),
   4) Especialista `cliente-web` consumiendo el contrato y los tipos actualizados.
4. **Sin decisiones improvisadas ni git:** los especialistas jamás ejecutan `git add` / `git commit` ni resuelven ambigüedades de negocio por cuenta propia; toda duda va a `pendientes`.
5. **Evidencia real:** `validacion` siempre incluye el comando ejecutado y la cola real de su salida (sin resumir ni maquillar fallos).

## 4. Formato de entrada (`<paquete>`)

N0 envía al agente únicamente un bloque `<paquete>`:

```xml
<paquete>
plan: gestion/fase_de_desarrollo/NN_<slug>_plan.md
contrato: gestion/fase_de_desarrollo/NN_<slug>_expediente.json (v1)
tarea: <objetivo concreto y acotado>
archivos_permitidos:
  - <ruta exacta 1>
ubicaciones:
  - <ruta:linea_inicio-linea_fin>
reglas:
  - .claude/rules/<carpeta>/<archivo>.md
validacion:
  - <comando exacto a ejecutar>
criterio_terminado: <condición verificable>
</paquete>
```

## 5. Formato de salida (`<informe>`)

El agente responde **únicamente** con un bloque `<informe>` que contenga JSON válido (máximo **4 000 caracteres**):

```xml
<informe>
{
  "estado": "hecho | parcial | bloqueado",
  "resumen": "Máximo 2 frases con lo realizado.",
  "archivos": ["ruta/modificada.ts"],
  "firmas": ["NombreSimbolo(params): ReturnType"],
  "validacion": [
    { "comando": "npm test -- --watch=false", "ok": true, "cola": "Test Files 5 passed..." }
  ],
  "pendientes": [
    { "tipo": "decision | bloqueo | riesgo", "detalle": "Qué falta o qué archivo ajeno requiere cambio" }
  ],
  "hallazgos": [
    { "ubicacion": "ruta:linea", "evidencia": "Cita exacta o salida observada", "severidad": "alta | media | baja" }
  ]
}
</informe>
```

### Política de informe inválido y reintentos

- Si la respuesta no trae `<informe>{json válido}</informe>`, supera 4 000 caracteres, edita fuera de `archivos_permitidos` o afirma validación sin salida real, N0 rechaza el informe y exige corrección al **mismo agente**:
  - **En Claude Code:** mediante `SendMessage` sobre el mismo `agentId` / conversación.
  - **En Gemini CLI / Antigravity:** re-invocando `@<agente>` adjuntando el informe inválido y el motivo exacto del rechazo.
- **Máximo 2 reintentos.** Al tercer fallo, N0 detiene la delegación y escala al usuario en `pendientes`.

