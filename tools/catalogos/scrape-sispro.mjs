// Uso: node tools/catalogos/scrape-sispro.mjs <Code> <salida.csv>   (ej. CUPSRips cups.csv)
// Baja una tabla de referencia publica de SISPRO resolviendo el postback ASP.NET. No sube nada a BD.
import { writeFileSync } from 'node:fs';

const [code, out] = process.argv.slice(2);
if (!code || !out) { console.error('Uso: scrape-sispro.mjs <Code> <salida.csv>'); process.exit(2); }
const URL = `https://web.sispro.gov.co/WebPublico/Consultas/ConsultarDetalleReferenciaBasica.aspx?Code=${code}`;
const P = 'ctl00$cntContenido$dpggrvTablaReferencia$';
const dec = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();
const attr = (tag, n) => dec((tag.match(new RegExp(`${n}="([^"]*)"`)) ?? [, ''])[1]);

const hidden = (html) => Object.fromEntries(
  [...html.matchAll(/<input[^>]*type="hidden"[^>]*>/g)].map((m) => [attr(m[0], 'name'), attr(m[0], 'value')]));

function parse(html) {
  const total = +(html.match(/class="lblRowCount">(\d+)</) ?? [])[1];
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t\1>/g)].map((c) => [c[1], dec(c[2].replace(/<[^>]*>/g, ''))]));
  const head = rows.find((r) => r[0]?.[0] === 'h')?.map((c) => c[1]) ?? [];
  const idx = (n) => head.indexOf(n);
  const [ic, inom, ih] = [idx('Codigo'), idx('Nombre'), idx('Habilitado')];
  if (ic < 0 || inom < 0 || ih < 0) throw new Error('Encabezado inesperado: ' + head.join('|'));
  const data = rows.filter((r) => r[0]?.[0] === 'd' && r.length >= head.length).map((r) => [r[ic][1], r[inom][1], r[ih][1]]);
  return { total, data, page: +(html.match(/class="lblPageIndex">(\d+)</) ?? [])[1] };
}

async function post(state, extra) {
  const body = new URLSearchParams({ ...state, __EVENTARGUMENT: '', ...extra });
  const r = await fetch(URL, { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.text();
}

let html = await (await fetch(URL)).text();
let state = hidden(html);
if (!state.__VIEWSTATE) throw new Error('Sin __VIEWSTATE (code invalido?)');
let cur = parse(html);
if (!cur.total) throw new Error('Sin "Items N" (code invalido?)');

html = await post(state, { __EVENTTARGET: P + 'ddlPageSize', [P + 'ddlPageSize']: '2000' });
state = hidden(html);
cur = parse(html);
if (cur.data.length <= 10) throw new Error(`Page-size no aplicado: ${cur.data.length} filas`);

const all = [...cur.data];
const seen = new Set(all.map((r) => r[0]));
while (all.length < cur.total) {
  html = await post(state, { __EVENTTARGET: P + 'imgNext', [P + 'ddlPageSize']: '2000' });
  state = hidden(html);
  const p = parse(html);
  const nuevas = p.data.filter((r) => !seen.has(r[0]));
  if (!nuevas.length) throw new Error(`Pagina sin filas nuevas (pag ${p.page}, acumuladas ${all.length}/${cur.total})`);
  nuevas.forEach((r) => (seen.add(r[0]), all.push(r)));
  console.log(`pag ${p.page}: ${all.length}/${cur.total}`);
}

const esc = (s) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(out, 'codigo,descripcion,habilitado\n' + all.map((r) => r.map(esc).join(',')).join('\n') + '\n');
console.log(`${code}: ${all.length} filas (esperadas ${cur.total}) -> ${out}`);
