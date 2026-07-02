/**
 * Edge Function: crear-cuenta-odontologo
 * ------------------------------------------------------------------
 * Crea una cuenta de odontólogo de forma segura. Solo puede invocarla
 * un usuario autenticado cuyo rol en `profiles` sea 'super_admin'
 * (se valida con el JWT que llega en la petición, NUNCA con un flag del
 * frontend).
 *
 * Usa la SERVICE_ROLE_KEY (solo del lado servidor) para:
 *   a) Invitar al odontólogo por correo (define su propia contraseña).
 *   b) Insertar su fila en `profiles`.
 *
 * VARIABLES DE ENTORNO
 * ------------------------------------------------------------------
 * SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY son
 * inyectadas automáticamente por Supabase en las Edge Functions
 * (nombres reservados con prefijo SUPABASE_). No hace falta crearlas a
 * mano. Si quisieras un secreto propio:
 *   Project Settings > Edge Functions > Secrets  (o vía CLI:
 *   `supabase secrets set NOMBRE=valor`).
 *
 * ⚠️ La SERVICE_ROLE_KEY JAMÁS debe aparecer en el frontend Angular ni
 * en el bundle desplegado en Vercel/Netlify.
 *
 * DESPLIEGUE (CLI)
 * ------------------------------------------------------------------
 *   supabase functions deploy crear-cuenta-odontologo
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1) Autenticación del que llama (a partir del JWT de la petición)
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json({ error: 'No autenticado.' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'No autenticado.' }, 401);
    const caller = userData.user;

    // 2) Verificar que el que llama sea super_admin (según profiles)
    const { data: perfilCaller, error: rolErr } = await userClient
      .from('profiles')
      .select('rol')
      .eq('id', caller.id)
      .single();

    if (rolErr || perfilCaller?.rol !== 'super_admin') {
      return json({ error: 'Acceso denegado: se requiere rol super_admin.' }, 403);
    }

    // 3) Validar cuerpo
    const body = await req.json().catch(() => null);
    const { nombre_completo, email, nombre_consultorio, plan_contratado, fecha_vencimiento_plan } =
      body ?? {};
    if (!nombre_completo || !email || !nombre_consultorio || !plan_contratado || !fecha_vencimiento_plan) {
      return json({ error: 'Faltan campos obligatorios.' }, 400);
    }

    // 4) Cliente con SERVICE_ROLE (bypassa RLS) para operaciones admin
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 4a) Invitar por correo (el odontólogo define su propia contraseña)
    const { data: invited, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email);
    if (inviteErr || !invited?.user) {
      const msg = inviteErr?.message?.includes('already')
        ? 'Ya existe un usuario con ese correo.'
        : inviteErr?.message ?? 'No se pudo invitar al usuario.';
      return json({ error: msg }, 400);
    }

    const nuevoId = invited.user.id;

    // 4b) Completar la fila en profiles.
    // El trigger on_auth_user_created ya crea una fila mínima (id, nombre_completo),
    // por eso hacemos UPSERT sobre id para completar el resto de campos.
    const { data: cuenta, error: insertErr } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: nuevoId,
          nombre_completo,
          nombre_consultorio,
          email,
          plan_contratado,
          fecha_vencimiento_plan,
          rol: 'odontologo',
          estado_cuenta: 'activo',
          creado_por: caller.id,
        },
        { onConflict: 'id' }
      )
      .select('id, nombre_completo, nombre_consultorio, email, plan_contratado, estado_cuenta, fecha_vencimiento_plan')
      .single();

    if (insertErr) {
      // Revertir el usuario creado si falla el perfil, para no dejar huérfanos
      await adminClient.auth.admin.deleteUser(nuevoId);
      return json({ error: `No se pudo crear el perfil: ${insertErr.message}` }, 400);
    }

    return json({ ok: true, cuenta }, 201);
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Error inesperado.' }, 500);
  }
});
