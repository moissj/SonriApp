import { enSegmento, esActivo, esDelMesActual } from './segmentos.funcion';

const AHORA = new Date('2026-11-25T15:00:00Z');

describe('segmentos pacientes', () => {
  it('esActivo', () => {
    expect(esActivo('2026-09-01T10:00:00Z', AHORA)).toBe(true);
    expect(esActivo('2026-01-01T10:00:00Z', AHORA)).toBe(false);
    expect(esActivo(null, AHORA)).toBe(false);
  });
  it('enSegmento', () => {
    const l = [{ ultima_cita: '2026-10-01T10:00:00Z' }, { ultima_cita: null }];
    expect(enSegmento(l, 'todos', AHORA).length).toBe(2);
    expect(enSegmento(l, 'activos', AHORA).length).toBe(1);
    expect(enSegmento(l, 'inactivos', AHORA)[0].ultima_cita).toBeNull();
  });
  it('esDelMesActual usa Bogota', () => {
    expect(esDelMesActual('2026-11-03T12:00:00Z', AHORA)).toBe(true);
    // 01 dic 03:00Z = 30 nov 22:00 Bogota
    expect(esDelMesActual('2026-12-01T03:00:00Z', AHORA)).toBe(true);
    expect(esDelMesActual('2026-10-31T12:00:00Z', AHORA)).toBe(false);
    expect(esDelMesActual(undefined, AHORA)).toBe(false);
  });
});
