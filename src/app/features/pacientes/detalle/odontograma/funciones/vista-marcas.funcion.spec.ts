import { vistaDePieza } from './vista-marcas.funcion';

describe('vistaDePieza', () => {
  it('sin marcas: vacio', () => {
    expect(vistaDePieza([])).toEqual({ recuadro: [], figuras: [], titulo: '' });
  });

  it('separa figura (endo) de recuadro y respeta orden del catalogo', () => {
    const v = vistaDePieza(['nucleo', 'endo_indicada', 'sano']);
    expect(v.figuras.map((f) => f.id)).toEqual(['endo_indicada']);
    expect(v.recuadro.map((r) => r.simbolo)).toEqual(['S', 'N']);
  });

  it('muchas marcas: caben en el ancho del recuadro con fuente menor', () => {
    const v = vistaDePieza(['sano', 'corona_acero', 'nucleo', 'pontico', 'erosion', 'obt_temporal', 'sin_erupcionar']);
    expect(v.recuadro.length).toBe(7);
    expect(v.recuadro.every((r) => Math.abs(r.x) <= 20 && r.fontSize === 6)).toBe(true);
  });

  it('formas sin letra conservan forma', () => {
    expect(vistaDePieza(['protesis_removible']).recuadro[0].forma).toBe('barra-gruesa');
  });
});
