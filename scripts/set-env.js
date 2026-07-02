/**
 * Genera src/environments/environment.prod.ts a partir de variables de entorno.
 * Úsalo antes del build de producción (Vercel/Netlify definen estas variables):
 *   node scripts/set-env.js && ng build
 *
 * Variables:
 *   SUPABASE_URL       URL del proyecto Supabase
 *   SUPABASE_ANON_KEY  Clave pública anon (NUNCA la service_role)
 *
 * Si no están definidas, usa los valores de desarrollo como respaldo para
 * que un build local funcione. La anon key es pública por diseño (RLS protege
 * los datos), por eso puede viajar en el bundle.
 */
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || 'https://sigpqpdfdfjavgylzhni.supabase.co';
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZ3BxcGRmZGZqYXZneWx6aG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MzY1ODksImV4cCI6MjA5NzQxMjU4OX0.dYZDjt2HaDEI6rwmltUawAc4oULJSg8Gr28CEb3-cF8';

const content = `// ARCHIVO GENERADO por scripts/set-env.js — no editar a mano.
export const environment = {
  production: true,
  supabase: {
    url: '${url}',
    anonKey: '${anonKey}',
  },
};
`;

const out = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(out, content);
console.log('environment.prod.ts generado con URL:', url);
