import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsearCsv, normalizarCodigoCie10, normalizarSexo, aBool, normalizarCie10, normalizarCups,
} from './parsear-catalogo.mjs';

const mapaCie = { codigo: 'cod', descripcion: 'desc', capitulo: 'cap' };
const mapaCups = { codigo: 'cod', descripcion: 'desc', sexo: 'sexo', ambito: 'amb', quirurgico: 'qx' };

test('parsearCsv maneja comillas, comas internas y CRLF', () => {
  const filas = parsearCsv('cod,desc\r\nX001,"Algo, con coma"\r\nX002,"Dice ""hola"""\r\n');
  assert.deepEqual(filas, [
    { cod: 'X001', desc: 'Algo, con coma' },
    { cod: 'X002', desc: 'Dice "hola"' },
  ]);
});

test('normalizarCodigoCie10 quita punto y pone mayúsculas', () => {
  assert.equal(normalizarCodigoCie10(' x00.1 '), 'X001');
});

test('normalizarCie10 descarta filas sin codigo o descripcion y cuenta', () => {
  const raw = [
    { cod: 'x00.1', desc: ' Uno ', cap: 'I' },
    { cod: '', desc: 'Sin código', cap: '' },
    { cod: 'X002', desc: '', cap: '' },
    { cod: '', desc: '', cap: '' },
  ];
  const { rows, descartadas } = normalizarCie10(raw, mapaCie, 'v1');
  assert.equal(descartadas, 3);
  assert.deepEqual(rows, [
    { codigo: 'X001', descripcion: 'Uno', capitulo: 'I', activo: true, version: 'v1' },
  ]);
});

test('habilitado mapea a activo (NO->false, SI->true, ausente->true)', () => {
  const mapa = { ...mapaCie, habilitado: 'hab' };
  const raw = [
    { cod: 'X001', desc: 'a', hab: 'NO' },
    { cod: 'X002', desc: 'b', hab: 'SI' },
    { cod: 'X003', desc: 'c' },
  ];
  const activos = normalizarCie10(raw, mapa, 'v1').rows.map((r) => r.activo);
  assert.deepEqual(activos, [false, true, true]);
  const cups = normalizarCups([{ cod: 'Y001', desc: 'p', hab: 'N' }], { ...mapaCups, habilitado: 'hab' }, 'v1');
  assert.equal(cups.rows[0].activo, false);
});

test('normalizarSexo y aBool', () => {
  assert.equal(normalizarSexo('f'), 'F');
  assert.equal(normalizarSexo('Z'), 'Z');
  assert.equal(normalizarSexo(''), null);
  assert.equal(normalizarSexo('otro'), null);
  assert.equal(aBool('SI'), true);
  assert.equal(aBool('n'), false);
  assert.equal(aBool('1'), true);
  assert.equal(aBool('false'), false);
  assert.equal(aBool(''), null);
});

test('normalizarCups arma fila completa y es idempotente en forma', () => {
  const raw = [{ cod: ' y001 ', desc: 'Proc', sexo: 'm', amb: 'A', qx: 'NO' }, { cod: '', desc: 'x' }];
  const a = normalizarCups(raw, mapaCups, 'v2');
  const b = normalizarCups(raw, mapaCups, 'v2');
  assert.deepEqual(a, b);
  assert.equal(a.descartadas, 1);
  assert.deepEqual(a.rows[0], {
    codigo: 'Y001', descripcion: 'Proc', sexo: 'M', ambito: 'A', quirurgico: false, activo: true, version: 'v2',
  });
});
