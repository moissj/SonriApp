// Lógica pura de parseo/normalización de catálogos CIE-10 y CUPS. Sin I/O ni red.

/** Parser CSV mínimo: comillas dobles, comas dentro de comillas, CRLF. shortcut: sin saltos de línea dentro de comillas. */
export function parsearCsv(texto) {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lineas.length === 0) return [];
  const [encabezado, ...resto] = lineas.map(dividirLinea);
  return resto.map((celdas) =>
    Object.fromEntries(encabezado.map((h, i) => [h.trim(), celdas[i] ?? ''])),
  );
}

function dividirLinea(linea) {
  const celdas = [];
  let actual = '';
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"' && entreComillas && linea[i + 1] === '"') {
      actual += '"';
      i++;
    } else if (c === '"') {
      entreComillas = !entreComillas;
    } else if (c === ',' && !entreComillas) {
      celdas.push(actual);
      actual = '';
    } else {
      actual += c;
    }
  }
  celdas.push(actual);
  return celdas;
}

export const normalizarCodigo = (s) => String(s ?? '').trim().toUpperCase();

export const normalizarCodigoCie10 = (s) => normalizarCodigo(s).replaceAll('.', '');

export function normalizarSexo(s) {
  const v = normalizarCodigo(s);
  return ['M', 'F', 'Z'].includes(v) ? v : null;
}

export function aBool(s) {
  const v = String(s ?? '').trim().toLowerCase();
  if (['si', 'sí', 's', 'true', '1'].includes(v)) return true;
  if (['no', 'n', 'false', '0'].includes(v)) return false;
  return null;
}

const texto = (s) => String(s ?? '').trim();
const aNull = (s) => texto(s) || null;

function normalizar(filasRaw, construir) {
  const rows = [];
  let descartadas = 0;
  for (const fila of filasRaw) {
    const row = construir(fila);
    if (row.codigo && row.descripcion) rows.push(row);
    else descartadas++;
  }
  return { rows, descartadas };
}

export function normalizarCie10(filasRaw, mapa, version) {
  return normalizar(filasRaw, (f) => ({
    codigo: normalizarCodigoCie10(f[mapa.codigo]),
    descripcion: texto(f[mapa.descripcion]),
    capitulo: aNull(f[mapa.capitulo]),
    activo: true,
    version,
  }));
}

export function normalizarCups(filasRaw, mapa, version) {
  return normalizar(filasRaw, (f) => ({
    codigo: normalizarCodigo(f[mapa.codigo]),
    descripcion: texto(f[mapa.descripcion]),
    sexo: normalizarSexo(f[mapa.sexo]),
    ambito: aNull(f[mapa.ambito]),
    quirurgico: aBool(f[mapa.quirurgico]),
    activo: true,
    version,
  }));
}
