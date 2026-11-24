# Auditoría y Matriz de Brechas — Historia Clínica vs. Formato en Papel

> **Estado:** Transcripción verificada contra las 4 fotos originales en `docs/superpowers/referencias/historia-clinica-papel/`. La matriz comparativa detallada por campo se completará en el plan `00_auditoria-formularios` antes de rediseñar o migrar código.

## 1. Verificación de fotos y diferencias detectadas frente al borrador inicial

Las 4 fotos (`.jfif`, orientadas 90° en sentido antihorario) fueron leídas directamente:
- `38b0518f-53e8-41cf-86fe-3b4e111a53b2.jfif` (página 1 superior: encabezado + Sección 1 + Sección 2 + inicio Sección 3)
- `a00326de-02c5-4152-887c-26ab5f6ae87e.jfif` (detalle Sección 1 + Sección 2 + Sección 3 completa hasta inicio de 4)
- `6b16ea75-fbf0-4a41-8161-53c8cc5f4480.jfif` (fin Sección 3 + Sección 4 + Sección 5 + inicio Sección 6)
- `a6f6c806-6656-461a-a4e0-b27c88627df5.jfif` (fin Sección 6 + Sección 7 + Sección 8 + Sección 9)

### Diferencias exactas encontradas en las fotos respecto al borrador del requerimiento

1. **Ubicación real de las fotos:** están en `docs/superpowers/referencias/historia-clinica-papel/` (no en `docs/referencias/historia-clinica-papel/`).
2. **Encabezado:** título «HISTORIA CLINICA ODONTOLOGICA», campos `DIA / MES / AÑO`, `HISTORIA #`, y nota al pie del bloque con las convenciones de `EST CIVIL` (`SOLTERO CASADO DIVORCIADO UNION LIBRE VIUDO`) y `VINCULACION` (`COTIZANTE BENEFICIARIO SUBSIDI-ADO`).
3. **Sección 1 — Identificación:**
   - `REMITE` en papel es una línea única de texto libre (sin `PARENTESCO` ni `TEL`), a diferencia de `formulario.ts` donde hoy `remite.parentesco` es obligatorio.
   - `TIPO DE ID` en papel usa `CC CE RC TI PP` (en la app actual la BD usa `PA` para Pasaporte).
   - El papel **no** pide `correo electrónico` ni `departamento` separado en residencia/nacimiento (la app actual sí los pide y conviene conservarlos).
   - `RESPONSABLE` y `ACOMPAÑANTE` tienen `PARENTESCO` y `TEL`.
4. **Sección 3 — Antecedentes de salud:**
   - El ítem 12 dice exactamente `ÚLCERAS GASTRITIS` (la app actual dice «Úlceras gástricas»).
   - El ítem 16 en papel tiene errata tipográfica `REACCIONES ALÉRICAS` (alérgicas).
   - El orden de los 21 ítems coincide palabra a palabra con las fotos, seguido de `OBSERVACIONES`, `TOMA DE PRESION` y `TEMPERATURA CORPORAL`.
5. **Sección 4 — Tejidos blandos:**
   - En papel, los 16 ítems muestran únicamente `N A` (Normal / Anormal) y una sola línea general al final: `OBSERVACIONES HALLAZGOS CLINICOS` (no hay línea individual por estructura en el papel; la app añade observación por ítem opcional).
6. **Sección 6 — Historia dental:**
   - El papel incluye un interruptor general `HABITOS ORALES S ___ N ___` antes de listar `SUCCION DIGITAL ___ - H LENGUA. S ___ N ___ - HAB COM UÑAS S ___ N ___ - CHUPETE S ___ N ___` (`SUCCION DIGITAL` solo tiene línea, sin `S N` impreso).
   - **`UBICACION` pertenece a `SENSIBILIDAD`** (`SENSIBILIDAD S ___ N ___ - UBICACION ___`), mientras `CUELLOS EXP/ EROSION S ___ N ___` tiene línea sin etiqueta «ubicación». En `examen-ingreso.html` actual están invertidos.
   - `SUPERNUMERIOS` (errata de imprenta por «Supernumerarios») y `SELLANTES S ___ N ___` tienen línea de texto asociada.
   - `FRECUENCIA DE CEPILLADO # VECES 1 2 3 4 5 6`, `USO SEDA DENTAL S ___ N ___`, `USO ENJUAGUE BUCAL S ___ N ___ FRECUENCIA # ___`.
7. **Sección 7 — Exploración facial (faltaban varios campos en el borrador):**
   - `ASIMETRIA FACIAL S ___ N ___` trae línea de detalle.
   - **`POSICION LABIAL`** aparece como campo propio entre `NARIZ (RECTA / DESVIACION)` y `RESPIRADOR ORAL S ___ N ___`.
   - `APNEA DEL SUEÑO S ___ N ___`, seguido de **`DIAGNOSTICADA. S ___ N ___ A ___`** *(duda clínica: qué representa «A» — ¿asintomática / aparente / en estudio? — marcar para decisión)*, `USO DE CPAP S ___ N ___` y **`APARAT SUEÑO REMOVIBLE NO CPAP S ___ N ___`**.
   - **`MORDIDA CRUZADA`** y **`MORDIDA PROFUNDA`** tienen exactamente la misma estructura que `MORDIDA ABIERTA`: `S ___ N ___ ANTERIOR ___ POSTERIOR ___ IZQUIERDA ___ DERECHA ___` + línea.
   - En **`ANOMALIAS DE POSICION`**: `ROTACIONES S ___ N ___`, `DIASTEMAS. S ___ N ___`, `TRANSLOCACIONES S ___ N ___`, `GIROVERSIONES S ___ N ___`, `AUSENCIAS S ___ N ___`, `RETENIDOS. S ___ N ___`, `APIÑAMIENTOS S ___ N ___`, y **al final un campo `DESCRIPCION`** que faltaba en el borrador.
   - `PLANOS TERMINALES: ESCALON RECTO ___ ESCALON MESIAL ___ ESCALON DISTAL ___`.
   - `TIPO DE DENTICION : TEMPORAL ___ MIXTA ___ PERMANENTE ___`.
   - `DESCRIPCION DE MODELOS` (líneas amplias).
8. **Secciones 8 y 9:** `8. DIAGNOSTICO` (3 líneas) y `9. PLAN DE TRATAMIENTO ORTOPEDICO E INTEGRAL` (4 líneas).

## 2. Matriz de brechas (ejecutada en Plan `00_auditoria-formularios`)

> **Fuentes:** lado papel = transcripción verificada de §1 (4 fotos). Lado código = inventario `relevador` (`ruta:línea` reales). `historia_dental` y `antecedentes_salud` son columnas JSONB en `historia_clinica_inicial`.

### Encabezado

| Campo en papel | Estado | Dónde (componente / tabla.columna) | Propuesta | Dudas para OK |
|---|---|---|---|---|
| Fecha historia (DIA/MES/AÑO) | parcial | sin campo visible en `historia-clinica.html:24-42` | Derivar de `created_at` o número de historia | — |
| HISTORIA # | falta | — | Número de historia secuencial por consultorio | ¿Numeración requerida o basta `id`? |
| EST CIVIL (SOLTERO/CASADO/DIVORCIADO/UNION LIBRE/VIUDO) | existe | `formulario.html:112` `estado_civil` | Conservar | — |
| VINCULACION (COTIZANTE/BENEFICIARIO/SUBSIDIADO) | existe | `formulario.html:183` `tipo_vinculacion` | Conservar | — |

### Sección 1 — Identificación del paciente

| Campo en papel | Estado | Dónde | Propuesta | Dudas para OK |
|---|---|---|---|---|
| Apellidos / Nombres | existe | `formulario.html:49,50,53` | Conservar | — |
| TIPO DE ID (CC CE RC TI PP) | parcial | `formulario.html:58` ofrece `CC,TI,CE,PA,RC` | Unificar: papel usa **PP** (pasaporte), app usa **PA** | **(D1)** ¿`PA`→`PP` o conservar `PA`? |
| Número documento | existe | `formulario.html:66` | Conservar | — |
| Fecha nacimiento / Edad | existe | `formulario.html:72,76` (edad readonly) | Conservar | — |
| Sexo (M/F) | existe | `formulario.html:104` | Conservar | — |
| Correo electrónico | sobra | `formulario.html:135` `email` | Papel no lo pide; **conservar** (mejora) | — |
| Depto/Ciudad nacimiento | sobra | `formulario.html:83,92` | Papel no separa depto; **conservar** | — |
| Residencia (depto/ciudad/dirección/barrio) | existe | `formulario.html:140,149,159,160` | Conservar | — |
| Teléfono / fijo | existe | `formulario.html:131,132` | Conservar | — |
| Afiliación (EPS) | existe | `formulario.html:174` `eps_id`→`catalogo_eps` | Conservar | — |
| Ocupación / dir. laboral / tel. laboral | existe | `formulario.html:200,202,203` | Conservar | — |
| REMITE (línea de texto libre) | parcial | `formulario.html:239-240` `remite` con `nombre_completo`+**`parentesco`** (sin teléfono) | Papel = solo línea libre, sin parentesco | **(D2)** ¿Hacer `remite.parentesco` opcional/eliminar? |
| RESPONSABLE (parentesco + tel) | existe | `formulario.html:217-241` `responsable` | Conservar | — |
| ACOMPAÑANTE (parentesco + tel) | existe | `formulario.html:217-241` `acompanante` | Conservar | — |

### Sección 2 — Encabezado clínico y motivo de consulta

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Motivo de consulta | existe | `evoluciones.html:41` `motivo_consulta` (obligatorio) → `historias_clinicas` | Conservar | — |

### Sección 3 — Antecedentes de salud (21 ítems + obs + PA + temperatura)

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| 21 ítems S/N | existe | `antecedentes_salud` (JSONB) `examen-ingreso.ts:21-40`, HTML `:17-28` | Conservar tri-estado (`null`/sí/no) | — |
| Ítem 12 `ÚLCERAS GASTRITIS` | parcial | app rotula «Úlceras gástricas» | Ajustar texto al papel | — |
| Ítem 16 `REACCIONES ALÉRICAS` (errata) | existe | `examen-ingreso.ts:36` «Reacciones alérgicas» | Mantener ortografía correcta | — |
| OBSERVACIONES | existe | `examen-ingreso.html:31-39` `obs_antecedentes` | Conservar | — |
| TOMA DE PRESION | existe | `examen-ingreso.html:44-52` `toma_presion` | Conservar | — |
| TEMPERATURA CORPORAL | existe | `examen-ingreso.html:55-66` `temperatura_corporal` | Conservar | — |

### Sección 4 — Tejidos blandos (16 ítems N/A)

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| 16 ítems Normal/Anormal | existe | app lista **16** ítems `examen-ingreso.ts:45-60` (`TEJIDOS_NOMBRES`, HTML `:78-89`) | Conservar; solo cotejar nombres exactos vs foto | **(D6)** Cerrada lado-código (16 ítems = papel); resta cotejo de nombres vs `.jfif` (no renderiza) |
| OBSERVACIONES HALLAZGOS (línea única) | sobra | `obs_tejidos_blandos` `:92-100` + obs por ítem (`checklist-item`) | Papel usa una sola línea; app añade obs por ítem — **conservar** | — |

### Sección 5 — Funciones vitales / orales

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Respiración (nasal/oral) | existe | `examen-ingreso.html:113-119` | Conservar | — |
| Deglución (normal/atípica) | existe | `examen-ingreso.html:122-128` | Conservar | — |
| Fonación (normal/alterada) | existe | `examen-ingreso.html:131-137` | Conservar | — |
| Succión (normal/alterada) | existe | `examen-ingreso.html:140-146` | Conservar | — |

### Sección 6 — Historia dental (JSONB `historia_dental`)

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Tratamiento ortopédico / recambio tardío | existe | `examen-ingreso.service.ts:18-31` | Conservar | — |
| ATM: dolor / ruido / apertura / desviación (valor+lado) | existe | `historia_dental` keys | Conservar | — |
| HABITOS ORALES (interruptor general S/N) | falta | — | Añadir switch general antes de hábitos | — |
| Succión digital (solo línea, sin S/N) | existe | `succion_digital` | Conservar | — |
| Hábito lengua / uñas / chupete (S/N) | existe | `habito_lengua,habito_unas,chupete` (HTML `:259-275`) | Conservar | — |
| SENSIBILIDAD S/N + **UBICACION** | parcial | app pone «ubicación» en `cuellos_expuestos` (`:311`) | **Invertido**: UBICACION pertenece a SENSIBILIDAD | **(D confirmada)** corregir mapeo ubicación |
| CUELLOS EXP/EROSIÓN S/N (línea sin etiqueta) | parcial | `cuellos_expuestos` con obs ubicación `:311` | Quitar etiqueta «ubicación» de aquí | — |
| SUPERNUMERIOS / SELLANTES S/N + línea | falta | — | Añadir campos | — |
| Frecuencia cepillado / seda / enjuague + frecuencia | falta | — | Añadir campos de higiene | — |
| Traumas/quistes, ausencias congénitas | existe | `traumas_quistes,ausencias_congenitas` | Conservar | — |

### Sección 7 — Exploración facial

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Toda la sección (asimetría, posición labial, nariz, respirador oral, apnea, CPAP, aparato removible, mordida cruzada/profunda/abierta, anomalías de posición, planos terminales, tipo dentición, descripción de modelos) | **falta** | sin campos en código | Construir sección completa (Plan 09) | **(D3)** `DIAGNOSTICADA … A ___` en apnea: ¿significado de «A»? |

### Sección 8 — Diagnóstico

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Diagnóstico (3 líneas) | parcial | `evoluciones.html:53` `diagnostico` (por evolución) | Decidir si vive en examen de ingreso o en evolución | ¿Diagnóstico de ingreso separado del de evolución? |

### Sección 9 — Plan de tratamiento ortopédico e integral

| Campo en papel | Estado | Dónde | Propuesta | Dudas |
|---|---|---|---|---|
| Plan de tratamiento (4 líneas) | **falta** | sin campo | Construir sección (Plan 11) | **(D5)** ¿texto libre o estructurado por fases? |

## 3. Inventario de columnas con datos sensibles de salud

Clasificación mínima (sin exponer datos de pacientes). Todas requieren RLS fail-closed y cero presencia en logs/analítica/tests.

- **Datos clínicos de salud (alta sensibilidad):** `antecedentes_salud` (JSONB: incluye Sida, Hepatitis, Psiquiátricos/neurológicos, Ginecológicos/embarazo), `historia_dental` (JSONB), `antecedentes_medicos`, `alergias`, `obs_antecedentes`, `obs_tejidos_blandos`, `toma_presion`, `temperatura_corporal`, `diagnostico`, `notas_clinicas`, `motivo_consulta`, `notas_generales`.
- **Afiliación/salud:** `eps_id`, `tipo_vinculacion`, `afiliacion_salud`.
- **PII del paciente:** `numero_documento`, `fecha_nacimiento`, `telefono`, `email`, `direccion`.
- **PII de terceros:** `responsable`, `acompanante`, `remite` (nombre/teléfono/parentesco).

## 4. Mapa de RLS y migraciones (estado actual en repo)

> **Advertencia:** la verificación contra el esquema **vivo** de Supabase quedó **bloqueada** — el MCP de Supabase no conectó en esta sesión (`CONNECT_TIMEOUT`). Lo siguiente se infiere solo de `supabase/migrations/**`.

| Tabla | CREATE TABLE en repo | RLS en repo | Riesgo |
|---|---|---|---|
| `historia_clinica_inicial` | **No** | **No hallada**; el cliente hace `upsert` (`examen-ingreso.service.ts:76-85`) | **Alto** — tabla de datos clínicos sin policy fail-closed visible |
| `historias_clinicas` | **No** | Solo `SELECT` «historias: ver propias» (`20260702015419:21`); sin INSERT/UPDATE/DELETE | **Alto** — faltan policies de escritura |
| `pacientes` | No (solo `ALTER`, `20260705040728`) | `SELECT` «pacientes: ver propios» (`20260702015419:15`); sin INSERT/UPDATE visible | Medio |
| `catalogo_eps` | Sí (`20260705043527`) | Sí, pero **sin `is_cuenta_activa()`** | Medio |
| `odontogramas`, `presupuestos`, `pagos`, `presupuesto_items`, `tratamientos_catalogo`, `departamentos`, `municipios` | Sí | Sí | Bajo |

## 5. Decisiones pendientes de OK explícito del usuario

| ID | Decisión | Para habilitar |
|---|---|---|
| **D1** | Tipo de ID: ¿unificar `PA`→`PP` (papel) o conservar `PA`? | Plan 03 |
| **D2** | `remite`: ¿texto libre (papel) o mantener `parentesco` obligatorio? | Plan 03 |
| **D3** | Apnea `DIAGNOSTICADA … A ___`: significado de «A» (asintomática/aparente/en estudio) | Plan 09 |
| **D4** | Confirmar construcción completa de **Sección 7** (exploración facial, hoy ausente) | Plan 09 |
| **D5** | **Sección 9** plan de tratamiento: ¿texto libre o estructurado por fases? | Plan 11 |
| **D6** | Tejidos blandos: app ya tiene 16 ítems (= papel); solo resta cotejar **nombres exactos** vs foto (`.jfif` no renderiza vía Read) | Plan 06 |
| **D7** | **Bloqueo:** verificar esquema y RLS vivos de `historia_clinica_inicial`/`historias_clinicas`/`pacientes` requiere MCP de Supabase (hoy caído) | Plan 01 / Plan 13 |

> **Regla de parada:** no se modifica ningún componente, formulario ni SQL hasta la aprobación de esta matriz (ver tracker `00_auditoria-formularios`).

