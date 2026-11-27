import { aplicarToggle, conflictos } from './compatibilidad-hallazgos';
import type { MarcaDiente } from '../../../../../core/services/odontograma.service';

describe('compatibilidad-hallazgos', () => {
  it('sano choca con cualquier otra marca (ambos sentidos)', () => {
    expect(conflictos(['nucleo', 'pontico'], 'sano')).toEqual(['nucleo', 'pontico']);
    expect(aplicarToggle(['sano'], 'erosion')).toEqual(['erosion']);
  });

  it('endo_realizada y endo_indicada son excluyentes', () => {
    expect(aplicarToggle(['endo_realizada'], 'endo_indicada')).toEqual(['endo_indicada']);
    expect(aplicarToggle(['endo_indicada'], 'endo_realizada')).toEqual(['endo_realizada']);
  });

  it('ausente retira corona/endo/sellante/nucleo/sano', () => {
    const previas: MarcaDiente[] = ['corona_acero', 'endo_realizada', 'sellante_indicado', 'nucleo', 'sano', 'erosion'];
    expect(aplicarToggle(previas, 'ausente')).toEqual(['erosion', 'ausente']);
  });

  it('ausente es compatible con pontico y protesis removible', () => {
    expect(aplicarToggle(['ausente', 'pontico'], 'protesis_removible')).toEqual(['ausente', 'pontico', 'protesis_removible']);
    expect(conflictos(['pontico', 'protesis_removible'], 'ausente')).toEqual([]);
  });

  it('agregar nucleo a pieza ausente retira ausente', () => {
    expect(aplicarToggle(['ausente'], 'nucleo')).toEqual(['nucleo']);
  });

  it('simbolos coexisten sin duplicar; toggle de una activa la quita', () => {
    expect(aplicarToggle(['obt_temporal'], 'superficie_sellada')).toEqual(['obt_temporal', 'superficie_sellada']);
    expect(aplicarToggle(['obt_temporal', 'nucleo'], 'nucleo')).toEqual(['obt_temporal']);
  });

  it('no muta la entrada', () => {
    const entrada: MarcaDiente[] = ['sano'];
    aplicarToggle(entrada, 'erosion');
    expect(entrada).toEqual(['sano']);
  });
});
