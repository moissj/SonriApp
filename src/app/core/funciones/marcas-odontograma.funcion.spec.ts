import { agruparMarcasPorPieza, filaAMarca } from './marcas-odontograma.funcion';

describe('marcas-odontograma.funcion', () => {
  const base = { id: 'm1', odontologo_id: 'o1', paciente_id: 'p1', pieza: '11', marca: 'nucleo', fecha: '2026-11-25' };

  it('filaAMarca normaliza notas nulas y omite updated_at ausente', () => {
    const m = filaAMarca(base);
    expect(m.notas).toBeNull();
    expect('updated_at' in m).toBe(false);
    expect(m.marca).toBe('nucleo');
  });

  it('filaAMarca conserva notas y updated_at', () => {
    const m = filaAMarca({ ...base, notas: 'x', updated_at: '2026-11-25T10:00:00Z' });
    expect(m.notas).toBe('x');
    expect(m.updated_at).toBe('2026-11-25T10:00:00Z');
  });

  it('agruparMarcasPorPieza agrupa por pieza', () => {
    const a = filaAMarca(base);
    const b = filaAMarca({ ...base, id: 'm2', marca: 'corona_acero' });
    const c = filaAMarca({ ...base, id: 'm3', pieza: '21', marca: 'obt_temporal' });
    const g = agruparMarcasPorPieza([a, b, c]);
    expect(g.get('11')).toEqual(['nucleo', 'corona_acero']);
    expect(g.get('21')).toEqual(['obt_temporal']);
  });
});
