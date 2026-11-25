// Carga idempotente de catalogo_cie10 / catalogo_cups (upsert por codigo).
// Uso: SUPABASE_URL=... SERVICE_ROLE_KEY=... node tools/catalogos/cargar-catalogos.mjs \
//   --cie10 ruta.csv --version-cie10 "2024" --cups ruta.csv --version-cups "2024"
// Mapas de columna (defaults asumidos; ajustar al ver el archivo real con --mapa-cie10 / --mapa-cups
// en formato clave=columna,clave=columna):
//   CIE-10: codigo=codigo, descripcion=descripcion, capitulo=capitulo
//   CUPS:   codigo=codigo, descripcion=descripcion, sexo=sexo, ambito=ambito, quirurgico=quirurgico
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { parsearCsv, normalizarCie10, normalizarCups } from './funciones/parsear-catalogo.mjs';

const LOTE = 500;
const MAPA_CIE10 = { codigo: 'codigo', descripcion: 'descripcion', capitulo: 'capitulo' };
const MAPA_CUPS = {
  codigo: 'codigo', descripcion: 'descripcion', sexo: 'sexo', ambito: 'ambito', quirurgico: 'quirurgico',
};

function fallar(msg) {
  console.error(msg);
  process.exit(1);
}

function mezclarMapa(base, texto) {
  if (!texto) return base;
  return { ...base, ...Object.fromEntries(texto.split(',').map((p) => p.split('='))) };
}

async function subir(cliente, tabla, rows) {
  for (let i = 0; i < rows.length; i += LOTE) {
    const { error } = await cliente.from(tabla).upsert(rows.slice(i, i + LOTE), { onConflict: 'codigo' });
    if (error) fallar(`Error en ${tabla} (lote desde fila ${i}): ${error.message}`);
  }
}

async function cargar(cliente, { tabla, ruta, version, mapa, normalizar }) {
  const filas = parsearCsv(fs.readFileSync(ruta, 'utf8'));
  const { rows, descartadas } = normalizar(filas, mapa, version);
  await subir(cliente, tabla, rows);
  console.log(`${tabla}: procesadas=${rows.length} descartadas=${descartadas} version=${version}`);
}

async function main() {
  const { values: a } = parseArgs({
    options: {
      cie10: { type: 'string' }, cups: { type: 'string' },
      'version-cie10': { type: 'string' }, 'version-cups': { type: 'string' },
      'mapa-cie10': { type: 'string' }, 'mapa-cups': { type: 'string' },
    },
  });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SERVICE_ROLE_KEY;
  if (!url || !key) fallar('Faltan variables de entorno SUPABASE_URL y/o SERVICE_ROLE_KEY.');
  if (!a.cie10 && !a.cups) fallar('Indica --cie10 y/o --cups.');
  if (a.cie10 && !a['version-cie10']) fallar('Falta --version-cie10.');
  if (a.cups && !a['version-cups']) fallar('Falta --version-cups.');

  const cliente = createClient(url, key, { auth: { persistSession: false } });
  if (a.cie10) {
    await cargar(cliente, {
      tabla: 'catalogo_cie10', ruta: a.cie10, version: a['version-cie10'],
      mapa: mezclarMapa(MAPA_CIE10, a['mapa-cie10']), normalizar: normalizarCie10,
    });
  }
  if (a.cups) {
    await cargar(cliente, {
      tabla: 'catalogo_cups', ruta: a.cups, version: a['version-cups'],
      mapa: mezclarMapa(MAPA_CUPS, a['mapa-cups']), normalizar: normalizarCups,
    });
  }
}

main().catch((e) => fallar(`Fallo inesperado: ${e.message}`));
