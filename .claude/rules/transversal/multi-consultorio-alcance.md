# Alcance multi-consultorio y roles
- Roles vigentes en el sistema: `odontologo` y `super_admin` (`rol_usuario_enum`); cada consultorio se aísla hoy por `odontologo_id = auth.uid()`.
- Toda tabla de negocio lleva su columna de alcance (`odontologo_id` o FK padre) y su policy RLS filtra **fail-closed** (`odontologo_id = auth.uid() and public.is_cuenta_activa()`).
- Ambigüedad o ausencia de sesión devuelve 0 filas / 404, jamás «sin filtro = ver todo» ni `403` que revele existencia de IDs ajenos.
- El alcance activo se resuelve en **un solo lugar** (`AuthService` en cliente; `auth.uid()` + `is_cuenta_activa()` en BD).
- `super_admin` gestiona cuentas/planes y catálogos globales (`catalogo_eps`), pero **no tiene acceso de lectura a datos clínicos** salvo auditoría explícita aprobada.
**Por qué:** una query por `id` sin filtro de `odontologo_id` o una policy sin `is_cuenta_activa()` expondría historias de otro consultorio.

