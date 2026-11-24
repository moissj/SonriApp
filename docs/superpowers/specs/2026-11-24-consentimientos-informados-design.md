# Diseño — Consentimientos informados (subida de firmado en papel)

> **Fecha:** 2026-11-24 · **Roadmap:** Dentalink #3 (consentimientos + firma). · **Estado:** aprobado por el usuario (brainstorming).
> **Decisiones base del usuario:** firma = subir el consentimiento **firmado en papel** (sin canvas ni e-firma); plantillas = **catálogo global** administrado por `super_admin`; entrega de la plantilla en blanco = **texto en BD + vista imprimible**.

## 1. Objetivo y alcance

Permitir que el odontólogo, dentro de un paciente, seleccione un consentimiento del catálogo, lo imprima (con los datos del paciente), lo haga firmar en papel y suba el PDF/foto firmado, quedando guardado de forma **inmutable** con fecha y versión de plantilla. `super_admin` mantiene el catálogo global de textos.

**Fuera de alcance (YAGNI):** firma digital/canvas, e-firma certificada con sello de tiempo, envío del consentimiento al paciente, recordatorios de consentimiento, módulo genérico de documentos del paciente (roadmap #6, plan aparte).

## 2. Modelo de datos (2 tablas nuevas)

### `catalogo_consentimientos` (global, patrón `catalogo_eps`)
| Columna | Tipo | Nota |
|---|---|---|
| id | uuid pk | |
| tipo | text | slug estable (ej. `tratamiento`, `habeas_data`, `imagenes`, `anestesia`, `menores`) |
| titulo | text | nombre visible |
| cuerpo | text | texto del consentimiento (placeholder inicial; lo completa el usuario/profesional) |
| version | int | se incrementa al editar el texto |
| activo | boolean | default true |
| created_at / updated_at | timestamptz | servidor |

**RLS:** `SELECT` para `authenticated` (catálogo global, como `catalogo_eps`); `INSERT/UPDATE/DELETE` solo `super_admin` (`is_super_admin()`). Sin datos de pacientes.

### `consentimientos_paciente`
| Columna | Tipo | Nota |
|---|---|---|
| id | uuid pk | |
| paciente_id | uuid fk pacientes | on delete cascade |
| odontologo_id | uuid fk profiles | alcance |
| catalogo_id | uuid fk catalogo_consentimientos | qué consentimiento |
| plantilla_version | int | **snapshot** de `catalogo_consentimientos.version` al subir |
| archivo_path | text | ruta en Storage |
| nombre_archivo | text | nombre original |
| fecha_firma | date | fecha de firma en papel |
| estado | text check (`vigente`\|`anulado`) | default `vigente` |
| motivo_anulacion | text null | obligatorio al anular |
| created_at | timestamptz | servidor (`now()`) |
| updated_at | timestamptz | trigger |

**RLS fail-closed** (multi-consultorio): todas las operaciones verifican `odontologo_id = auth.uid()`; `SELECT` añade `is_cuenta_activa()`. Ambigüedad/sin sesión → 0 filas.

Índices: `paciente_id`, `odontologo_id` (filtros y policies).

## 3. Storage e integridad clínica

- Bucket privado `consentimientos`. Objetos bajo `{odontologo_id}/{paciente_id}/{uuid}-{nombre}`. Policies de Storage por carpeta/consultorio. Acceso solo con **URL firmada de vida corta** (nunca URL pública).
- **Inmutabilidad (regla historia-clinica-integridad):** sin borrado físico del registro ni del archivo. Corrección = `estado='anulado'` + `motivo_anulacion` + subir uno nuevo. `plantilla_version` congelada para interpretar el texto firmado históricamente. Timestamp oficial en servidor (`now()` Postgres), nunca el reloj del navegador.
- Tipos aceptados: `application/pdf`, `image/jpeg`, `image/png`. Límite de tamaño validado en cliente y en policy de Storage.

## 4. Frontend (Angular standalone, OnPush, signals)

Módulo `features/consentimientos/` (`models, funciones, services, components`), consumido desde el detalle del paciente.

- **Sección "Consentimientos" en el paciente:** lista (`tipo`, `fecha_firma`, `estado`, acciones ver/descargar firmado vía URL firmada; anular con confirmación + motivo). Estado de error nunca muestra "sin registros".
- **Nuevo consentimiento:** elegir del catálogo (`activo`) → **vista imprimible** (`cuerpo` + cabecera del paciente) → imprimir del navegador → subir archivo firmado → guardar registro (congela `plantilla_version`). Botón de guardar deshabilitado mientras sube (evita doble inserción).
- **Vista imprimible:** componente que renderiza el `cuerpo` del catálogo con datos del paciente; estilos `@media print`. Sin lógica de negocio.
- **super_admin — catálogo:** pantalla CRUD de `catalogo_consentimientos` (crear/editar texto y título; editar sube `version`; activar/desactivar). Reutiliza `is_super_admin` / guard admin existente.
- Accesibilidad: objetivos táctiles ≥40×40, labels/aria, foco visible. Fechas en `America/Bogota`. Confirmación explícita antes de anular.

## 5. Capa de servicios

- `ConsentimientoService`: `listarPorPaciente(pacienteId)`, `subir(pacienteId, catalogoId, archivo, fechaFirma)` (sube a Storage + inserta registro + congela versión), `urlFirmada(path)`, `anular(id, motivo)`. Siempre informa el `error` de Supabase (nunca `[]` silencioso).
- `CatalogoConsentimientoService`: `listarActivos()`, y para super_admin `crear/editar/activar`.
- Cliente Supabase desde el punto único `core/supabase.client.ts`.

## 6. Pendientes legales — validar con profesional (NO asumir de memoria)

Marcados para OK/validación antes de uso real; no se redacta texto legal autoritativo en este plan:
- Validez de firma en papel escaneado y encuadre con Ley 527 (firma/mensajes de datos).
- Tratamiento de datos / habeas data (autorización del titular).
- Tiempos de retención del consentimiento y de la historia clínica.
- Consentimiento de menores (firma de acudiente) — hoy se modela como un `tipo` más; la validación de identidad del firmante vive en el papel, no en la app.

El catálogo se **siembra con títulos + cuerpo placeholder** que el usuario/profesional completa; la app no fija el contenido legal.

## 7. Decomposición / fases sugeridas

1. **Datos + Storage + RLS** (`capa-datos`): 2 tablas, bucket, policies, seed de tipos con placeholder.
2. **Flujo del odontólogo** (`cliente-web`): servicio + sección en paciente + subir/listar/anular + vista imprimible.
3. **CRUD super_admin del catálogo** (`cliente-web`): pantalla de administración.

Cada fase valida gates (`tsc`, `build`, `test`, `sincronizar --check`) y pasa por `verificador`.

## 8. Fuera de alcance confirmado

Firma digital/canvas, e-firma certificada, envío/portal del paciente, recordatorios de consentimiento, módulo genérico de documentos (roadmap #6).
