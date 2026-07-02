/**
 * Edge Function: seed-colombia (uso único)
 * Carga los departamentos y municipios de Colombia en las tablas de referencia
 * usando la SERVICE_ROLE_KEY. Es idempotente: si ya hay datos, no reinserta.
 * Datos: dataset público (DANE-based) marcovega/colombia-json.
 *
 * Deploy: supabase functions deploy seed-colombia
 * Se puede eliminar tras sembrar: supabase functions delete seed-colombia
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DATA_URL = 'https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.min.json';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { count } = await admin.from('departamentos').select('id', { count: 'exact', head: true });
    if ((count ?? 0) > 0) return json({ ok: true, message: 'Ya estaba sembrado', departamentos: count });

    const data: Array<{ departamento: string; ciudades: string[] }> = await (await fetch(DATA_URL)).json();

    const { data: deps, error: e1 } = await admin
      .from('departamentos')
      .insert(data.map((d) => ({ nombre: d.departamento })))
      .select('id, nombre');
    if (e1) return json({ error: e1.message }, 500);

    const idByName = new Map(deps!.map((d) => [d.nombre, d.id]));
    const municipios: Array<{ departamento_id: number; nombre: string }> = [];
    for (const d of data) {
      const depId = idByName.get(d.departamento);
      for (const c of d.ciudades) municipios.push({ departamento_id: depId as number, nombre: c });
    }

    const { error: e2 } = await admin.from('municipios').insert(municipios);
    if (e2) return json({ error: e2.message }, 500);

    return json({ ok: true, departamentos: deps!.length, municipios: municipios.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
