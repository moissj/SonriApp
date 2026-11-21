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

## 2. Matriz de brechas (pendiente de ejecución en Plan `00_auditoria-formularios`)

| Sección | Campo en papel | Estado (`existe` / `parcial` / `falta` / `sobra`) | Dónde (componente / tabla.columna) | Tipo de dato actual / propuesto | Propuesta | Dudas para OK |
|---|---|---|---|---|---|---|
| *(Pendiente)* | *(Se completará ejecutando `/auditar-formulario-vs-papel` dentro del plan `00_auditoria-formularios`)* | — | — | — | — | Confirmar `DIAGNOSTICADA A` en apnea del sueño, obligatoriedad de `remite.parentesco`, y mapeo `PA`/`PP` |

