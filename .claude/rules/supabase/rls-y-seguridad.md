---
paths:
  - "supabase/**"
---
# Seguridad y Row Level Security (RLS)
- Activa `ENABLE ROW LEVEL SECURITY` en **toda** tabla de `public`; sin exceptions ni `USING (true)` en datos de negocio.
- Define policies explícitas por operación (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) y rol (`authenticated`), verificando `odontologo_id = auth.uid()` y `public.is_cuenta_activa()`.
- Toda función `SECURITY DEFINER` fija `SET search_path = public` y valida pertenencia o rol (`is_super_admin()`); revoca `EXECUTE` público en triggers.
- `service_role` solo vive en Edge Functions (servidor), jamás en Angular, `.env.example` ni `scripts/`.
- Storage (radiografías, fotos, consentimientos, `logos`): policies por carpeta/consultorio y **URLs firmadas de corta vida** para todo archivo clínico.
**Por qué:** en `catalogo_eps` se heredó `USING (true)` inicialmente y el bucket clínico aún requiere diseño cerrado de privacidad.

