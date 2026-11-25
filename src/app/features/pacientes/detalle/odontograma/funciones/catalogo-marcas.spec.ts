import { CATALOGO_MARCAS, letrasDeMarcas } from './catalogo-marcas';
import { agruparMarcasPorPieza } from '../../../../../core/funciones/marcas-odontograma.funcion';
import type { MarcaDiente, MarcaOdontograma } from '../../../../../core/services/odontograma.service';

const fila = (pieza: string, marca: MarcaDiente): MarcaOdontograma => ({
  id: `${pieza}-${marca}`,
  odontologo_id: 'o1',
  paciente_id: 'p1',
  pieza,
  marca,
  notas: null,
  fecha: '2026-01-01',
});

describe('catalogo-marcas', () => {
  it('tiene las 5 marcas con letra y color', () => {
    expect(CATALOGO_MARCAS.map((c) => c.letra)).toEqual(['OT', 'X', 'S', 'C', 'N']);
    expect(CATALOGO_MARCAS.every((c) => /^#[0-9a-f]{6}$/.test(c.color))).toBe(true);
  });

  it('letrasDeMarcas: vacio -> []', () => {
    expect(letrasDeMarcas([])).toEqual([]);
  });

  it('letrasDeMarcas: ordena segun catalogo', () => {
    expect(letrasDeMarcas(['nucleo', 'obt_temporal']).map((l) => l.letra)).toEqual(['OT', 'N']);
  });

  it('letrasDeMarcas: ignora desconocidas', () => {
    expect(letrasDeMarcas(['zzz' as MarcaDiente])).toEqual([]);
  });

  it('mapeo marcas -> render con varias marcas en un diente', () => {
    const porPieza = agruparMarcasPorPieza([fila('11', 'nucleo'), fila('11', 'corona_acero'), fila('21', 'incluido_semi')]);
    expect(letrasDeMarcas(porPieza.get('11') ?? []).map((l) => l.letra)).toEqual(['C', 'N']);
    expect(letrasDeMarcas(porPieza.get('21') ?? []).map((l) => l.letra)).toEqual(['X']);
    expect(letrasDeMarcas(porPieza.get('99') ?? [])).toEqual([]);
  });
});
