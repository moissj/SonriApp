import { calcularIndices, EntradaIndice } from './indice-cop.funcion';

const vacio = (): EntradaIndice => ({ superficies: [], marcas: new Map() });

describe('calcularIndices', () => {
  it('sin datos devuelve ceros', () => {
    const r = calcularIndices(vacio());
    expect(r.cop).toEqual({ C: 0, O: 0, P: 0, total: 0 });
    expect(r.ceo).toEqual({ c: 0, e: 0, o: 0, total: 0 });
  });

  it('cuenta C, O y P en permanentes, un diente una sola vez', () => {
    const e = vacio();
    e.superficies = [
      { pieza: '11', estado: 'caries' },
      { pieza: '11', estado: 'resina' }, // mismo diente: cuenta solo como C
      { pieza: '12', estado: 'amalgama' },
      { pieza: '13', estado: 'obt_desadaptada' },
      { pieza: '14', estado: 'ausente' },
    ];
    e.marcas.set('15', ['exodoncia_indicada']);
    e.marcas.set('16', ['ausente']);
    const { cop } = calcularIndices(e);
    expect(cop).toEqual({ C: 1, O: 2, P: 3, total: 6 });
  });

  it('ceo: cariado, extracción indicada y obturado; ausente temporal no cuenta', () => {
    const e = vacio();
    e.superficies = [
      { pieza: '51', estado: 'caries' },
      { pieza: '52', estado: 'resina' },
      { pieza: '53', estado: 'ausente' },
    ];
    e.marcas.set('54', ['exodoncia_indicada']);
    e.marcas.set('55', ['obt_temporal']);
    const { cop, ceo } = calcularIndices(e);
    expect(ceo).toEqual({ c: 1, e: 1, o: 2, total: 4 });
    expect(cop.total).toBe(0);
  });

  it('ignora dientes sanos', () => {
    const e = vacio();
    e.superficies = [{ pieza: '21', estado: 'sano' }];
    e.marcas.set('22', ['sano']);
    expect(calcularIndices(e).cop.total).toBe(0);
  });
});
