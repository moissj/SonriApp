import { ventanaManana } from './ventana-manana.funcion';

describe('ventanaManana', () => {
  it('devuelve el día siguiente en Bogota', () => {
    const r = ventanaManana(new Date('2026-07-07T18:00:00-05:00'));
    expect(r.inicio).toBe('2026-07-08T00:00:00-05:00');
    expect(r.fin).toBe('2026-07-08T23:59:59.999-05:00');
  });

  it('no salta de día por UTC cerca de medianoche Bogota', () => {
    // 23:30 Bogota del 7 = 04:30 UTC del 8
    const r = ventanaManana(new Date('2026-07-07T23:30:00-05:00'));
    expect(r.inicio).toBe('2026-07-08T00:00:00-05:00');
  });

  it('cruza fin de mes', () => {
    const r = ventanaManana(new Date('2026-07-31T10:00:00-05:00'));
    expect(r.inicio).toBe('2026-08-01T00:00:00-05:00');
  });
});
