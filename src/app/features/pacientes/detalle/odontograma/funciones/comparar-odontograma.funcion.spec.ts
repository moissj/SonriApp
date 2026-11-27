import { dientesConCambios, EstadoOdontograma } from './comparar-odontograma.funcion';

const base = (): EstadoOdontograma => ({
  superficies: [{ pieza: '11', superficie: 'mesial', estado: 'caries' }],
  marcas: new Map([['21', ['nucleo' as const]]]),
});

describe('dientesConCambios', () => {
  it('estados iguales (aunque con "sano" extra) no tienen cambios', () => {
    const b = base();
    b.superficies.push({ pieza: '31', superficie: 'distal', estado: 'sano' });
    expect(dientesConCambios(base(), b)).toEqual([]);
  });

  it('detecta superficie y marca distintas, ordenadas por FDI', () => {
    const b = base();
    b.superficies[0].estado = 'resina';
    b.marcas.set('18', ['ausente']);
    b.marcas.delete('21');
    expect(dientesConCambios(base(), b)).toEqual(['11', '18', '21']);
  });
});
