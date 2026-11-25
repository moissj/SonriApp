import { afterEach, describe, expect, it, vi } from 'vitest';
import { aFechaBogota, fechaLargaBogota, hoyBogota } from './fecha-bogota.funcion';

describe('fecha-bogota', () => {
  afterEach(() => vi.useRealTimers());

  it('hoyBogota no salta de día de noche (UTC+1 día)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-25T04:30:00Z'));
    expect(hoyBogota()).toBe('2026-11-24');
  });

  it('aFechaBogota convierte desde UTC', () => {
    expect(aFechaBogota(new Date('2026-11-25T02:00:00Z'))).toBe('2026-11-24');
  });

  it('fechaLargaBogota da formato colombiano', () => {
    expect(fechaLargaBogota(new Date('2026-11-24T17:00:00Z'))).toBe('martes, 24 de noviembre de 2026');
  });
});
